import { ArrowRight, BrainCircuit, FileText, Search, ShieldCheck, Zap } from "lucide-react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { useJobs } from "../hooks/useJobs.js";
import JobCard from "../components/JobCard.jsx";

export default function Home() {
    useJobs();
    const jobs = useSelector((state) => state.jobs.allJobs).slice(0, 6);
    const user = useSelector((state) => state.auth.user);

    return (
        <>
            <section className="relative overflow-hidden px-4 py-24 sm:px-6">
                <div className="absolute inset-0 -z-0 bg-[radial-gradient(circle_at_20%_20%,rgba(124,58,237,0.22),transparent_38%),radial-gradient(circle_at_80%_10%,rgba(22,163,74,0.13),transparent_30%)]" />
                <div className="relative mx-auto max-w-5xl text-center">
                    <span className="inline-flex rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-2 text-sm font-medium text-purple-300">AI-powered recruitment and career intelligence</span>
                    <h1 className="mt-7 text-4xl font-black tracking-tight text-white sm:text-6xl">Find the right job. <span className="bg-gradient-to-r from-purple-400 to-emerald-400 bg-clip-text text-transparent">Prepare smarter.</span></h1>
                    <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-400">Discover opportunities, compare your resume with job descriptions, identify skill gaps and generate an ATS-focused resume from one platform.</p>
                    <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
                        <Link to="/jobs" className="inline-flex items-center justify-center gap-2 rounded-xl bg-purple-600 px-6 py-3 font-semibold text-white hover:bg-purple-500">Browse jobs <ArrowRight size={18} /></Link>
                        {!user && <Link to="/signup" className="rounded-xl border border-slate-700 px-6 py-3 font-semibold text-slate-200 hover:bg-slate-800">Create free account</Link>}
                    </div>
                </div>
            </section>

            <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
                <div className="grid gap-4 md:grid-cols-3">
                    {[
                        [Search, "Job discovery", "Search and apply for suitable roles from recruiter-posted opportunities."],
                        [BrainCircuit, "AI Match", "Use Groq-powered analysis for match scores, skill gaps and interview preparation."],
                        [FileText, "ATS resume", "Generate a role-tailored resume PDF while preserving your real experience."]
                    ].map(([Icon, title, text]) => (
                        <div key={title} className="rounded-2xl border border-slate-800 bg-panel p-6"><Icon className="text-purple-400" /><h2 className="mt-4 text-lg font-bold text-white">{title}</h2><p className="mt-2 text-sm leading-6 text-slate-400">{text}</p></div>
                    ))}
                </div>
            </section>

            <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
                <div className="mb-8 flex items-end justify-between"><div><p className="text-sm font-semibold uppercase tracking-widest text-purple-400">Latest opportunities</p><h2 className="mt-2 text-3xl font-bold text-white">Jobs you may like</h2></div><Link to="/jobs" className="text-sm text-purple-300 hover:text-white">View all</Link></div>
                <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{jobs.map((job) => <JobCard key={job._id} job={job} />)}</div>
            </section>

            <section className="mx-auto mb-16 max-w-7xl px-4 sm:px-6">
                <div className="grid gap-6 rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 to-purple-950/50 p-8 md:grid-cols-3">
                    {[[Zap, "Credit-controlled AI usage"], [ShieldCheck, "Secure role and ownership checks"], [BrainCircuit, "Groq structured AI output"]].map(([Icon, text]) => <div key={text} className="flex items-center gap-3 text-slate-200"><Icon className="text-emerald-400" /><span>{text}</span></div>)}
                </div>
            </section>
        </>
    );
}
