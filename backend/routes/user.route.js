import { Router } from "express";
import {
    register,
    login,
    requestLoginOtp,
    verifyLoginOtp,
    resendLoginOtp,
    logout,
    getCurrentUser,
    updateProfile,
    downloadOwnResume,
    toggleSavedJob
} from "../controllers/user.controller.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import { isAuthenticated } from "../middlewares/isAuthenticated.js";
import { singleUpload } from "../middlewares/multer.js";
import { validate } from "../middlewares/validate.js";
import { authLimiter, otpLimiter } from "../middlewares/rateLimits.js";
import {
    registerSchema,
    loginSchema,
    requestOtpSchema,
    verifyOtpSchema,
    resendOtpSchema,
    updateProfileSchema
} from "../validators/auth.validator.js";

const router = Router();

router.post("/register", authLimiter, singleUpload, validate(registerSchema), asyncHandler(register));
router.post("/login", authLimiter, validate(loginSchema), asyncHandler(login));
router.post("/login/request-otp", otpLimiter, validate(requestOtpSchema), asyncHandler(requestLoginOtp));
router.post("/login/verify-otp", otpLimiter, validate(verifyOtpSchema), asyncHandler(verifyLoginOtp));
router.post("/login/resend-otp", otpLimiter, validate(resendOtpSchema), asyncHandler(resendLoginOtp));
router.get("/logout", asyncHandler(logout));
router.get("/me", isAuthenticated, asyncHandler(getCurrentUser));
router.get("/resume/download", isAuthenticated, asyncHandler(downloadOwnResume));
router.post("/profile/update", isAuthenticated, singleUpload, validate(updateProfileSchema), asyncHandler(updateProfile));
router.post("/saved-jobs/:jobId", isAuthenticated, asyncHandler(toggleSavedJob));

export default router;
