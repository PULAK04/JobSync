import {
    Download,
    Gauge,
    GraduationCap,
    ListChecks,
    MessageSquareText,
    Wrench,
    ClipboardList,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";

import Loading from "../components/shared/Loading.jsx";
import api from "../utils/api.js";
import { endpoints } from "../utils/endpoints.js";

function QuestionCard({ question, index }) {
    return (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 px-5 py-5 transition hover:border-slate-700">
            <div className="flex items-start gap-4">
                <span className="flex h-8 min-w-8 shrink-0 items-center justify-center rounded-lg bg-purple-500/15 text-sm font-bold text-purple-400">
                    Q{index + 1}
                </span>

                <p className="text-sm font-semibold leading-7 text-slate-200">
                    {question}
                </p>
            </div>
        </div>
    );
}

function PreparationCard({ item, index }) {
    const text = String(item || "");
    const colonIndex = text.indexOf(":");

    const dayTitle =
        colonIndex !== -1
            ? text.slice(0, colonIndex)
            : `Day ${index + 1}`;

    const description =
        colonIndex !== -1
            ? text.slice(colonIndex + 1).trim()
            : text;

    return (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 px-5 py-5">
            <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-500/10">
                    <ClipboardList
                        size={19}
                        className="text-purple-400"
                    />
                </div>

                <div className="min-w-0">
                    <h3 className="text-base font-bold text-white">
                        {dayTitle}
                    </h3>

                    <p className="mt-2 text-sm leading-7 text-slate-400">
                        {description}
                    </p>
                </div>
            </div>
        </div>
    );
}

function EmptyState({ message }) {
    return (
        <div className="flex min-h-[260px] items-center justify-center rounded-2xl border border-dashed border-slate-800 bg-slate-950/30 px-6 text-center">
            <p className="text-sm text-slate-500">
                {message}
            </p>
        </div>
    );
}

export default function AIReport() {
    const { interviewId } = useParams();

    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [downloading, setDownloading] = useState(false);

    const [activeSection, setActiveSection] =
        useState("technical");

    useEffect(() => {
        api.get(
            `${endpoints.interview}/report/${interviewId}`
        )
            .then(({ data }) => {
                setReport(data.report);
            })
            .catch((error) => {
                toast.error(
                    error.response?.data?.message ||
                        "Unable to load report"
                );
            })
            .finally(() => {
                setLoading(false);
            });
    }, [interviewId]);

    const downloadResume = async () => {
        setDownloading(true);

        try {
            const response = await api.post(
                `${endpoints.interview}/resume/pdf/${interviewId}`,
                {},
                {
                    responseType: "blob",
                    timeout: 90000,
                }
            );

            const url = URL.createObjectURL(
                response.data
            );

            const anchor =
                document.createElement("a");

            anchor.href = url;

            anchor.download = `jobsync_${
                report?.jobTitle ||
                report?.title ||
                "resume"
            }.pdf`;

            document.body.appendChild(anchor);
            anchor.click();
            anchor.remove();

            URL.revokeObjectURL(url);

            toast.success("Resume downloaded");
        } catch (error) {
            toast.error(
                error.response?.data?.message ||
                    "Unable to generate resume PDF"
            );
        } finally {
            setDownloading(false);
        }
    };

    const sectionContent = useMemo(() => {
        if (!report) return null;

        switch (activeSection) {
            case "technical":
                return {
                    title: "Technical Questions",
                    description:
                        "Technical questions tailored to the selected role.",
                    items:
                        report.technicalQuestions || [],
                };

            case "behavioral":
                return {
                    title: "Behavioral Questions",
                    description:
                        "Behavioral questions to help you prepare for the interview.",
                    items:
                        report.behavioralQuestions || [],
                };

            case "preparation":
                return {
                    title: "Preparation Plan",
                    description:
                        "A personalized day-wise preparation plan for your interview.",
                    items:
                        report.preparationPlan || [],
                };

            default:
                return {
                    title: "Technical Questions",
                    description:
                        "Technical questions tailored to the selected role.",
                    items:
                        report.technicalQuestions || [],
                };
        }
    }, [activeSection, report]);

    if (loading) {
        return (
            <Loading label="Loading AI report..." />
        );
    }

    if (!report) {
        return (
            <div className="flex min-h-[70vh] items-center justify-center px-6 text-center">
                <div>
                    <p className="text-xl font-semibold text-white">
                        Report not found
                    </p>

                    <p className="mt-2 text-sm text-slate-500">
                        The requested AI match report could
                        not be found.
                    </p>
                </div>
            </div>
        );
    }

    const score = Math.max(
        0,
        Math.min(
            100,
            Number(report.matchScore) || 0
        )
    );

    const scoreMessage =
        score >= 80
            ? "Strong match for this role"
            : score >= 60
            ? "Good match with some gaps"
            : score >= 40
            ? "Moderate match for this role"
            : "Significant skill gaps identified";

    const skillGaps = report.skillGaps || [];

    return (
        <section className="mx-auto min-h-[75vh] max-w-[1400px] px-4 py-8 sm:px-6 lg:px-8">
            {/* HEADER */}
            <div className="mb-6 flex flex-col gap-5 rounded-3xl border border-slate-800 bg-gradient-to-r from-panel via-slate-900 to-purple-950/20 p-6 shadow-xl shadow-black/20 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-purple-400">
                        AI Match Report
                    </p>

                    <h1 className="mt-2 truncate text-2xl font-bold text-white sm:text-3xl">
                        {report.title ||
                            report.jobTitle}
                    </h1>

                   
                </div>

                <button
                    type="button"
                    onClick={downloadResume}
                    disabled={downloading}
                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-purple-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-900/20 transition hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <Download size={18} />

                    {downloading
                        ? "Generating..."
                        : "Download ATS Resume"}
                </button>
            </div>

            {/* MAIN LAYOUT */}
            <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)_280px]">
                {/* LEFT SIDEBAR */}
                <aside className="h-fit rounded-2xl border border-slate-800 bg-panel p-3 lg:sticky lg:top-6">
                    <p className="px-3 pb-3 pt-2 text-xs font-semibold uppercase tracking-widest text-slate-500">
                        Sections
                    </p>

                    <div className="space-y-1">
                        {/* Technical */}
                        <button
                            type="button"
                            onClick={() =>
                                setActiveSection(
                                    "technical"
                                )
                            }
                            className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold transition ${
                                activeSection ===
                                "technical"
                                    ? "bg-purple-500/10 text-purple-400 ring-1 ring-purple-500/20"
                                    : "text-slate-400 hover:bg-slate-900 hover:text-white"
                            }`}
                        >
                            <ListChecks size={19} />
                            <span>
                                Technical Questions
                            </span>
                        </button>

                        {/* Behavioral */}
                        <button
                            type="button"
                            onClick={() =>
                                setActiveSection(
                                    "behavioral"
                                )
                            }
                            className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold transition ${
                                activeSection ===
                                "behavioral"
                                    ? "bg-purple-500/10 text-purple-400 ring-1 ring-purple-500/20"
                                    : "text-slate-400 hover:bg-slate-900 hover:text-white"
                            }`}
                        >
                            <MessageSquareText
                                size={19}
                            />

                            <span>
                                Behavioral Questions
                            </span>
                        </button>

                        {/* Preparation */}
                        <button
                            type="button"
                            onClick={() =>
                                setActiveSection(
                                    "preparation"
                                )
                            }
                            className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold transition ${
                                activeSection ===
                                "preparation"
                                    ? "bg-purple-500/10 text-purple-400 ring-1 ring-purple-500/20"
                                    : "text-slate-400 hover:bg-slate-900 hover:text-white"
                            }`}
                        >
                            <GraduationCap
                                size={19}
                            />

                            <span>
                                Preparation Plan
                            </span>
                        </button>
                    </div>
                </aside>

                {/* CENTER CONTENT */}
                <main className="min-w-0 rounded-2xl border border-slate-800 bg-panel p-5 sm:p-6">
                    <div className="mb-6 flex flex-col gap-3 border-b border-slate-800 pb-5 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-white">
                                {
                                    sectionContent.title
                                }
                            </h2>

                            <p className="mt-2 text-sm leading-6 text-slate-500">
                                {
                                    sectionContent.description
                                }
                            </p>
                        </div>

                        <span className="w-fit rounded-full border border-slate-800 bg-slate-950 px-3 py-1 text-xs font-medium text-slate-500">
                            {activeSection ===
                            "preparation"
                                ? `${sectionContent.items.length} days`
                                : `${sectionContent.items.length} questions`}
                        </span>
                    </div>

                    {sectionContent.items.length ===
                    0 ? (
                        <EmptyState
                            message={`No ${sectionContent.title.toLowerCase()} available.`}
                        />
                    ) : activeSection ===
                      "preparation" ? (
                        <div className="space-y-4">
                            {sectionContent.items.map(
                                (
                                    item,
                                    index
                                ) => (
                                    <PreparationCard
                                        key={`preparation-${index}`}
                                        item={item}
                                        index={index}
                                    />
                                )
                            )}
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {sectionContent.items.map(
                                (
                                    item,
                                    index
                                ) => (
                                    <QuestionCard
                                        key={`${activeSection}-${index}`}
                                        question={
                                            item
                                        }
                                        index={index}
                                    />
                                )
                            )}
                        </div>
                    )}
                </main>

                {/* RIGHT SIDEBAR */}
                <aside className="space-y-6">
                    {/* MATCH SCORE */}
                    <div className="rounded-2xl border border-slate-800 bg-panel p-6">
                        <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                            Match Score
                        </p>

                        <div className="mt-6 flex flex-col items-center">
                            <div className="relative flex h-40 w-40 items-center justify-center">
                                <div
                                    className="absolute inset-0 rounded-full"
                                    style={{
                                        background: `conic-gradient(#22c55e ${
                                            score *
                                            3.6
                                        }deg, #1e293b ${
                                            score *
                                            3.6
                                        }deg)`,
                                    }}
                                />

                                <div className="absolute inset-[7px] flex flex-col items-center justify-center rounded-full bg-panel">
                                    <Gauge
                                        size={20}
                                        className="mb-1 text-emerald-400"
                                    />

                                    <span className="text-4xl font-black text-white">
                                        {score}
                                        <span className="text-xl">
                                            %
                                        </span>
                                    </span>
                                </div>
                            </div>

                            <p className="mt-5 text-center text-sm font-semibold text-emerald-400">
                                {scoreMessage}
                            </p>
                        </div>
                    </div>

                    {/* SKILL GAPS */}
                    <div className="rounded-2xl border border-slate-800 bg-panel p-6">
                        <div className="flex items-center gap-2">
                            <Wrench
                                size={18}
                                className="text-purple-400"
                            />

                            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">
                                Skill Gaps
                            </h3>
                        </div>

                        {skillGaps.length ===
                        0 ? (
                            <div className="mt-5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                                <p className="text-sm leading-6 text-emerald-400">
                                    No major skill gaps
                                    were identified
                                    for this role.
                                </p>
                            </div>
                        ) : (
                            <div className="mt-5 space-y-3">
                                {skillGaps.map(
                                    (
                                        gap,
                                        index
                                    ) => {
                                        const tone =
                                            index %
                                                3 ===
                                            0
                                                ? "border-red-500/20 bg-red-500/10 text-red-300"
                                                : index %
                                                      3 ===
                                                  1
                                                ? "border-amber-500/20 bg-amber-500/10 text-amber-300"
                                                : "border-emerald-500/20 bg-emerald-500/10 text-emerald-300";

                                        return (
                                            <div
                                                key={`skill-gap-${index}`}
                                                className={`rounded-xl border px-4 py-3 text-sm leading-6 ${tone}`}
                                            >
                                                {
                                                    gap
                                                }
                                            </div>
                                        );
                                    }
                                )}
                            </div>
                        )}
                    </div>
                </aside>
            </div>
        </section>
    );
}