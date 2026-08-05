import { Router } from "express";
import { registerCompany, getCompany, getCompanyById, updateCompany } from "../controllers/company.controller.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import { isAuthenticated } from "../middlewares/isAuthenticated.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.js";
import { singleUpload } from "../middlewares/multer.js";
import { validate } from "../middlewares/validate.js";
import { createCompanySchema, updateCompanySchema } from "../validators/company.validator.js";

const router = Router();
const recruiterOnly = [isAuthenticated, authorizeRoles("recruiter")];

router.post("/register", ...recruiterOnly, validate(createCompanySchema), asyncHandler(registerCompany));
router.get("/get", ...recruiterOnly, asyncHandler(getCompany));
router.get("/get/:id", isAuthenticated, asyncHandler(getCompanyById));
router.put("/update/:id", ...recruiterOnly, singleUpload, validate(updateCompanySchema), asyncHandler(updateCompany));

export default router;
