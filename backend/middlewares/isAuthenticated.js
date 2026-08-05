import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export const isAuthenticated = (req, res, next) => {
    const token = req.cookies?.token;

    if (!token) {
        return res.status(401).json({
            success: false,
            code: "AUTH_REQUIRED",
            message: "Authentication required"
        });
    }

    try {
        const decoded = jwt.verify(token, env.jwtSecret);

        req.id = decoded.userId;
        req.role = decoded.role;

        return next();
    } catch {
        return res.status(401).json({
            success: false,
            code: "AUTH_SESSION_INVALID",
            message: "Invalid or expired session"
        });
    }
};