import { Router } from "express";
import { postJob, getAllJobs, getJobById, getAdminJobs, updateJob, deleteJob } from "../controllers/job.controller.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import { isAuthenticated } from "../middlewares/isAuthenticated.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.js";
import { validate } from "../middlewares/validate.js";
import { createJobSchema } from "../validators/job.validator.js";

const router = Router();
const recruiterOnly = [isAuthenticated, authorizeRoles("recruiter")];

router.post("/post", ...recruiterOnly, validate(createJobSchema), asyncHandler(postJob));
router.get("/get", asyncHandler(getAllJobs));
router.get("/getadminjobs", ...recruiterOnly, asyncHandler(getAdminJobs));
router.get("/get/:id", asyncHandler(getJobById));
router.put("/update/:id", ...recruiterOnly, asyncHandler(updateJob));
router.delete("/delete/:id", ...recruiterOnly, asyncHandler(deleteJob));

export default router;
