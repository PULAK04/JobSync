import { createSlice } from "@reduxjs/toolkit";

const jobSlice = createSlice({
    name: "jobs",
    initialState: {
        allJobs: [],
        selectedJob: null,
        adminJobs: [],
        keyword: ""
    },
    reducers: {
        setAllJobs(state, action) { state.allJobs = action.payload; },
        setSelectedJob(state, action) { state.selectedJob = action.payload; },
        setAdminJobs(state, action) { state.adminJobs = action.payload; },
        setKeyword(state, action) { state.keyword = action.payload; }
    }
});

export const { setAllJobs, setSelectedJob, setAdminJobs, setKeyword } = jobSlice.actions;
export default jobSlice.reducer;
