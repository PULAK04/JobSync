import rateLimit from "express-rate-limit";

const base = {
    standardHeaders: "draft-8",
    legacyHeaders: false,
    skip: (req) => process.env.NODE_ENV === "test"
};

export const authLimiter = rateLimit({
    ...base,
    windowMs: 15 * 60 * 1000,
    limit: 15,
    message: { success: false, message: "Too many authentication attempts. Try again later." }
});

export const otpLimiter = rateLimit({
    ...base,
    windowMs: 10 * 60 * 1000,
    limit: 8,
    message: { success: false, message: "Too many OTP requests. Try again later." }
});

export const aiLimiter = rateLimit({
    ...base,
    windowMs: 10 * 60 * 1000,
    limit: 10,
    message: { success: false, message: "Too many AI requests. Try again later." }
});

export const paymentLimiter = rateLimit({
    ...base,
    windowMs: 10 * 60 * 1000,
    limit: 20,
    message: { success: false, message: "Too many payment requests. Try again later." }
});
