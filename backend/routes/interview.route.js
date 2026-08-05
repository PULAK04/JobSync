import { Router } from "express";
import {
    generateAiMatchReportController,
    getInterviewReportsController,
    getInterviewReportByIdController,
    generateResumePdfController
} from "../controllers/interview.controller.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import { isAuthenticated } from "../middlewares/isAuthenticated.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.js";
import { aiLimiter } from "../middlewares/rateLimits.js";
import { validate } from "../middlewares/validate.js";
import { generateReportSchema } from "../validators/interview.validator.js";

const router = Router();
const studentOnly = [isAuthenticated, authorizeRoles("student")];

router.post("/", ...studentOnly, aiLimiter, validate(generateReportSchema), asyncHandler(generateAiMatchReportController));
router.get("/", ...studentOnly, asyncHandler(getInterviewReportsController));
router.get("/report/:interviewId", ...studentOnly, asyncHandler(getInterviewReportByIdController));
router.post("/resume/pdf/:interviewReportId", ...studentOnly, aiLimiter, asyncHandler(generateResumePdfController));

export default router;
