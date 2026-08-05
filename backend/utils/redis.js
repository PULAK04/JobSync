import Redis from "ioredis";
import { env } from "../config/env.js";

let redis = null;

if (env.redisUrl) {
    redis = new Redis(env.redisUrl, {
        lazyConnect: true,
        maxRetriesPerRequest: 1,
        enableOfflineQueue: false
    });

    redis.on("connect", () => console.log("Redis connected"));
    redis.on("error", (error) => console.error("Redis error:", error.message));
}

export const connectRedis = async () => {
    if (!redis || redis.status === "ready" || redis.status === "connecting") return;
    try {
        await redis.connect();
    } catch (error) {
        console.error("Redis unavailable; continuing without cache:", error.message);
    }
};

export const getCache = async (key) => {
    if (!redis || redis.status !== "ready") return null;
    try {
        return await redis.get(key);
    } catch (error) {
        console.error("Redis GET failed:", error.message);
        return null;
    }
};

export const setCache = async (key, value, ttlSeconds) => {
    if (!redis || redis.status !== "ready") return false;
    try {
        await redis.set(key, value, "EX", ttlSeconds);
        return true;
    } catch (error) {
        console.error("Redis SET failed:", error.message);
        return false;
    }
};

export const deleteCache = async (...keys) => {
    if (!redis || redis.status !== "ready" || keys.length === 0) return false;
    try {
        await redis.del(...keys);
        return true;
    } catch (error) {
        console.error("Redis DEL failed:", error.message);
        return false;
    }
};

export const disconnectRedis = async () => {
    if (redis && redis.status === "ready") await redis.quit();
};

export default redis;
