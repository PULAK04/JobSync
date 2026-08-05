import { Router } from "express";
import { getPlans, createOrder, verifyPayment, getPaymentHistory } from "../controllers/payment.controller.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import { isAuthenticated } from "../middlewares/isAuthenticated.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.js";
import { paymentLimiter } from "../middlewares/rateLimits.js";
import { validate } from "../middlewares/validate.js";
import { createOrderSchema, verifyPaymentSchema } from "../validators/payment.validator.js";

const router = Router();
const studentOnly = [isAuthenticated, authorizeRoles("student")];

router.get("/plans", asyncHandler(getPlans));
router.post("/create-order", ...studentOnly, paymentLimiter, validate(createOrderSchema), asyncHandler(createOrder));
router.post("/verify", ...studentOnly, paymentLimiter, validate(verifyPaymentSchema), asyncHandler(verifyPayment));
router.get("/history", ...studentOnly, asyncHandler(getPaymentHistory));

export default router;
