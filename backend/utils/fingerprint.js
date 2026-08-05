import crypto from "crypto";

export const createFingerprint = (payload) =>
    crypto.createHash("sha256").update(JSON.stringify(payload)).digest("hex");
