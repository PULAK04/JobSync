import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import api from "../utils/api.js";
import { endpoints } from "../utils/endpoints.js";
import { setAllJobs } from "../redux/slices/jobSlice.js";

const experienceRanges = {
    fresher: { minExperience: 0, maxExperience: 0 },
    junior: { minExperience: 0, maxExperience: 2 },
    mid: { minExperience: 2, maxExperience: 5 },
    senior: { minExperience: 5 }
};

export const useJobs = (filters = {}) => {
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 0 });

    useEffect(() => {
        const controller = new AbortController();
        const timer = window.setTimeout(() => {
            setLoading(true);

            const range = experienceRanges[filters.experience] || {};
            const params = {
                keyword: filters.keyword || undefined,
                location: filters.location || undefined,
                jobType: filters.jobType || undefined,
                minSalary: filters.minSalary || undefined,
                maxSalary: filters.maxSalary || undefined,
                sort: filters.sort || "newest",
                limit: 50,
                ...range
            };

            api.get(`${endpoints.job}/get`, { params, signal: controller.signal })
                .then(({ data }) => {
                    dispatch(setAllJobs(data.jobs || []));
                    setPagination(data.pagination || { total: 0, page: 1, pages: 0 });
                })
                .catch((error) => {
                    if (error.name !== "CanceledError" && error.code !== "ERR_CANCELED") {
                        console.error(error);
                    }
                })
                .finally(() => {
                    if (!controller.signal.aborted) setLoading(false);
                });
        }, 300);

        return () => {
            window.clearTimeout(timer);
            controller.abort();
        };
    }, [
        dispatch,
        filters.keyword,
        filters.location,
        filters.jobType,
        filters.experience,
        filters.minSalary,
        filters.maxSalary,
        filters.sort
    ]);

    return { loading, pagination };
};
