import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import api from "../utils/api.js";
import { endpoints } from "../utils/endpoints.js";

export default function CompanyCreate() {
    const [companyName, setCompanyName] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const submit = async (event) => {
        event.preventDefault();
        setLoading(true);
        try {
            const { data } = await api.post(`${endpoints.company}/register`, { companyName });
            toast.success(data.message);
            navigate(`/admin/companies/${data.company._id}`);
        } catch (error) {
            toast.error(error.response?.data?.message || "Unable to create company");
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="mx-auto min-h-[75vh] max-w-2xl px-4 py-12 sm:px-6">
            <form onSubmit={submit} className="rounded-3xl border border-slate-800 bg-panel p-7"><p className="text-sm uppercase tracking-widest text-purple-400">New company</p><h1 className="mt-2 text-3xl font-bold text-white">Create company profile</h1><p className="mt-3 text-slate-400">Start with the company name. You can add the description, website, location and logo next.</p><label className="mt-7 block text-sm text-slate-300">Company name<input required value={companyName} onChange={(event) => setCompanyName(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950/50 px-4 py-3 outline-none focus:border-purple-500" /></label><button disabled={loading} className="mt-5 rounded-xl bg-purple-600 px-5 py-3 font-semibold hover:bg-purple-500 disabled:opacity-50">{loading ? "Creating..." : "Create and continue"}</button></form>
        </section>
    );
}
