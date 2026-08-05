import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
    name: "auth",
    initialState: {
        user: null,
        loading: false,
        hydrated: false
    },
    reducers: {
        setUser(state, action) {
            state.user = action.payload;
        },
        setAuthLoading(state, action) {
            state.loading = action.payload;
        },
        setHydrated(state, action) {
            state.hydrated = action.payload;
        },
        clearUser(state) {
            state.user = null;
        }
    }
});

export const { setUser, setAuthLoading, setHydrated, clearUser } = authSlice.actions;
export default authSlice.reducer;
