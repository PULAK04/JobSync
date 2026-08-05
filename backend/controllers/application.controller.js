import mongoose from "mongoose";
import { Application } from "../models/application.model.js";
import { Job } from "../models/job.model.js";
import { sendEmail } from "../utils/resend.js";
import { sendResumeDownload } from "../utils/remoteFile.js";

export const applyJob = async (req, res) => {
    const jobId = req.params.id;
    if (!mongoose.isValidObjectId(jobId)) {
        return res.status(400).json({ success: false, message: "Invalid job ID" });
    }

    const job = await Job.findById(jobId).select("_id");
    if (!job) return res.status(404).json({ success: false, message: "Job not found" });

    let application;
    try {
        application = await Application.create({ job: jobId, applicant: req.id });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({ success: false, message: "You have already applied for this job" });
        }
        throw error;
    }

    await Job.findByIdAndUpdate(jobId, { $addToSet: { applications: application._id } });
    return res.status(201).json({ success: true, message: "Job application submitted successfully", application });
};

export const getAppliedJobs = async (req, res) => {
    const applications = await Application.find({ applicant: req.id })
        .sort({ createdAt: -1 })
        .populate({
            path: "job",
            populate: { path: "company", select: "name logo location website" }
        })
        .lean();

    return res.status(200).json({ success: true, applications });
};

export const getApplicants = async (req, res) => {
    const job = await Job.findOne({ _id: req.params.id, created_by: req.id })
        .populate({
            path: "applications",
            options: { sort: { createdAt: -1 } },
            populate: {
                path: "applicant",
                select: "fullname email phoneNumber profile.bio profile.skills profile.resume profile.resumeOriginalName profile.profilePhoto"
            }
        })
        .lean();

    if (!job) {
        return res.status(404).json({ success: false, message: "Job not found or access denied" });
    }

    return res.status(200).json({ success: true, job });
};


export const downloadApplicantResume = async (req, res) => {
    const application = await Application.findById(req.params.id)
        .populate({
            path: "applicant",
            select: "profile.resume profile.resumeOriginalName fullname"
        })
        .populate({
            path: "job",
            select: "created_by"
        })
        .lean();

    if (!application) {
        return res.status(404).json({ success: false, message: "Application not found" });
    }

    if (application.job?.created_by?.toString() !== req.id) {
        return res.status(403).json({ success: false, message: "You cannot download resumes for another recruiter's job" });
    }

    const resumeUrl = application.applicant?.profile?.resume;
    if (!resumeUrl) {
        return res.status(404).json({ success: false, message: "Applicant has not uploaded a resume" });
    }

    return sendResumeDownload(res, {
        resumeUrl,
        fileName: application.applicant.profile.resumeOriginalName || `${application.applicant.fullname || "candidate"}_resume.pdf`
    });
};

const sendApplicationStatusEmail = async (application, status) => {
    const applicantEmail = application?.applicant?.email;
    if (!applicantEmail) return;

    const applicantName = application.applicant.fullname || "Candidate";
    const jobTitle = application.job?.title || "the applied role";
    const companyName = application.job?.company?.name || "the company";
    const accepted = status === "accepted";

    await sendEmail({
        to: applicantEmail,
        subject: accepted ? `Application Accepted - ${jobTitle}` : `Application Update - ${jobTitle}`,
        text: `Hi ${applicantName}, your application for ${jobTitle} at ${companyName} has been ${status}.`,
        html: `
            <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111827;max-width:600px;margin:auto">
                <h2>JobSync Application Update</h2>
                <p>Hi ${applicantName},</p>
                <p>Your application for <strong>${jobTitle}</strong> at <strong>${companyName}</strong> has been <strong>${status}</strong>.</p>
                ${accepted
                    ? "<p>Congratulations! The recruiter has shortlisted your application. Please watch your email for further communication.</p>"
                    : "<p>Thank you for applying. Keep improving your profile and exploring suitable opportunities on JobSync.</p>"}
                <p>Best regards,<br/>Team JobSync</p>
            </div>
        `
    });
};

export const updateStatus = async (req, res) => {
    const { status } = req.body;

    const application = await Application.findById(req.params.id)
        .populate({ path: "applicant", select: "fullname email" })
        .populate({
            path: "job",
            select: "title company created_by",
            populate: { path: "company", select: "name" }
        });

    if (!application) return res.status(404).json({ success: false, message: "Application not found" });

    if (application.job?.created_by?.toString() !== req.id) {
        return res.status(403).json({ success: false, message: "You cannot update applications for another recruiter's job" });
    }

    application.status = status;
    await application.save();

    // Respond immediately. Resend uses HTTPS, and an email failure does not roll back the status update.
    res.status(200).json({ success: true, message: `Application ${status} successfully`, application });

    void sendApplicationStatusEmail(application, status).catch((error) => {
        console.error("Application email failed:", error.message);
    });
};
