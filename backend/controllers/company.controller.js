import { Company } from "../models/company.model.js";
import { User } from "../models/user.model.js";
import cloudinary from "../utils/cloudinary.js";
import { getDataUri } from "../utils/datauri.js";

export const registerCompany = async (req, res) => {
    const { companyName } = req.body;

    const existing = await Company.findOne({ name: companyName, userId: req.id });
    if (existing) {
        return res.status(409).json({ success: false, message: "You already created this company" });
    }

    const company = await Company.create({ name: companyName, userId: req.id });
    await User.findByIdAndUpdate(req.id, { "profile.company": company._id });

    return res.status(201).json({ success: true, message: "Company created successfully", company });
};

export const getCompany = async (req, res) => {
    const companies = await Company.find({ userId: req.id }).sort({ createdAt: -1 }).lean();
    return res.status(200).json({ success: true, companies });
};

export const getCompanyById = async (req, res) => {
    const company = await Company.findById(req.params.id).lean();
    if (!company) return res.status(404).json({ success: false, message: "Company not found" });
    return res.status(200).json({ success: true, company });
};

export const updateCompany = async (req, res) => {
    const company = await Company.findOne({ _id: req.params.id, userId: req.id });
    if (!company) {
        return res.status(404).json({ success: false, message: "Company not found or access denied" });
    }

    const { name, description, website, location } = req.body;
    if (name !== undefined) company.name = name;
    if (description !== undefined) company.description = description;
    if (website !== undefined) company.website = website;
    if (location !== undefined) company.location = location;

    if (req.file) {
        const fileUri = getDataUri(req.file);
        const upload = await cloudinary.uploader.upload(fileUri.content, {
            folder: "jobsync/company-logos",
            resource_type: "image"
        });
        company.logo = upload.secure_url;
    }

    await company.save();
    return res.status(200).json({ success: true, message: "Company updated successfully", company });
};
