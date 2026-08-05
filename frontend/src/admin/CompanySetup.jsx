import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import Loading from "../components/shared/Loading.jsx";
import api from "../utils/api.js";
import { endpoints } from "../utils/endpoints.js";

export default function CompanySetup() {
    const { id } = useParams();
    const [form, setForm] = useState({ name: "", description: "", website: "", location: "", file: null });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        api.get(`${endpoints.company}/get/${id}`)
            .then(({ data }) => setForm({ name: data.company.name || "", description: data.company.description || "", website: data.company.website || "", location: data.company.location || "", file: null }))
            .catch((error) => toast.error(error.response?.data?.message || "Unable to load company"))
            .finally(() => setLoading(false));
    }, [id]);

    const submit = async (event) => {
        event.preventDefault();
        setSaving(true);
        const payload = new FormData();
        Object.entries(form).forEach(([key, value]) => { if (value) payload.append(key, value); });
        try {
            const { data } = await api.put(`${endpoints.company}/update/${id}`, payload);
            toast.success(data.message);
            navigate("/admin/companies");
        } catch (error) {
            toast.error(error.response?.data?.message || "Unable to update company");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <Loading label="Loading company..." />;

    return (
        <section className="mx-auto min-h-[75vh] max-w-3xl px-4 py-12 sm:px-6">
            <form onSubmit={submit} className="rounded-3xl border border-slate-800 bg-panel p-7"><p className="text-sm uppercase tracking-widest text-purple-400">Company setup</p><h1 className="mt-2 text-3xl font-bold text-white">Update company</h1><div className="mt-7 grid gap-4 sm:grid-cols-2"><label className="text-sm text-slate-300">Name<input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950/50 px-4 py-3 outline-none focus:border-purple-500" /></label><label className="text-sm text-slate-300">Location<input value={form.location} onChange={(event) => setForm({ ...form, location: event.target.value })} className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950/50 px-4 py-3 outline-none focus:border-purple-500" /></label><label className="text-sm text-slate-300 sm:col-span-2">Website<input type="url" value={form.website} onChange={(event) => setForm({ ...form, website: event.target.value })} className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950/50 px-4 py-3 outline-none focus:border-purple-500" /></label><label className="text-sm text-slate-300 sm:col-span-2">Description<textarea rows={5} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950/50 px-4 py-3 outline-none focus:border-purple-500" /></label><label className="text-sm text-slate-300 sm:col-span-2">Company logo<input type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => setForm({ ...form, file: event.target.files?.[0] || null })} className="mt-2 block w-full rounded-xl border border-dashed border-slate-700 px-4 py-3 text-slate-400 file:mr-4 file:rounded-lg file:border-0 file:bg-purple-600 file:px-3 file:py-2 file:text-white" /></label></div><button disabled={saving} className="mt-6 rounded-xl bg-purple-600 px-5 py-3 font-semibold hover:bg-purple-500 disabled:opacity-50">{saving ? "Saving..." : "Save company"}</button></form>
        </section>
    );
}
