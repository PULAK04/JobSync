import { z } from "zod";

export const registerSchema = z.object({
    fullname: z.string().trim().min(2).max(80),
    email: z.string().trim().email().toLowerCase(),
    phoneNumber: z.string().trim().max(20).optional().default(""),
    password: z.string().min(6).max(100),
    role: z.enum(["student", "recruiter"])
});

export const loginSchema = z.object({
    email: z.string().trim().email().toLowerCase(),
    password: z.string().min(1)
});

export const requestOtpSchema = z.object({
    email: z.string().trim().email().toLowerCase()
});

export const verifyOtpSchema = z.object({
    loginToken: z.string().min(10),
    otp: z.string().regex(/^\d{6}$/, "OTP must contain 6 digits")
});

export const resendOtpSchema = z.object({
    loginToken: z.string().min(10)
});

export const updateProfileSchema = z.object({
    fullname: z.string().trim().min(2).max(80).optional(),
    email: z.string().trim().email().toLowerCase().optional(),
    phoneNumber: z.string().trim().max(20).optional(),
    bio: z.string().trim().max(1500).optional(),
    skills: z.union([z.string(), z.array(z.string())]).optional()
});
