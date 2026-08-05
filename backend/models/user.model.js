import mongoose from "mongoose";
import { env } from "../config/env.js";

const profileSchema = new mongoose.Schema(
    {
        bio: { type: String, default: "" },
        skills: [{ type: String }],
        resume: { type: String, default: "" },
        resumeOriginalName: { type: String, default: "" },
        company: { type: mongoose.Schema.Types.ObjectId, ref: "Company", default: null },
        profilePhoto: { type: String, default: "" }
    },
    { _id: false }
);

const userSchema = new mongoose.Schema(
    {
        fullname: { type: String, required: true, trim: true },
        email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
        phoneNumber: { type: String, default: "", trim: true },
        password: { type: String, required: true, minlength: 6, select: false },
        role: {
            type: String,
            enum: ["student", "recruiter"],
            required: true,
            default: "student"
        },
        profile: { type: profileSchema, default: () => ({}) },
        savedJobs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Job" }],
        aiCredits: {
            type: Number,
            min: 0,
            default: function defaultCredits() {
                return this.role === "student" ? env.freeAiCredits : 0;
            }
        },
        creditedPaymentIds: { type: [String], select: false, default: [] }
    },
    { timestamps: true }
);

export const User = mongoose.model("User", userSchema);
