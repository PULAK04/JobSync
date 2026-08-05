import crypto from "crypto";
import { env } from "../config/env.js";

export const createOtp = () => crypto.randomInt(100000, 1000000).toString();

export const hashOtp = (otp) =>
    crypto.createHmac("sha256", env.otpPepper).update(String(otp)).digest("hex");

export const maskEmail = (email) => {
    const [local, domain] = email.split("@");
    const visible = local.slice(0, Math.min(2, local.length));
    return `${visible}${"*".repeat(Math.max(local.length - visible.length, 2))}@${domain}`;
};
