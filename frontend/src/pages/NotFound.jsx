import { Link } from "react-router-dom";

export default function NotFound() {
    return <div className="mx-auto flex min-h-[70vh] max-w-2xl flex-col items-center justify-center px-4 text-center"><p className="text-7xl font-black text-purple-500">404</p><h1 className="mt-4 text-3xl font-bold text-white">Page not found</h1><p className="mt-3 text-slate-400">The page you requested does not exist.</p><Link to="/" className="mt-6 rounded-xl bg-purple-600 px-5 py-3 font-semibold">Back home</Link></div>;
}
