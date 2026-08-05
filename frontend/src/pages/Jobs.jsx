import { RotateCcw, Search, SlidersHorizontal } from "lucide-react";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import JobCard from "../components/JobCard.jsx";
import Loading from "../components/shared/Loading.jsx";
import { useJobs } from "../hooks/useJobs.js";
import api from "../utils/api.js";
import { endpoints } from "../utils/endpoints.js";
import { setUser } from "../redux/slices/authSlice.js";

const defaultFilters = {
    keyword: "",
    location: "",
    jobType: "",
    experience: "",
    minSalary: "",
    maxSalary: "",
    sort: "newest"
};

const inputClass = "mt-2 w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-2.5 text-sm text-slate-200 outline-none focus:border-purple-500";

export default function Jobs() {
    const [filters, setFilters] = useState(defaultFilters);
    const { loading, pagination } = useJobs(filters);
    const jobs = useSelector((state) => state.jobs.allJobs);
    const user = useSelector((state) => state.auth.user);
    const dispatch = useDispatch();
    const savedIds = new Set((user?.savedJobs || []).map((job) => typeof job === "string" ? job : job._id));

    const updateFilter = (key, value) => {
        setFilters((current) => ({ ...current, [key]: value }));
    };

    const clearFilters = () => setFilters(defaultFilters);

    const toggleSave = async (jobId) => {
        if (!user) return toast.error("Log in to save jobs");
        try {
            const { data } = await api.post(`${endpoints.user}/saved-jobs/${jobId}`);
            dispatch(setUser(data.user));
            toast.success(data.message);
        } catch (error) {
            toast.error(error.response?.data?.message || "Unable to update saved jobs");
        }
    };

    return (
        <section className="mx-auto min-h-[75vh] max-w-7xl px-4 py-12 sm:px-6">
            <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
                <div>
                    <p className="text-sm uppercase tracking-widest text-purple-400">Opportunities</p>
                    <h1 className="mt-2 text-3xl font-bold text-white">Browse jobs</h1>
                    <p className="mt-2 text-sm text-slate-400">Search and filter jobs by role, location, type, experience and salary.</p>
                </div>
                <label className="relative w-full md:max-w-md">
                    <Search className="absolute left-4 top-3.5 text-slate-500" size={19} />
                    <input
                        value={filters.keyword}
                        onChange={(event) => updateFilter("keyword", event.target.value)}
                        placeholder="Search title, skill or description"
                        className="w-full rounded-xl border border-slate-700 bg-panel py-3 pl-11 pr-4 outline-none focus:border-purple-500"
                    />
                </label>
            </div>

            <div className="mt-8 grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
                <aside className="h-fit rounded-2xl border border-slate-800 bg-panel p-5 lg:sticky lg:top-24">
                    <div className="flex items-center justify-between">
                        <h2 className="inline-flex items-center gap-2 font-bold text-white"><SlidersHorizontal size={18} /> Filters</h2>
                        <button onClick={clearFilters} className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-white"><RotateCcw size={14} /> Clear</button>
                    </div>

                    <div className="mt-5 space-y-4">
                        <label className="block text-sm text-slate-300">
                            Location
                            <input value={filters.location} onChange={(event) => updateFilter("location", event.target.value)} placeholder="e.g. Bengaluru or Remote" className={inputClass} />
                        </label>

                        <label className="block text-sm text-slate-300">
                            Job type
                            <select value={filters.jobType} onChange={(event) => updateFilter("jobType", event.target.value)} className={inputClass}>
                                <option value="">All types</option>
                                <option value="Full-time">Full-time</option>
                                <option value="Part-time">Part-time</option>
                                <option value="Internship">Internship</option>
                                <option value="Contract">Contract</option>
                                <option value="Remote">Remote</option>
                            </select>
                        </label>

                        <label className="block text-sm text-slate-300">
                            Experience
                            <select value={filters.experience} onChange={(event) => updateFilter("experience", event.target.value)} className={inputClass}>
                                <option value="">Any experience</option>
                                <option value="fresher">Fresher (0 years)</option>
                                <option value="junior">0–2 years</option>
                                <option value="mid">2–5 years</option>
                                <option value="senior">5+ years</option>
                            </select>
                        </label>

                        <div>
                            <p className="text-sm text-slate-300">Salary range (LPA)</p>
                            <div className="grid grid-cols-2 gap-2">
                                <input type="number" min="0" value={filters.minSalary} onChange={(event) => updateFilter("minSalary", event.target.value)} placeholder="Min" className={inputClass} />
                                <input type="number" min="0" value={filters.maxSalary} onChange={(event) => updateFilter("maxSalary", event.target.value)} placeholder="Max" className={inputClass} />
                            </div>
                        </div>
                    </div>
                </aside>

                <div>
                    <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-slate-800 bg-panel/70 p-4 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-sm text-slate-400"><span className="font-semibold text-white">{pagination.total}</span> jobs found</p>
                        <label className="flex items-center gap-3 text-sm text-slate-400">
                            Sort by
                            <select value={filters.sort} onChange={(event) => updateFilter("sort", event.target.value)} className="rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 text-slate-200 outline-none focus:border-purple-500">
                                <option value="newest">Newest first</option>
                                <option value="oldest">Oldest first</option>
                                <option value="salary-high">Salary: high to low</option>
                                <option value="salary-low">Salary: low to high</option>
                                <option value="experience-low">Experience: low to high</option>
                                <option value="experience-high">Experience: high to low</option>
                            </select>
                        </label>
                    </div>

                    {loading ? (
                        <Loading label="Filtering jobs..." />
                    ) : (
                        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                            {jobs.map((job) => <JobCard key={job._id} job={job} saved={savedIds.has(job._id)} onSave={user?.role === "student" ? toggleSave : undefined} />)}
                        </div>
                    )}

                    {!loading && !jobs.length && <p className="mt-16 text-center text-slate-400">No jobs matched these filters.</p>}
                </div>
            </div>
        </section>
    );
}
