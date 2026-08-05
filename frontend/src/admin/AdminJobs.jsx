import { Plus, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import Loading from "../components/shared/Loading.jsx";
import api from "../utils/api.js";
import { endpoints } from "../utils/endpoints.js";

export default function AdminJobs() {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get(`${endpoints.job}/getadminjobs`)
            .then(({ data }) => setJobs(data.jobs || []))
            .catch((error) => toast.error(error.response?.data?.message || "Unable to load jobs"))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <Loading label="Loading posted jobs..." />;

    return (
        <section className="mx-auto min-h-[75vh] max-w-6xl px-4 py-12 sm:px-6">
            <div className="flex items-end justify-between"><div><p className="text-sm uppercase tracking-widest text-purple-400">Recruiter workspace</p><h1 className="mt-2 text-3xl font-bold text-white">Posted jobs</h1></div><Link to="/admin/jobs/create" className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-3 font-semibold"><Plus size={18} /> Post job</Link></div>
            <div className="mt-8 overflow-x-auto rounded-2xl border border-slate-800 bg-panel"><table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-slate-950/40 text-slate-500"><tr><th className="px-5 py-4">Title</th><th className="px-5 py-4">Company</th><th className="px-5 py-4">Location</th><th className="px-5 py-4">Created</th><th className="px-5 py-4">Applicants</th></tr></thead><tbody>{jobs.map((job) => <tr key={job._id} className="border-t border-slate-800"><td className="px-5 py-4 font-semibold text-white">{job.title}</td><td className="px-5 py-4 text-slate-300">{job.company?.name}</td><td className="px-5 py-4 text-slate-400">{job.location}</td><td className="px-5 py-4 text-slate-400">{new Date(job.createdAt).toLocaleDateString()}</td><td className="px-5 py-4"><Link to={`/admin/jobs/${job._id}/applicants`} className="inline-flex items-center gap-2 rounded-lg bg-slate-800 px-3 py-2 text-purple-300 hover:bg-purple-600 hover:text-white"><Users size={16} /> View ({job.applications?.length || 0})</Link></td></tr>)}</tbody></table>{!jobs.length && <p className="py-12 text-center text-slate-400">No jobs posted yet.</p>}</div>
        </section>
    );
}
