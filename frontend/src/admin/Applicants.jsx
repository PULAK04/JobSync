import { Download } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import Loading from "../components/shared/Loading.jsx";
import api from "../utils/api.js";
import { endpoints } from "../utils/endpoints.js";
import { downloadFileFromApi } from "../utils/download.js";

export default function Applicants() {
    const { id } = useParams();
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState("");

    const load = () => api.get(`${endpoints.application}/${id}/applicants`)
        .then(({ data }) => setJob(data.job));

    useEffect(() => {
        load().catch((error) => toast.error(error.response?.data?.message || "Unable to load applicants")).finally(() => setLoading(false));
    }, [id]);

    const updateStatus = async (applicationId, status) => {
        setUpdating(applicationId);
        try {
            const { data } = await api.post(`${endpoints.application}/status/${applicationId}/update`, { status });
            toast.success(data.message);
            await load();
        } catch (error) {
            toast.error(error.response?.data?.message || "Unable to update application");
        } finally {
            setUpdating("");
        }
    };

    const downloadResume = async (applicationId, fileName) => {
        try {
            await downloadFileFromApi(
                `${endpoints.application}/${applicationId}/resume/download`,
                fileName || "resume.pdf"
            );
        } catch (error) {
    toast.error(
        error.message ||
        "Unable to download resume"
    );
}
    };

    if (loading) return <Loading label="Loading applicants..." />;

    return (
        <section className="mx-auto min-h-[75vh] max-w-7xl px-4 py-12 sm:px-6">
            <p className="text-sm uppercase tracking-widest text-purple-400">Applicants</p><h1 className="mt-2 text-3xl font-bold text-white">{job?.title}</h1><p className="mt-2 text-slate-400">{job?.applications?.length || 0} applications</p>
            <div className="mt-8 overflow-x-auto rounded-2xl border border-slate-800 bg-panel"><table className="w-full min-w-[980px] text-left text-sm"><thead className="bg-slate-950/40 text-slate-500"><tr><th className="px-5 py-4">Candidate</th><th className="px-5 py-4">Email</th><th className="px-5 py-4">Skills</th><th className="px-5 py-4">Resume</th><th className="px-5 py-4">Status</th><th className="px-5 py-4">Action</th></tr></thead><tbody>{job?.applications?.map((item) => <tr key={item._id} className="border-t border-slate-800"><td className="px-5 py-4 font-semibold text-white">{item.applicant?.fullname}</td><td className="px-5 py-4 text-slate-300">{item.applicant?.email}</td><td className="max-w-xs px-5 py-4 text-slate-400">{item.applicant?.profile?.skills?.join(", ") || "N/A"}</td><td className="px-5 py-4">{item.applicant?.profile?.resume ? <button onClick={() => downloadResume(item._id, item.applicant.profile.resumeOriginalName || "resume.pdf")} className="inline-flex items-center gap-2 text-blue-400 hover:text-purple-400"><Download size={16} /> {item.applicant.profile.resumeOriginalName || "Download Resume"}</button> : <span className="text-slate-500">N/A</span>}</td><td className="px-5 py-4 capitalize"><span className="rounded-full bg-slate-800 px-3 py-1">{item.status}</span></td><td className="px-5 py-4"><div className="flex gap-2"><button disabled={updating === item._id} onClick={() => updateStatus(item._id, "accepted")} className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold hover:bg-emerald-500 disabled:opacity-50">Accept</button><button disabled={updating === item._id} onClick={() => updateStatus(item._id, "rejected")} className="rounded-lg bg-rose-600 px-3 py-2 text-xs font-semibold hover:bg-rose-500 disabled:opacity-50">Reject</button></div></td></tr>)}</tbody></table>{!job?.applications?.length && <p className="py-12 text-center text-slate-400">No applicants yet.</p>}</div>
        </section>
    );
}
