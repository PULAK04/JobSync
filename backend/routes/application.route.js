import { Router } from "express";
import { applyJob, getAppliedJobs, getApplicants, downloadApplicantResume, updateStatus } from "../controllers/application.controller.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import { isAuthenticated } from "../middlewares/isAuthenticated.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.js";
import { validate } from "../middlewares/validate.js";
import { statusSchema } from "../validators/job.validator.js";

const router = Router();

router.get("/apply/:id", isAuthenticated, authorizeRoles("student"), asyncHandler(applyJob));
router.post("/apply/:id", isAuthenticated, authorizeRoles("student"), asyncHandler(applyJob));
router.get("/get", isAuthenticated, authorizeRoles("student"), asyncHandler(getAppliedJobs));
router.get("/:id/applicants", isAuthenticated, authorizeRoles("recruiter"), asyncHandler(getApplicants));
router.get("/:id/resume/download", isAuthenticated, authorizeRoles("recruiter"), asyncHandler(downloadApplicantResume));
router.post("/status/:id/update", isAuthenticated, authorizeRoles("recruiter"), validate(statusSchema), asyncHandler(updateStatus));

export default router;
