import { Download, Gauge, GraduationCap, ListChecks, MessageSquareText, Wrench } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import Loading from "../components/shared/Loading.jsx";
import api from "../utils/api.js";
import { endpoints } from "../utils/endpoints.js";

function Section({ icon: Icon, title, items }) {
    return (
        <div className="rounded-2xl border border-slate-800 bg-panel p-6">
            <h2 className="flex items-center gap-3 text-lg font-bold text-white"><Icon className="text-purple-400" size={20} /> {title}</h2>
            <ol className="mt-5 space-y-3">{items?.map((item, index) => <li key={`${title}-${index}`} className="rounded-xl bg-slate-950/50 p-4 text-sm leading-6 text-slate-300"><span className="mr-2 font-bold text-purple-300">{index + 1}.</span>{item}</li>)}</ol>
        </div>
    );
}

export default function AIReport() {
    const { interviewId } = useParams();
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [downloading, setDownloading] = useState(false);

    useEffect(() => {
        api.get(`${endpoints.interview}/report/${interviewId}`)
            .then(({ data }) => setReport(data.report))
            .catch((error) => toast.error(error.response?.data?.message || "Unable to load report"))
            .finally(() => setLoading(false));
    }, [interviewId]);

    const downloadResume = async () => {
        setDownloading(true);
        try {
            const response = await api.post(`${endpoints.interview}/resume/pdf/${interviewId}`, {}, { responseType: "blob", timeout: 90000 });
            const url = URL.createObjectURL(response.data);
            const anchor = document.createElement("a");
            anchor.href = url;
            anchor.download = `jobsync_${report?.jobTitle || "resume"}.pdf`;
            document.body.appendChild(anchor);
            anchor.click();
            anchor.remove();
            URL.revokeObjectURL(url);
            toast.success("Resume downloaded");
        } catch (error) {
            toast.error(error.response?.data?.message || "Unable to generate resume PDF");
        } finally {
            setDownloading(false);
        }
    };

    if (loading) return <Loading label="Loading AI report..." />;
    if (!report) return <div className="p-16 text-center text-slate-400">Report not found.</div>;

    return (
        <section className="mx-auto min-h-[75vh] max-w-6xl px-4 py-12 sm:px-6">
            <div className="flex flex-col gap-5 rounded-3xl border border-slate-800 bg-gradient-to-br from-panel to-purple-950/30 p-7 sm:flex-row sm:items-center sm:justify-between">
                <div><p className="text-sm uppercase tracking-widest text-purple-400">AI Match Report</p><h1 className="mt-2 text-3xl font-bold text-white">{report.title || report.jobTitle}</h1><p className="mt-2 text-sm text-slate-400">Generated with {report.model || "Groq AI"}</p></div>
                <div className="flex items-center gap-4"><div className="rounded-2xl bg-emerald-500/10 px-5 py-4 text-center"><Gauge className="mx-auto text-emerald-400" /><p className="mt-1 text-3xl font-black text-emerald-300">{report.matchScore}%</p><p className="text-xs text-slate-400">Match score</p></div><button onClick={downloadResume} disabled={downloading} className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-3 font-semibold hover:bg-purple-500 disabled:opacity-50"><Download size={18} /> {downloading ? "Generating..." : "ATS Resume"}</button></div>
            </div>

            <div className="mt-7 grid gap-6 lg:grid-cols-2">
                <Section icon={Wrench} title="Skill gaps" items={report.skillGaps} />
                <Section icon={GraduationCap} title="Preparation plan" items={report.preparationPlan} />
                <Section icon={ListChecks} title="Technical questions" items={report.technicalQuestions} />
                <Section icon={MessageSquareText} title="Behavioral questions" items={report.behavioralQuestions} />
            </div>
        </section>
    );
}
