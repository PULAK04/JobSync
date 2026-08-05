import { User } from "../models/user.model.js";
import { InterviewReport } from "../models/interviewReport.model.js";
import { CreditTransaction } from "../models/creditTransaction.model.js";
import { env } from "../config/env.js";
import { createFingerprint } from "../utils/fingerprint.js";
import { getCache, setCache, deleteCache } from "../utils/redis.js";
import { extractPdfTextFromUrl } from "../services/pdfText.service.js";
import { assertGroqConfigured, generateInterviewReport, generateResumePdf } from "../services/ai.service.js";

const REPORT_TTL = 60 * 60 * 24;
const HISTORY_TTL = 60 * 10;
const PDF_TTL = 60 * 60;
const PROMPT_VERSION = "v1";

const recordCredit = async ({ userId, type, amount, balanceAfter, reference, description }) => {
    try {
        await CreditTransaction.findOneAndUpdate(
            { user: userId, type, reference },
            { $setOnInsert: { amount, balanceAfter, description } },
            { upsert: true, new: true }
        );
    } catch (error) {
        console.error("Credit ledger write failed:", error.message);
    }
};

const refundCredit = async ({ userId, amount, reference }) => {
    const user = await User.findByIdAndUpdate(userId, { $inc: { aiCredits: amount } }, { new: true });
    if (user) {
        await recordCredit({
            userId,
            type: "AI_MATCH_REFUND",
            amount,
            balanceAfter: user.aiCredits,
            reference,
            description: "AI Match generation failed; reserved credits refunded"
        });
    }
};

export const generateAiMatchReportController = async (req, res) => {
    const { jobTitle, jobDescription, selfDescription } = req.body;
    const user = await User.findById(req.id);

    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    if (user.role !== "student") {
        return res.status(403).json({ success: false, message: "AI Match is available only for job seekers" });
    }

    const resumeUrl = user.profile?.resume;
    if (!resumeUrl) {
        return res.status(400).json({ success: false, message: "Upload a PDF resume in your profile before using AI Match" });
    }

    // Fail before reserving a credit when the local Groq configuration is missing.
    assertGroqConfigured();

    const fingerprint = createFingerprint({
        userId: req.id,
        jobTitle,
        jobDescription,
        selfDescription,
        resumeUrl,
        promptVersion: PROMPT_VERSION,
        model: env.groqModel
    });

    const cacheKey = `report:${req.id}:${fingerprint}`;
    const cached = await getCache(cacheKey);
    if (cached) {
        return res.status(200).json({
            success: true,
            message: "Existing AI Match Report loaded",
            report: JSON.parse(cached),
            aiCredits: user.aiCredits,
            cached: true,
            creditDeducted: false
        });
    }

    const existing = await InterviewReport.findOne({ user: req.id, fingerprint }).lean();
    if (existing) {
        await setCache(cacheKey, JSON.stringify(existing), REPORT_TTL);
        return res.status(200).json({
            success: true,
            message: "Existing AI Match Report loaded",
            report: existing,
            aiCredits: user.aiCredits,
            cached: true,
            creditDeducted: false
        });
    }

    const cost = env.aiMatchCreditCost;
    const chargedUser = await User.findOneAndUpdate(
        { _id: req.id, aiCredits: { $gte: cost } },
        { $inc: { aiCredits: -cost } },
        { new: true }
    );

    if (!chargedUser) {
        return res.status(402).json({
            success: false,
            code: "INSUFFICIENT_CREDITS",
            message: "You do not have enough AI credits. Purchase a credit pack to continue."
        });
    }

    const usageReference = `ai-match:${fingerprint}`;
    await recordCredit({
        userId: req.id,
        type: "AI_MATCH_USAGE",
        amount: -cost,
        balanceAfter: chargedUser.aiCredits,
        reference: usageReference,
        description: `AI Match Report for ${jobTitle}`
    });

    try {
        const resumeText = await extractPdfTextFromUrl(resumeUrl);
        const generated = await generateInterviewReport({
            jobTitle,
            resume: resumeText,
            selfDescription,
            jobDescription
        });

        const report = await InterviewReport.create({
            user: req.id,
            fingerprint,
            jobTitle,
            jobDescription,
            selfDescription,
            resumeUrl,
            ...generated,
            model: env.groqModel,
            promptVersion: PROMPT_VERSION
        });

        const plainReport = report.toObject();
        await Promise.all([
            setCache(cacheKey, JSON.stringify(plainReport), REPORT_TTL),
            deleteCache(`history:${req.id}`)
        ]);

        return res.status(201).json({
            success: true,
            message: "AI Match Report generated successfully",
            report: plainReport,
            aiCredits: chargedUser.aiCredits,
            cached: false,
            creditDeducted: true
        });
    } catch (error) {
        await refundCredit({ userId: req.id, amount: cost, reference: `refund:${fingerprint}` });

        if (error.code === 11000) {
            const duplicate = await InterviewReport.findOne({ user: req.id, fingerprint }).lean();
            if (duplicate) {
                const latestUser = await User.findById(req.id).select("aiCredits");
                return res.status(200).json({
                    success: true,
                    message: "Existing AI Match Report loaded",
                    report: duplicate,
                    aiCredits: latestUser?.aiCredits ?? 0,
                    cached: true,
                    creditDeducted: false
                });
            }
        }

        throw error;
    }
};

export const getInterviewReportsController = async (req, res) => {
    const cacheKey = `history:${req.id}`;
    const cached = await getCache(cacheKey);
    if (cached) return res.status(200).json({ success: true, reports: JSON.parse(cached), cached: true });

    const reports = await InterviewReport.find({ user: req.id }).sort({ createdAt: -1 }).lean();
    await setCache(cacheKey, JSON.stringify(reports), HISTORY_TTL);
    return res.status(200).json({ success: true, reports, cached: false });
};

export const getInterviewReportByIdController = async (req, res) => {
    const report = await InterviewReport.findOne({ _id: req.params.interviewId, user: req.id }).lean();
    if (!report) return res.status(404).json({ success: false, message: "AI Match Report not found" });
    return res.status(200).json({ success: true, report });
};

export const generateResumePdfController = async (req, res) => {
    const { interviewReportId } = req.params;
    const cacheKey = `resume-pdf:${req.id}:${interviewReportId}`;
    const cachedPdf = await getCache(cacheKey);

    if (cachedPdf) {
        const pdfBuffer = Buffer.from(cachedPdf, "base64");
        res.set({
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename=jobsync_resume_${interviewReportId}.pdf`,
            "Content-Length": pdfBuffer.length,
            "X-Cache": "HIT"
        });
        return res.end(pdfBuffer);
    }

    const report = await InterviewReport.findOne({ _id: interviewReportId, user: req.id }).lean();
    if (!report) return res.status(404).json({ success: false, message: "AI Match Report not found" });

    const resumeText = await extractPdfTextFromUrl(report.resumeUrl);
    const pdfBuffer = await generateResumePdf({
        jobTitle: report.jobTitle,
        resume: resumeText,
        selfDescription: report.selfDescription,
        jobDescription: report.jobDescription
    });

    await setCache(cacheKey, pdfBuffer.toString("base64"), PDF_TTL);

    res.set({
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=jobsync_resume_${interviewReportId}.pdf`,
        "Content-Length": pdfBuffer.length,
        "X-Cache": "MISS"
    });
    return res.end(pdfBuffer);
};
