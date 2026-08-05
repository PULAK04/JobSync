import mongoose from "mongoose";

const companySchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        description: { type: String, default: "" },
        website: { type: String, default: "" },
        location: { type: String, default: "" },
        logo: { type: String, default: "" },
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true }
    },
    { timestamps: true }
);

companySchema.index({ name: 1, userId: 1 }, { unique: true });

export const Company = mongoose.model("Company", companySchema);
