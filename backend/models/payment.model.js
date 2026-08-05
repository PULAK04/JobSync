import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
        planId: { type: String, required: true },
        credits: { type: Number, required: true, min: 1 },
        amount: { type: Number, required: true, min: 1 },
        currency: { type: String, default: "INR" },
        razorpayOrderId: { type: String, required: true, unique: true },
        razorpayPaymentId: { type: String, unique: true, sparse: true },
        status: {
            type: String,
            enum: ["created", "paid", "failed"],
            default: "created",
            index: true
        },
        failureReason: { type: String, default: "" },
        creditedAt: { type: Date, default: null }
    },
    { timestamps: true }
);

paymentSchema.index({ user: 1, createdAt: -1 });

export const Payment = mongoose.model("Payment", paymentSchema);
