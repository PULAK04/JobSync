import mongoose from "mongoose";

const loginOtpSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
        email: { type: String, required: true },
        otpHash: { type: String, required: true },
        expiresAt: { type: Date, required: true, index: { expires: 0 } },
        attempts: { type: Number, default: 0 },
        consumedAt: { type: Date, default: null }
    },
    { timestamps: true }
);

export const LoginOtp = mongoose.model("LoginOtp", loginOtpSchema);
