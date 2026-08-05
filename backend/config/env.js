const numberFromEnv = (value, fallback) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
};

export const env = {
    nodeEnv: process.env.NODE_ENV || "development",
    port: numberFromEnv(process.env.PORT, 8000),
    mongoUri: process.env.MONGO_URI || "mongodb://localhost:27017/jobsync",
    jwtSecret: process.env.JWT_SECRET || "development-jwt-secret",
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || "1d",
    otpTokenSecret: process.env.OTP_TOKEN_SECRET || "development-otp-token-secret",
    otpPepper: process.env.OTP_PEPPER || "development-otp-pepper",
    otpExpiryMinutes: numberFromEnv(process.env.OTP_EXPIRY_MINUTES, 10),
    otpMaxAttempts: numberFromEnv(process.env.OTP_MAX_ATTEMPTS, 5),
    devShowOtp: process.env.DEV_SHOW_OTP === "true",
    freeAiCredits: numberFromEnv(process.env.FREE_AI_CREDITS, 5),
    aiMatchCreditCost: numberFromEnv(process.env.AI_MATCH_CREDIT_COST, 1),
    frontendUrls: (process.env.FRONTEND_URLS || "http://localhost:5173")
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean),
    cookieSecure: process.env.COOKIE_SECURE === "true",
    cookieSameSite: process.env.COOKIE_SAME_SITE || "lax",
    redisUrl: process.env.REDIS_URL || "",
    groqModel: process.env.GROQ_MODEL || "openai/gpt-oss-120b"
};
