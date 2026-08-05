import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import compression from "compression";
import { env } from "./config/env.js";
import { connectDB, disconnectDB } from "./utils/db.js";
import { connectRedis, disconnectRedis } from "./utils/redis.js";
import userRouter from "./routes/user.route.js";
import companyRouter from "./routes/company.route.js";
import jobRouter from "./routes/job.route.js";
import applicationRouter from "./routes/application.route.js";
import interviewRouter from "./routes/interview.route.js";
import paymentRouter from "./routes/payment.route.js";
import { notFound, errorHandler } from "./middlewares/errorHandler.js";

const app = express();

app.set("trust proxy", 1);
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(compression());
app.use(cors({
    origin(origin, callback) {
        if (!origin || env.frontendUrls.includes(origin)) return callback(null, true);
        return callback(new Error("Origin is not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    exposedHeaders: ["Content-Disposition", "X-Cache"]
}));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(cookieParser());

app.get("/health", (req, res) => res.status(200).json({
    success: true,
    status: "healthy",
    service: "jobsync-backend",
    timestamp: new Date().toISOString()
}));

app.use("/api/v1/user", userRouter);
app.use("/api/v1/company", companyRouter);
app.use("/api/v1/job", jobRouter);
app.use("/api/v1/application", applicationRouter);
app.use("/api/v1/interview", interviewRouter);
app.use("/api/v1/payment", paymentRouter);

app.use(notFound);
app.use(errorHandler);

let server;

const startServer = async () => {
    await connectDB();
    await connectRedis();

    server = app.listen(env.port, "0.0.0.0", () => {
        console.log(`JobSync backend running on port ${env.port}`);
    });
};

const shutdown = async (signal) => {
    console.log(`${signal} received; shutting down gracefully`);
    server?.close(async () => {
        await Promise.allSettled([disconnectRedis(), disconnectDB()]);
        process.exit(0);
    });

    setTimeout(() => process.exit(1), 10000).unref();
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

startServer().catch((error) => {
    console.error("Server startup failed:", error);
    process.exit(1);
});
