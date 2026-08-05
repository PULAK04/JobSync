import mongoose from "mongoose";

const interviewReportSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
        fingerprint: { type: String, required: true },
        jobTitle: { type: String, required: true },
        jobDescription: { type: String, required: true },
        selfDescription: { type: String, default: "" },
        resumeUrl: { type: String, required: true },
        title: { type: String, required: true },
        matchScore: { type: Number, required: true, min: 0, max: 100 },
        technicalQuestions: [{ type: String }],
        behavioralQuestions: [{ type: String }],
        skillGaps: [{ type: String }],
        preparationPlan: [{ type: String }],
        model: { type: String, default: "" },
        promptVersion: { type: String, default: "v1" }
    },
    { timestamps: true }
);

interviewReportSchema.index({ user: 1, fingerprint: 1 }, { unique: true });
interviewReportSchema.index({ user: 1, createdAt: -1 });

export const InterviewReport = mongoose.model("InterviewReport", interviewReportSchema);
