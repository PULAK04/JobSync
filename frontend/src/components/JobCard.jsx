import { Bookmark, BriefcaseBusiness, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

export default function JobCard({ job, saved = false, onSave }) {
    return (
        <article className="group rounded-2xl border border-slate-800 bg-panel/80 p-5 shadow-lg shadow-black/10 transition hover:-translate-y-0.5 hover:border-purple-500/50">
            <div className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-800">
                        {job.company?.logo ? <img src={job.company.logo} alt="" className="h-full w-full object-cover" /> : <BriefcaseBusiness className="text-purple-300" />}
                    </div>
                    <div className="min-w-0">
                        <p className="truncate text-sm text-slate-400">{job.company?.name || "Company"}</p>
                        <h3 className="truncate text-lg font-bold text-white">{job.title}</h3>
                    </div>
                </div>
                {onSave && (
                    <button onClick={() => onSave(job._id)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white" aria-label="Save job">
                        <Bookmark size={19} fill={saved ? "currentColor" : "none"} />
                    </button>
                )}
            </div>

            <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-400">{job.description}</p>

            <div className="mt-4 flex flex-wrap gap-2 text-xs">
                <span className="rounded-full bg-blue-500/10 px-3 py-1 text-blue-300">{job.position} positions</span>
                <span className="rounded-full bg-purple-500/10 px-3 py-1 text-purple-300">{job.jobType}</span>
                <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-emerald-300">₹{job.salary} LPA</span>
            </div>

            <div className="mt-5 flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 text-xs text-slate-500"><MapPin size={14} /> {job.location}</span>
                <Link to={`/description/${job._id}`} className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-600">View details</Link>
            </div>
        </article>
    );
}
