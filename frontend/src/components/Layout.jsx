import { Outlet } from "react-router-dom";
import Navbar from "./Navbar.jsx";

export default function Layout() {
    return (
        <div className="min-h-screen bg-ink text-slate-100">
            <Navbar />
            <main><Outlet /></main>
            <footer className="border-t border-slate-800 py-8 text-center text-sm text-slate-500">
                JobSync — AI-powered recruitment and career intelligence
            </footer>
        </div>
    );
}
