import crypto from "crypto";
import { CREDIT_PLANS, publicCreditPlans } from "../constants/creditPlans.js";
import { Payment } from "../models/payment.model.js";
import { User } from "../models/user.model.js";
import { CreditTransaction } from "../models/creditTransaction.model.js";
import { getRazorpay } from "../utils/razorpay.js";
import { sanitizeUser } from "../utils/sanitizeUser.js";

const safeSignatureEqual = (expected, received) => {
    const left = Buffer.from(expected, "utf8");
    const right = Buffer.from(received, "utf8");
    return left.length === right.length && crypto.timingSafeEqual(left, right);
};

export const getPlans = async (req, res) => {
    return res.status(200).json({ success: true, plans: publicCreditPlans() });
};

export const createOrder = async (req, res) => {
    const plan = CREDIT_PLANS[req.body.planId];
    const user = await User.findById(req.id).select("role");

    if (!user || user.role !== "student") {
        return res.status(403).json({ success: false, message: "Credit packs are available only for job seekers" });
    }

    const order = await getRazorpay().orders.create({
        amount: plan.amount,
        currency: plan.currency,
        receipt: `jobsync_${Date.now()}_${req.id.toString().slice(-6)}`,
        notes: {
            userId: req.id.toString(),
            planId: plan.id,
            credits: String(plan.credits)
        }
    });

    await Payment.create({
        user: req.id,
        planId: plan.id,
        credits: plan.credits,
        amount: plan.amount,
        currency: plan.currency,
        razorpayOrderId: order.id
    });

    return res.status(201).json({
        success: true,
        key: process.env.RAZORPAY_KEY_ID,
        order,
        plan: { ...plan, displayAmount: plan.amount / 100 }
    });
};

export const verifyPayment = async (req, res) => {
    const {
        razorpay_order_id: orderId,
        razorpay_payment_id: paymentId,
        razorpay_signature: signature
    } = req.body;

    const paymentRecord = await Payment.findOne({ razorpayOrderId: orderId, user: req.id });
    if (!paymentRecord) {
        return res.status(404).json({ success: false, message: "Payment order not found" });
    }

    const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(`${orderId}|${paymentId}`)
        .digest("hex");

    if (!safeSignatureEqual(expectedSignature, signature)) {
        paymentRecord.status = "failed";
        paymentRecord.failureReason = "Invalid payment signature";
        await paymentRecord.save();
        return res.status(400).json({ success: false, message: "Invalid payment signature" });
    }

    const razorpay = getRazorpay();
    let remotePayment = await razorpay.payments.fetch(paymentId);

    if (remotePayment.order_id !== orderId) {
        return res.status(400).json({ success: false, message: "Payment does not belong to this order" });
    }

    if (Number(remotePayment.amount) !== paymentRecord.amount || remotePayment.currency !== paymentRecord.currency) {
        return res.status(400).json({ success: false, message: "Payment amount or currency mismatch" });
    }

    if (remotePayment.status === "authorized") {
        remotePayment = await razorpay.payments.capture(paymentId, paymentRecord.amount, paymentRecord.currency);
    }

    if (remotePayment.status !== "captured") {
        return res.status(400).json({ success: false, message: "Payment has not been captured" });
    }

    if (paymentRecord.razorpayPaymentId && paymentRecord.razorpayPaymentId !== paymentId) {
        return res.status(409).json({ success: false, message: "This order is already linked to another payment" });
    }

    paymentRecord.razorpayPaymentId = paymentId;
    await paymentRecord.save();

    const creditedUser = await User.findOneAndUpdate(
        { _id: req.id, creditedPaymentIds: { $ne: paymentId } },
        {
            $inc: { aiCredits: paymentRecord.credits },
            $addToSet: { creditedPaymentIds: paymentId }
        },
        { new: true }
    );

    const user = creditedUser || await User.findById(req.id);

    if (creditedUser) {
        await CreditTransaction.findOneAndUpdate(
            { user: req.id, type: "CREDIT_PURCHASE", reference: paymentId },
            {
                $setOnInsert: {
                    amount: paymentRecord.credits,
                    balanceAfter: creditedUser.aiCredits,
                    description: `${paymentRecord.credits} AI credits purchased`
                }
            },
            { upsert: true }
        );
    }

    paymentRecord.status = "paid";
    paymentRecord.creditedAt ??= new Date();
    paymentRecord.failureReason = "";
    await paymentRecord.save();

    return res.status(200).json({
        success: true,
        message: creditedUser ? `${paymentRecord.credits} AI credits added successfully` : "Payment was already verified",
        user: sanitizeUser(user),
        payment: paymentRecord
    });
};

export const getPaymentHistory = async (req, res) => {
    const payments = await Payment.find({ user: req.id }).sort({ createdAt: -1 }).lean();
    const transactions = await CreditTransaction.find({ user: req.id }).sort({ createdAt: -1 }).limit(100).lean();
    return res.status(200).json({ success: true, payments, transactions });
};
