import { Bookmark, BrainCircuit, Briefcase, CheckCircle2, MapPin, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import Loading from "../components/shared/Loading.jsx";
import api from "../utils/api.js";
import { endpoints } from "../utils/endpoints.js";
import { clearUser, setUser } from "../redux/slices/authSlice.js";

export default function JobDescription() {
    const { id } = useParams();
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [aiLoading, setAiLoading] = useState(false);
    const [applied, setApplied] = useState(false);
    const user = useSelector((state) => state.auth.user);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        api.get(`${endpoints.job}/get/${id}`)
            .then(({ data }) => {
                setJob(data.job);
                setApplied(Boolean(user && data.job.applications?.some((application) => {
                    const applicantId = application.applicant?._id || application.applicant;
                    return applicantId === user._id;
                })));
            })
            .catch((error) => toast.error(error.response?.data?.message || "Unable to load job"))
            .finally(() => setLoading(false));
    }, [id, user]);

    const saved = useMemo(() => (user?.savedJobs || []).some((item) => (typeof item === "string" ? item : item._id) === id), [user, id]);

    const apply = async () => {
        if (!user) return navigate("/login", { state: { from: `/description/${id}` } });
        try {
            const { data } = await api.post(`${endpoints.application}/apply/${id}`);
            setApplied(true);
            toast.success(data.message);
        } catch (error) {
            toast.error(error.response?.data?.message || "Unable to apply");
        }
    };

    const toggleSave = async () => {
        if (!user) return navigate("/login", { state: { from: `/description/${id}` } });
        try {
            const { data } = await api.post(`${endpoints.user}/saved-jobs/${id}`);
            dispatch(setUser(data.user));
            toast.success(data.message);
        } catch (error) {
            toast.error(error.response?.data?.message || "Unable to save job");
        }
    };

    const generateAiMatch = async () => {
        if (!user) return navigate("/login", { state: { from: `/description/${id}` } });
        if (!user.profile?.resume) {
            toast.error("Upload your PDF resume in Profile before using AI Match");
            return navigate("/profile");
        }
        if ((user.aiCredits ?? 0) < 1) {
            toast.error("You do not have AI credits. Purchase a credit pack to continue.");
            return navigate("/credits");
        }

        setAiLoading(true);
        try {
            const { data } = await api.post(endpoints.interview, {
                jobTitle: job.title,
                jobDescription: job.description,
                selfDescription: user.profile?.bio || ""
            });
            dispatch(setUser({ ...user, aiCredits: data.aiCredits }));
            toast.success(data.creditDeducted ? "AI Match generated. 1 credit used." : "Existing AI Match loaded without using a credit.");
            navigate(`/ai-report/${data.report._id}`);
        } catch (error) {
    const errorCode =
        error.response?.data?.code;

    const isAuthError =
        error.response?.status === 401 &&
        [
            "AUTH_REQUIRED",
            "AUTH_SESSION_INVALID"
        ].includes(errorCode);

    if (isAuthError) {
        dispatch(clearUser());

        toast.error(
            "Your login session expired. Please log in again."
        );

        navigate("/login", {
            state: {
                from: `/description/${id}`
            }
        });

        return;
    }

    if (
        error.response?.status === 402 ||
        errorCode === "INSUFFICIENT_CREDITS"
    ) {
        toast.error(
            "You do not have AI credits. Purchase a credit pack to continue."
        );

        navigate("/credits");
        return;
    }

    toast.error(
        error.response?.data?.message ||
        "Unable to generate AI Match Report"
    );
} finally {
            setAiLoading(false);
        }
    };

    if (loading) return <Loading label="Loading job..." />;
    if (!job) return <div className="p-16 text-center text-slate-400">Job not found.</div>;

    return (
        <section className="mx-auto min-h-[75vh] max-w-5xl px-4 py-12 sm:px-6">
            <div className="rounded-3xl border border-slate-800 bg-panel p-6 sm:p-9">
                <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex gap-4">
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-slate-800">
                            {job.company?.logo ? <img src={job.company.logo} alt="" className="h-full w-full object-cover" /> : <Briefcase className="text-purple-300" />}
                        </div>
                        <div><p className="text-sm text-purple-300">{job.company?.name}</p><h1 className="mt-1 text-3xl font-bold text-white">{job.title}</h1><p className="mt-2 flex items-center gap-2 text-sm text-slate-400"><MapPin size={16} /> {job.location}</p></div>
                    </div>
                    {user?.role === "student" && <button onClick={toggleSave} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 px-4 py-2 text-sm hover:bg-slate-800"><Bookmark size={17} fill={saved ? "currentColor" : "none"} /> {saved ? "Saved" : "Save"}</button>}
                </div>

                <div className="mt-8 grid gap-3 sm:grid-cols-4">
                    <div className="rounded-xl bg-slate-950/50 p-4"><p className="text-xs text-slate-500">Salary</p><p className="mt-1 font-semibold">₹{job.salary} LPA</p></div>
                    <div className="rounded-xl bg-slate-950/50 p-4"><p className="text-xs text-slate-500">Experience</p><p className="mt-1 font-semibold">{job.experienceLevel} years</p></div>
                    <div className="rounded-xl bg-slate-950/50 p-4"><p className="text-xs text-slate-500">Type</p><p className="mt-1 font-semibold">{job.jobType}</p></div>
                    <div className="rounded-xl bg-slate-950/50 p-4"><p className="text-xs text-slate-500">Openings</p><p className="mt-1 flex items-center gap-2 font-semibold"><Users size={16} /> {job.position}</p></div>
                </div>

                <div className="mt-8">
                    <h2 className="text-lg font-bold text-white">Job description</h2>
                    <p className="mt-3 whitespace-pre-wrap leading-7 text-slate-300">{job.description}</p>
                </div>

                <div className="mt-8">
                    <h2 className="text-lg font-bold text-white">Requirements</h2>
                    <ul className="mt-3 space-y-2 text-slate-300">{job.requirements?.map((requirement) => <li key={requirement} className="flex gap-2"><CheckCircle2 size={18} className="mt-1 shrink-0 text-emerald-400" /> {requirement}</li>)}</ul>
                </div>

                {user?.role === "student" && (
                    <div className="mt-9 flex flex-col gap-3 border-t border-slate-800 pt-7 sm:flex-row">
                        <button disabled={applied} onClick={apply} className="rounded-xl bg-purple-600 px-6 py-3 font-semibold text-white hover:bg-purple-500 disabled:bg-slate-700">{applied ? "Already applied" : "Apply now"}</button>
                        <button disabled={aiLoading} onClick={generateAiMatch} className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-700 to-purple-700 px-6 py-3 font-semibold text-white hover:opacity-90 disabled:opacity-50"><BrainCircuit size={19} /> {aiLoading ? "Generating AI Match..." : `AI Match · 1 credit`}</button>
                        <Link to="/credits" className="self-center text-sm text-amber-300">Balance: {user.aiCredits ?? 0} credits</Link>
                    </div>
                )}
            </div>
        </section>
    );
}
