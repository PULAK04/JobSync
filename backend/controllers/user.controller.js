import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { LoginOtp } from "../models/loginOtp.model.js";
import { CreditTransaction } from "../models/creditTransaction.model.js";
import { env } from "../config/env.js";
import { authCookieOptions, clearAuthCookieOptions } from "../utils/cookie.js";
import { createOtp, hashOtp, maskEmail } from "../utils/otp.js";
import { sendEmail } from "../utils/resend.js";
import { sanitizeUser } from "../utils/sanitizeUser.js";
import { sendResumeDownload } from "../utils/remoteFile.js";
import cloudinary from "../utils/cloudinary.js";
import { getDataUri } from "../utils/datauri.js";

const signAuthToken = (user) => jwt.sign(
    { userId: user._id.toString(), role: user.role },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn }
);

const signLoginToken = (user) => jwt.sign(
    { userId: user._id.toString(), purpose: "login-otp" },
    env.otpTokenSecret,
    { expiresIn: `${env.otpExpiryMinutes}m` }
);

const setAuthenticatedSession = (res, user) => {
    const token = signAuthToken(user);
    res.cookie("token", token, authCookieOptions());
};

const createAndSendLoginOtp = async (user) => {
    const otp = createOtp();
    const expiresAt = new Date(Date.now() + env.otpExpiryMinutes * 60 * 1000);

    await LoginOtp.findOneAndUpdate(
        { user: user._id },
        {
            $set: {
                email: user.email,
                otpHash: hashOtp(otp),
                expiresAt,
                attempts: 0,
                consumedAt: null
            }
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    await sendEmail({
        to: user.email,
        subject: "Your JobSync login OTP",
        text: `Your JobSync login OTP is ${otp}. It expires in ${env.otpExpiryMinutes} minutes.`,
        html: `
            <div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;color:#111827">
                <h2 style="color:#111827">JobSync login verification</h2>
                <p>Hi ${user.fullname},</p>
                <p>Use the following one-time password to log in:</p>
                <div style="font-size:30px;font-weight:700;letter-spacing:8px;padding:18px;background:#f3f4f6;border-radius:10px;text-align:center">${otp}</div>
                <p>This code expires in ${env.otpExpiryMinutes} minutes. Do not share it with anyone.</p>
                <p>If you did not try to log in, you can ignore this email.</p>
            </div>
        `
    });

    return otp;
};

export const register = async (req, res) => {
    const { fullname, email, phoneNumber, password, role } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
        return res.status(409).json({ success: false, message: "An account with this email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    let profilePhoto = "";

    if (req.file) {
        const fileUri = getDataUri(req.file);
        const upload = await cloudinary.uploader.upload(fileUri.content, {
            folder: "jobsync/profile-photos",
            resource_type: "image"
        });
        profilePhoto = upload.secure_url;
    }

    const user = await User.create({
        fullname,
        email,
        phoneNumber,
        password: hashedPassword,
        role,
        profile: { profilePhoto }
    });

    if (user.aiCredits > 0) {
        await CreditTransaction.create({
            user: user._id,
            type: "FREE_CREDITS",
            amount: user.aiCredits,
            balanceAfter: user.aiCredits,
            reference: `registration:${user._id}`,
            description: "Welcome credits"
        });
    }

    setAuthenticatedSession(res, user);

    return res.status(201).json({
        success: true,
        message: "Account created successfully",
        user: sanitizeUser(user)
    });
};

// Normal email + password login. OTP is not required for this path.
export const login = async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    setAuthenticatedSession(res, user);

    return res.status(200).json({
        success: true,
        requiresOtp: false,
        message: "Login successful",
        user: sanitizeUser(user)
    });
};

// Passwordless login option for users who forgot or prefer not to use their password.
export const requestLoginOtp = async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
        return res.status(404).json({ success: false, message: "No account was found with this email" });
    }

    const otp = await createAndSendLoginOtp(user);
    const loginToken = signLoginToken(user);

    return res.status(200).json({
        success: true,
        requiresOtp: true,
        loginToken,
        maskedEmail: maskEmail(user.email),
        message: "OTP sent to your registered email",
        ...(env.nodeEnv === "development" && env.devShowOtp ? { developmentOtp: otp } : {})
    });
};

export const verifyLoginOtp = async (req, res) => {
    const { loginToken, otp } = req.body;
    let decoded;

    try {
        decoded = jwt.verify(loginToken, env.otpTokenSecret);
    } catch {
        return res.status(401).json({ success: false, message: "Login verification session expired" });
    }

    if (decoded.purpose !== "login-otp") {
        return res.status(401).json({ success: false, message: "Invalid login verification token" });
    }

    const record = await LoginOtp.findOne({ user: decoded.userId });
    if (!record || record.consumedAt || record.expiresAt <= new Date()) {
        return res.status(400).json({ success: false, message: "OTP is invalid or expired" });
    }

    if (record.attempts >= env.otpMaxAttempts) {
        return res.status(429).json({ success: false, message: "Too many incorrect OTP attempts. Request a new OTP." });
    }

    if (record.otpHash !== hashOtp(otp)) {
        record.attempts += 1;
        await record.save();
        return res.status(400).json({ success: false, message: "Incorrect OTP" });
    }

    record.consumedAt = new Date();
    await record.save();

    const user = await User.findById(decoded.userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    setAuthenticatedSession(res, user);

    return res.status(200).json({
        success: true,
        message: "Login successful",
        user: sanitizeUser(user)
    });
};

export const resendLoginOtp = async (req, res) => {
    const { loginToken } = req.body;
    let decoded;

    try {
        decoded = jwt.verify(loginToken, env.otpTokenSecret);
    } catch {
        return res.status(401).json({ success: false, message: "Login verification session expired. Request a new OTP." });
    }

    if (decoded.purpose !== "login-otp") {
        return res.status(401).json({ success: false, message: "Invalid login verification token" });
    }

    const user = await User.findById(decoded.userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const otp = await createAndSendLoginOtp(user);

    return res.status(200).json({
        success: true,
        message: "A new OTP has been sent",
        ...(env.nodeEnv === "development" && env.devShowOtp ? { developmentOtp: otp } : {})
    });
};

export const logout = async (req, res) => {
    res.clearCookie("token", clearAuthCookieOptions());
    return res.status(200).json({ success: true, message: "Logged out successfully" });
};

export const getCurrentUser = async (req, res) => {
    const user = await User.findById(req.id).populate("savedJobs");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    return res.status(200).json({ success: true, user: sanitizeUser(user) });
};

export const updateProfile = async (req, res) => {
    const user = await User.findById(req.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const { fullname, email, phoneNumber, bio } = req.body;
    if (fullname !== undefined) user.fullname = fullname;
    if (email !== undefined) user.email = email;
    if (phoneNumber !== undefined) user.phoneNumber = phoneNumber;
    if (bio !== undefined) user.profile.bio = bio;

    if (req.body.skills !== undefined) {
        user.profile.skills = Array.isArray(req.body.skills)
            ? req.body.skills.map((item) => item.trim()).filter(Boolean)
            : req.body.skills.split(",").map((item) => item.trim()).filter(Boolean);
    }

    if (req.file) {
        const fileUri = getDataUri(req.file);
        const isPdf = req.file.mimetype === "application/pdf";
        const upload = await cloudinary.uploader.upload(fileUri.content, {
            folder: isPdf ? "jobsync/resumes" : "jobsync/profile-photos",
            resource_type: "auto"
        });

        if (isPdf) {
            user.profile.resume = upload.secure_url;
            user.profile.resumeOriginalName = req.file.originalname;
        } else {
            user.profile.profilePhoto = upload.secure_url;
        }
    }

    await user.save();
    return res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        user: sanitizeUser(user)
    });
};

export const downloadOwnResume = async (req, res) => {
    const user = await User.findById(req.id).select("profile.resume profile.resumeOriginalName").lean();
    if (!user?.profile?.resume) {
        return res.status(404).json({ success: false, message: "No resume is available for download" });
    }

    return sendResumeDownload(res, {
        resumeUrl: user.profile.resume,
        fileName: user.profile.resumeOriginalName || "resume.pdf"
    });
};

export const toggleSavedJob = async (req, res) => {
    const user = await User.findById(req.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const jobId = req.params.jobId;
    const exists = user.savedJobs.some((id) => id.toString() === jobId);

    if (exists) user.savedJobs.pull(jobId);
    else user.savedJobs.addToSet(jobId);

    await user.save();
    await user.populate("savedJobs");

    return res.status(200).json({
        success: true,
        message: exists ? "Job removed from saved jobs" : "Job saved successfully",
        user: sanitizeUser(user)
    });
};
