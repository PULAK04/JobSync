import { createSlice } from "@reduxjs/toolkit";

const companySlice = createSlice({
    name: "company",
    initialState: { companies: [], selectedCompany: null },
    reducers: {
        setCompanies(state, action) { state.companies = action.payload; },
        setSelectedCompany(state, action) { state.selectedCompany = action.payload; }
    }
});

export const { setCompanies, setSelectedCompany } = companySlice.actions;
export default companySlice.reducer;
