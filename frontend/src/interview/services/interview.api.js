import axios from "axios";

const api = axios.create({
    baseURL: "https://jobsync-6tv7.onrender.com",
    withCredentials: true,
});



/**
 * @description Generate AI Match Report
 */
export const generateInterviewReport = async ({
    jobTitle,
    jobDescription,
    selfDescription,
    resumeUrl
}) => {

    const response = await api.post("/api/v1/interview/", {

        jobTitle,

        jobDescription,

        selfDescription,

        resumeUrl
    });

    return response.data;
};



/**
 * @description Get Interview Report By ID
 */
export const getInterviewReportById = async (interviewId) => {

    const response = await api.get(
        `/api/v1/interview/report/${interviewId}`
    );

    return response.data;
};



/**
 * @description Get All Interview Reports
 */
export const getAllInterviewReports = async () => {

    const response = await api.get("/api/v1/interview/");

    return response.data;
};



/**
 * @description Generate ATS Optimized Resume PDF
 */
export const generateResumePdf = async ({
    interviewReportId
}) => {

    const response = await api.post(

        `/api/v1/interview/resume/pdf/${interviewReportId}`,

        {},

        {
            responseType: "blob"
        }
    );

    return response.data;
};
