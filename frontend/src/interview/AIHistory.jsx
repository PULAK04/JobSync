import { BrainCircuit, CalendarDays } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import Loading from "../components/shared/Loading.jsx";
import api from "../utils/api.js";
import { endpoints } from "../utils/endpoints.js";

export default function AIHistory() {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get(endpoints.interview)
            .then(({ data }) => setReports(data.reports || []))
            .catch((error) => toast.error(error.response?.data?.message || "Unable to load AI reports"))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <Loading label="Loading AI reports..." />;

    return (
        <section className="mx-auto min-h-[75vh] max-w-6xl px-4 py-12 sm:px-6">
            <div><p className="text-sm uppercase tracking-widest text-purple-400">Career intelligence</p><h1 className="mt-2 text-3xl font-bold text-white">AI Match Reports</h1></div>
            <div className="mt-8 grid gap-5 md:grid-cols-2">
                {reports.map((report) => (
                    <Link key={report._id} to={`/ai-report/${report._id}`} className="rounded-2xl border border-slate-800 bg-panel p-6 transition hover:border-purple-500/50">
                        <div className="flex items-start justify-between"><BrainCircuit className="text-purple-400" /><span className="rounded-full bg-emerald-500/10 px-3 py-1 text-sm font-semibold text-emerald-300">{report.matchScore}% match</span></div>
                        <h2 className="mt-5 text-xl font-bold text-white">{report.title || report.jobTitle}</h2>
                        <p className="mt-3 flex items-center gap-2 text-sm text-slate-500"><CalendarDays size={15} /> {new Date(report.createdAt).toLocaleString()}</p>
                    </Link>
                ))}
            </div>
            {!reports.length && <div className="mt-16 rounded-2xl border border-dashed border-slate-700 p-12 text-center text-slate-400">No AI Match Reports yet. Open a job and use AI Match.</div>}
        </section>
    );
}
