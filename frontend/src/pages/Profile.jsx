import { Download, FileText, Pencil, Save, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import api from "../utils/api.js";
import { endpoints } from "../utils/endpoints.js";
import { setUser } from "../redux/slices/authSlice.js";
import { downloadFileFromApi } from "../utils/download.js";

export default function Profile() {
    const user = useSelector((state) => state.auth.user);
    const [editing, setEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [applications, setApplications] = useState([]);
    const [form, setForm] = useState({
        fullname: user?.fullname || "",
        email: user?.email || "",
        phoneNumber: user?.phoneNumber || "",
        bio: user?.profile?.bio || "",
        skills: user?.profile?.skills?.join(", ") || "",
        file: null
    });
    const dispatch = useDispatch();

    useEffect(() => {
        if (user?.role === "student") {
            api.get(`${endpoints.application}/get`)
                .then(({ data }) => setApplications(data.applications || []))
                .catch(() => {});
        }
    }, [user?.role]);

    const save = async (event) => {
        event.preventDefault();
        setLoading(true);
        const payload = new FormData();
        Object.entries(form).forEach(([key, value]) => {
            if (value !== null && value !== undefined) payload.append(key, value);
        });

        try {
            const { data } = await api.post(`${endpoints.user}/profile/update`, payload);
            dispatch(setUser(data.user));
            setEditing(false);
            setForm((current) => ({ ...current, file: null }));
            toast.success(data.message);
        } catch (error) {
            toast.error(error.response?.data?.message || "Unable to update profile");
        } finally {
            setLoading(false);
        }
    };

    const downloadResume = async () => {
        try {
            await downloadFileFromApi(
                `${endpoints.user}/resume/download`,
                user.profile?.resumeOriginalName || "resume.pdf"
            );
        } catch (error) {
    toast.error(
        error.message ||
        "Unable to download resume"
    );
}
    };

    if (!user) return null;

    return (
        <section className="mx-auto min-h-[75vh] max-w-5xl px-4 py-12 sm:px-6">
            <div className="rounded-3xl border border-slate-800 bg-panel p-6 sm:p-8">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-center gap-4">
                        <div className="h-20 w-20 overflow-hidden rounded-2xl bg-slate-800">
                            {user.profile?.profilePhoto ? <img src={user.profile.profilePhoto} alt="" className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-2xl font-bold text-purple-300">{user.fullname?.[0]}</div>}
                        </div>
                        <div><h1 className="text-2xl font-bold text-white">{user.fullname}</h1><p className="mt-1 text-slate-400">{user.email}</p><span className="mt-2 inline-block rounded-full bg-purple-500/10 px-3 py-1 text-xs capitalize text-purple-300">{user.role === "student" ? "Job seeker" : user.role}</span></div>
                    </div>
                    <button onClick={() => setEditing((value) => !value)} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 px-4 py-2 text-sm hover:bg-slate-800">{editing ? <X size={17} /> : <Pencil size={17} />} {editing ? "Cancel" : "Edit profile"}</button>
                </div>

                {editing ? (
                    <form onSubmit={save} className="mt-8 grid gap-4 sm:grid-cols-2">
                        <label className="text-sm text-slate-300">Full name<input value={form.fullname} onChange={(event) => setForm({ ...form, fullname: event.target.value })} className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950/50 px-4 py-3 outline-none focus:border-purple-500" /></label>
                        <label className="text-sm text-slate-300">Email<input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950/50 px-4 py-3 outline-none focus:border-purple-500" /></label>
                        <label className="text-sm text-slate-300">Phone<input value={form.phoneNumber} onChange={(event) => setForm({ ...form, phoneNumber: event.target.value })} className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950/50 px-4 py-3 outline-none focus:border-purple-500" /></label>
                        <label className="text-sm text-slate-300">Skills (comma separated)<input value={form.skills} onChange={(event) => setForm({ ...form, skills: event.target.value })} className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950/50 px-4 py-3 outline-none focus:border-purple-500" /></label>
                        <label className="text-sm text-slate-300 sm:col-span-2">Bio<textarea rows={4} value={form.bio} onChange={(event) => setForm({ ...form, bio: event.target.value })} className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950/50 px-4 py-3 outline-none focus:border-purple-500" /></label>
                        <label className="text-sm text-slate-300 sm:col-span-2">Upload PDF resume or profile photo<input type="file" accept="application/pdf,image/png,image/jpeg,image/webp" onChange={(event) => setForm({ ...form, file: event.target.files?.[0] || null })} className="mt-2 block w-full rounded-xl border border-dashed border-slate-700 px-4 py-3 text-slate-400 file:mr-4 file:rounded-lg file:border-0 file:bg-purple-600 file:px-3 file:py-2 file:text-white" /></label>
                        <button disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-xl bg-purple-600 px-5 py-3 font-semibold sm:col-span-2"><Save size={18} /> {loading ? "Saving..." : "Save changes"}</button>
                    </form>
                ) : (
                    <div className="mt-8 grid gap-5 sm:grid-cols-2">
                        <div className="rounded-2xl bg-slate-950/40 p-5"><p className="text-xs uppercase tracking-wider text-slate-500">About</p><p className="mt-3 leading-7 text-slate-300">{user.profile?.bio || "No bio added yet."}</p></div>
                        <div className="rounded-2xl bg-slate-950/40 p-5"><p className="text-xs uppercase tracking-wider text-slate-500">Skills</p><div className="mt-3 flex flex-wrap gap-2">{user.profile?.skills?.length ? user.profile.skills.map((skill) => <span key={skill} className="rounded-full bg-purple-500/10 px-3 py-1 text-sm text-purple-300">{skill}</span>) : <span className="text-slate-400">No skills added.</span>}</div></div>
                    </div>
                )}

                {user.role === "student" && (
                    <div className="mt-6 flex flex-col gap-4 rounded-2xl border border-slate-800 p-5 sm:flex-row sm:items-center sm:justify-between">
                        <div><p className="text-sm text-slate-400">AI credit balance</p><p className="mt-1 text-2xl font-bold text-amber-300">{user.aiCredits ?? 0} credits</p></div>
                        <div className="flex gap-3"><Link to="/credits" className="rounded-xl bg-amber-500 px-4 py-2 font-semibold text-slate-950">Buy credits</Link>{user.profile?.resume && <button onClick={downloadResume} className="inline-flex items-center gap-2 rounded-xl border border-slate-700 px-4 py-2"><Download size={17} /> {user.profile.resumeOriginalName || "Download resume"}</button>}</div>
                    </div>
                )}
            </div>

            {user.role === "student" && (
    <div className="mt-8 rounded-3xl border border-slate-800 bg-panel p-6 sm:p-8">
        <h2 className="text-xl font-bold text-white">Applied jobs</h2>

        <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[680px] text-left text-sm">
                <thead className="text-slate-500">
                    <tr>
                        <th className="px-4 py-3">Job</th>
                        <th className="px-4 py-3">Company</th>
                        <th className="px-4 py-3">Applied</th>
                        <th className="px-4 py-3">Status</th>
                    </tr>
                </thead>

                <tbody>
                    {applications.map((application) => (
                        <tr
                            key={application._id}
                            className="border-t border-slate-800"
                        >
                            <td className="px-4 py-4 text-white">
                                {application.job?.title}
                            </td>

                            <td className="px-4 py-4 text-slate-300">
                                {application.job?.company?.name}
                            </td>

                            <td className="px-4 py-4 text-slate-400">
                                {new Date(
                                    application.createdAt
                                ).toLocaleDateString()}
                            </td>

                            <td className="px-4 py-4 capitalize">
                                <span
                                    className={`rounded-full px-3 py-1 font-medium ${
                                        application.status === "pending"
                                            ? "bg-yellow-500/20 text-yellow-400"
                                            : application.status === "accepted"
                                            ? "bg-green-500/20 text-green-400"
                                            : application.status === "rejected"
                                            ? "bg-red-500/20 text-red-400"
                                            : "bg-slate-800 text-slate-300"
                                    }`}
                                >
                                    {application.status}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {!applications.length && (
                <p className="py-8 text-center text-slate-400">
                    No applications yet.
                </p>
            )}
        </div>
    </div>
)}
        </section>
    );
}
