import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice.js";
import jobReducer from "./slices/jobSlice.js";
import companyReducer from "./slices/companySlice.js";

// The HTTP-only cookie is the source of truth for authentication.
// Avoid persisting a stale user object that can make the UI look logged in while the cookie is absent.
export const store = configureStore({
    reducer: {
        auth: authReducer,
        jobs: jobReducer,
        company: companyReducer
    }
});
