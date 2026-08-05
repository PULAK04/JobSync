export default function Loading({ label = "Loading..." }) {
    return (
        <div className="flex min-h-[40vh] items-center justify-center gap-3 text-slate-300">
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-purple-400 border-t-transparent" />
            <span>{label}</span>
        </div>
    );
}
