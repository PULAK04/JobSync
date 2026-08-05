import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import api from "../utils/api.js";
import { endpoints } from "../utils/endpoints.js";

const initial = {
    title: "",
    description: "",
    requirements: "",
    salary: "",
    experienceLevel: "",
    location: "",
    jobType: "Full-time",
    position: "",
    companyId: ""
};

export default function PostJob() {
    const [form, setForm] = useState(initial);
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        api.get(`${endpoints.company}/get`)
            .then(({ data }) => {
                setCompanies(data.companies || []);
                if (data.companies?.[0]) setForm((current) => ({ ...current, companyId: data.companies[0]._id }));
            })
            .catch(() => toast.error("Create a company before posting a job"));
    }, []);

    const submit = async (event) => {
        event.preventDefault();
        setLoading(true);
        try {
            const { data } = await api.post(`${endpoints.job}/post`, form);
            toast.success(data.message);
            navigate("/admin/jobs");
        } catch (error) {
            toast.error(error.response?.data?.message || "Unable to post job");
        } finally {
            setLoading(false);
        }
    };

    const field = (label, key, type = "text") => (
        <label className="text-sm text-slate-300">{label}<input required type={type} value={form[key]} onChange={(event) => setForm({ ...form, [key]: event.target.value })} className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950/50 px-4 py-3 outline-none focus:border-purple-500" /></label>
    );

    return (
        <section className="mx-auto min-h-[75vh] max-w-4xl px-4 py-12 sm:px-6">
            <form onSubmit={submit} className="rounded-3xl border border-slate-800 bg-panel p-7"><p className="text-sm uppercase tracking-widest text-purple-400">Recruiter workspace</p><h1 className="mt-2 text-3xl font-bold text-white">Post a new job</h1><div className="mt-7 grid gap-4 sm:grid-cols-2">{field("Job title", "title")}{field("Location", "location")}{field("Salary (LPA)", "salary", "number")}{field("Experience level (years)", "experienceLevel", "number")}{field("Number of positions", "position", "number")}<label className="text-sm text-slate-300">Job type<select value={form.jobType} onChange={(event) => setForm({ ...form, jobType: event.target.value })} className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950/50 px-4 py-3 outline-none focus:border-purple-500"><option>Full-time</option><option>Part-time</option><option>Internship</option><option>Contract</option><option>Remote</option></select></label><label className="text-sm text-slate-300 sm:col-span-2">Company<select required value={form.companyId} onChange={(event) => setForm({ ...form, companyId: event.target.value })} className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950/50 px-4 py-3 outline-none focus:border-purple-500"><option value="">Select company</option>{companies.map((company) => <option key={company._id} value={company._id}>{company.name}</option>)}</select></label><label className="text-sm text-slate-300 sm:col-span-2">Requirements (comma separated)<input required value={form.requirements} onChange={(event) => setForm({ ...form, requirements: event.target.value })} className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950/50 px-4 py-3 outline-none focus:border-purple-500" /></label><label className="text-sm text-slate-300 sm:col-span-2">Description<textarea required rows={7} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950/50 px-4 py-3 outline-none focus:border-purple-500" /></label></div><button disabled={loading || !companies.length} className="mt-6 rounded-xl bg-purple-600 px-6 py-3 font-semibold hover:bg-purple-500 disabled:opacity-50">{loading ? "Posting..." : "Post job"}</button></form>
        </section>
    );
}
