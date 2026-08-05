import { env } from "../config/env.js";

export const authCookieOptions = () => ({
    httpOnly: true,
    secure: env.cookieSecure,
    sameSite: env.cookieSameSite,
    maxAge: 24 * 60 * 60 * 1000,
    path: "/"
});

export const clearAuthCookieOptions = () => ({
    httpOnly: true,
    secure: env.cookieSecure,
    sameSite: env.cookieSameSite,
    path: "/"
});
