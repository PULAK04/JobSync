import axios from "axios";

// Empty in local Docker/Vite development so requests use the same browser origin (/api).
// Set VITE_BACKEND_URL to the deployed backend URL for a separately hosted frontend.
export const API_BASE_URL = String(import.meta.env.VITE_BACKEND_URL || "").replace(/\/$/, "");

const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    timeout: 60000
});

export default api;
