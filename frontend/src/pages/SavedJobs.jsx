import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import JobCard from "../components/JobCard.jsx";
import api from "../utils/api.js";
import { endpoints } from "../utils/endpoints.js";
import { setUser } from "../redux/slices/authSlice.js";

export default function SavedJobs() {
    const user = useSelector((state) => state.auth.user);
    const dispatch = useDispatch();
    const jobs = (user?.savedJobs || []).filter((item) => typeof item === "object");

    const remove = async (jobId) => {
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
            <p className="text-sm uppercase tracking-widest text-purple-400">Your shortlist</p><h1 className="mt-2 text-3xl font-bold text-white">Saved jobs</h1>
            <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">{jobs.map((job) => <JobCard key={job._id} job={job} saved onSave={remove} />)}</div>
            {!jobs.length && <div className="mt-16 rounded-2xl border border-dashed border-slate-700 p-12 text-center text-slate-400">You have not saved any jobs yet.</div>}
        </section>
    );
}
