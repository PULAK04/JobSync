import mongoose from "mongoose";

const creditTransactionSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
        type: {
            type: String,
            enum: ["FREE_CREDITS", "CREDIT_PURCHASE", "AI_MATCH_USAGE", "AI_MATCH_REFUND"],
            required: true
        },
        amount: { type: Number, required: true },
        balanceAfter: { type: Number, required: true },
        reference: { type: String, default: "", index: true },
        description: { type: String, default: "" }
    },
    { timestamps: true }
);

creditTransactionSchema.index({ user: 1, createdAt: -1 });
creditTransactionSchema.index({ user: 1, type: 1, reference: 1 }, { unique: true });

export const CreditTransaction = mongoose.model("CreditTransaction", creditTransactionSchema);
