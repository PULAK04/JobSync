import mongoose from "mongoose";
import { Job } from "../models/job.model.js";
import { Company } from "../models/company.model.js";


const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const finiteNumber = (value) => {
    if (value === undefined || value === null || value === "") return null;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
};

const jobSorts = {
    newest: { createdAt: -1 },
    oldest: { createdAt: 1 },
    "salary-high": { salary: -1, createdAt: -1 },
    "salary-low": { salary: 1, createdAt: -1 },
    "experience-low": { experienceLevel: 1, createdAt: -1 },
    "experience-high": { experienceLevel: -1, createdAt: -1 }
};

const normalizeRequirements = (value) => Array.isArray(value)
    ? value.map((item) => String(item).trim()).filter(Boolean)
    : String(value || "").split(",").map((item) => item.trim()).filter(Boolean);

export const postJob = async (req, res) => {
    const { title, description, requirements, salary, experienceLevel, location, jobType, position, companyId } = req.body;

    if (!mongoose.isValidObjectId(companyId)) {
        return res.status(400).json({ success: false, message: "Invalid company ID" });
    }

    const company = await Company.findOne({ _id: companyId, userId: req.id });
    if (!company) {
        return res.status(403).json({ success: false, message: "You can post jobs only for your own company" });
    }

    const job = await Job.create({
        title,
        description,
        requirements: normalizeRequirements(requirements),
        salary,
        experienceLevel,
        location,
        jobType,
        position,
        company: companyId,
        created_by: req.id
    });

    await job.populate("company");
    return res.status(201).json({ success: true, message: "Job posted successfully", job });
};

export const getAllJobs = async (req, res) => {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 50);
    const skip = (page - 1) * limit;

    const keyword = String(req.query.keyword || "").trim();
    const location = String(req.query.location || "").trim();
    const jobType = String(req.query.jobType || "").trim();
    const minSalary = finiteNumber(req.query.minSalary);
    const maxSalary = finiteNumber(req.query.maxSalary);
    const minExperience = finiteNumber(req.query.minExperience);
    const maxExperience = finiteNumber(req.query.maxExperience);
    const sortKey = String(req.query.sort || "newest");

    const query = {};

    if (keyword) {
        const safeKeyword = escapeRegex(keyword);
        query.$or = [
            { title: { $regex: safeKeyword, $options: "i" } },
            { description: { $regex: safeKeyword, $options: "i" } },
            { requirements: { $regex: safeKeyword, $options: "i" } }
        ];
    }

    if (location) query.location = { $regex: escapeRegex(location), $options: "i" };
    if (jobType) query.jobType = jobType;

    if (minSalary !== null || maxSalary !== null) {
        query.salary = {};
        if (minSalary !== null) query.salary.$gte = minSalary;
        if (maxSalary !== null) query.salary.$lte = maxSalary;
    }

    if (minExperience !== null || maxExperience !== null) {
        query.experienceLevel = {};
        if (minExperience !== null) query.experienceLevel.$gte = minExperience;
        if (maxExperience !== null) query.experienceLevel.$lte = maxExperience;
    }

    const normalizedSortKey = jobSorts[sortKey] ? sortKey : "newest";
    const sort = jobSorts[normalizedSortKey];

    const [jobs, total] = await Promise.all([
        Job.find(query)
            .populate("company", "name description website location logo")
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .lean(),
        Job.countDocuments(query)
    ]);

    return res.status(200).json({
        success: true,
        jobs,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
        appliedFilters: {
            keyword,
            location,
            jobType,
            minSalary,
            maxSalary,
            minExperience,
            maxExperience,
            sort: normalizedSortKey
        }
    });
};

export const getJobById = async (req, res) => {
    const job = await Job.findById(req.params.id)
        .populate("company", "name description website location logo")
        .populate("applications");

    if (!job) return res.status(404).json({ success: false, message: "Job not found" });
    return res.status(200).json({ success: true, job });
};

export const getAdminJobs = async (req, res) => {
    const jobs = await Job.find({ created_by: req.id })
        .populate("company", "name logo location")
        .sort({ createdAt: -1 })
        .lean();
    return res.status(200).json({ success: true, jobs });
};

export const updateJob = async (req, res) => {
    const job = await Job.findOne({ _id: req.params.id, created_by: req.id });
    if (!job) return res.status(404).json({ success: false, message: "Job not found or access denied" });

    const fields = ["title", "description", "salary", "experienceLevel", "location", "jobType", "position"];
    fields.forEach((field) => {
        if (req.body[field] !== undefined) job[field] = req.body[field];
    });
    if (req.body.requirements !== undefined) job.requirements = normalizeRequirements(req.body.requirements);

    await job.save();
    await job.populate("company");
    return res.status(200).json({ success: true, message: "Job updated successfully", job });
};

export const deleteJob = async (req, res) => {
    const job = await Job.findOneAndDelete({ _id: req.params.id, created_by: req.id });
    if (!job) return res.status(404).json({ success: false, message: "Job not found or access denied" });
    return res.status(200).json({ success: true, message: "Job deleted successfully" });
};
