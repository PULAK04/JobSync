import { useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import api from "../utils/api.js";
import { endpoints } from "../utils/endpoints.js";
import { setUser } from "../redux/slices/authSlice.js";

export default function Signup() {
    const [form, setForm] = useState({ fullname: "", email: "", phoneNumber: "", password: "", role: "student", file: null });
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const submit = async (event) => {
        event.preventDefault();
        setLoading(true);
        const payload = new FormData();
        Object.entries(form).forEach(([key, value]) => {
            if (value) payload.append(key, value);
        });

        try {
            const { data } = await api.post(`${endpoints.user}/register`, payload);
            dispatch(setUser(data.user));
            toast.success(data.message);
            navigate("/");
        } catch (error) {
            toast.error(error.response?.data?.message || "Unable to create account");
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="mx-auto flex min-h-[75vh] max-w-7xl items-center justify-center px-4 py-12">
            <form onSubmit={submit} className="w-full max-w-xl rounded-2xl border border-slate-800 bg-panel p-7 shadow-2xl shadow-black/30">
                <h1 className="text-2xl font-bold text-white">Create your JobSync account</h1>
                <p className="mt-2 text-sm text-slate-400">Job seekers receive free AI credits after registration.</p>

                <div className="mt-7 grid gap-4 sm:grid-cols-2">
                    <label className="text-sm text-slate-300">Full name<input required value={form.fullname} onChange={(event) => setForm({ ...form, fullname: event.target.value })} className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950/60 px-4 py-3 outline-none focus:border-purple-500" /></label>
                    <label className="text-sm text-slate-300">Phone number<input value={form.phoneNumber} onChange={(event) => setForm({ ...form, phoneNumber: event.target.value })} className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950/60 px-4 py-3 outline-none focus:border-purple-500" /></label>
                    <label className="text-sm text-slate-300 sm:col-span-2">Email<input required type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950/60 px-4 py-3 outline-none focus:border-purple-500" /></label>
                    <label className="text-sm text-slate-300">Password<input required minLength={6} type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950/60 px-4 py-3 outline-none focus:border-purple-500" /></label>
                    <label className="text-sm text-slate-300">Account type<select value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })} className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950/60 px-4 py-3 outline-none focus:border-purple-500"><option value="student">Job seeker</option><option value="recruiter">Recruiter</option></select></label>
                    <label className="text-sm text-slate-300 sm:col-span-2">Profile photo (optional)<input type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => setForm({ ...form, file: event.target.files?.[0] || null })} className="mt-2 block w-full rounded-xl border border-dashed border-slate-700 px-4 py-3 text-slate-400 file:mr-4 file:rounded-lg file:border-0 file:bg-purple-600 file:px-3 file:py-2 file:text-white" /></label>
                </div>

                <button disabled={loading} className="mt-6 w-full rounded-xl bg-purple-600 py-3 font-semibold text-white hover:bg-purple-500 disabled:opacity-50">{loading ? "Creating account..." : "Create account"}</button>
                <p className="mt-6 text-center text-sm text-slate-400">Already registered? <Link className="text-purple-400" to="/login">Log in</Link></p>
            </form>
        </section>
    );
}
