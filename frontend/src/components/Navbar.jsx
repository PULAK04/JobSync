import { Coins, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import api from "../utils/api.js";
import { endpoints } from "../utils/endpoints.js";
import { clearUser } from "../redux/slices/authSlice.js";

const navClass = ({ isActive }) =>
    `transition-colors ${isActive ? "text-white" : "text-slate-400 hover:text-white"}`;

export default function Navbar() {
    const [open, setOpen] = useState(false);
    const user = useSelector((state) => state.auth.user);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const logout = async () => {
        try {
            await api.get(`${endpoints.user}/logout`);
        } finally {
            dispatch(clearUser());
            toast.success("Logged out");
            navigate("/");
        }
    };

    const studentLinks = (
        <>
            <NavLink className={navClass} to="/jobs">Jobs</NavLink>
            <NavLink className={navClass} to="/saved-jobs">Saved Jobs</NavLink>
            <NavLink className={navClass} to="/ai-history">AI Reports</NavLink>
            <NavLink className={navClass} to="/profile">Profile</NavLink>
        </>
    );

    const recruiterLinks = (
        <>
            <NavLink className={navClass} to="/admin/companies">Companies</NavLink>
            <NavLink className={navClass} to="/admin/jobs">Jobs</NavLink>
            <NavLink className={navClass} to="/profile">Profile</NavLink>
        </>
    );

    return (
        <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-ink/90 backdrop-blur-xl">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
                <Link to="/" className="text-xl font-extrabold tracking-tight text-white">
                    Job<span className="text-purple-400">Sync</span>
                </Link>

                <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
                    <NavLink className={navClass} to="/">Home</NavLink>
                    {!user && <NavLink className={navClass} to="/jobs">Jobs</NavLink>}
                    {user?.role === "student" && studentLinks}
                    {user?.role === "recruiter" && recruiterLinks}
                </nav>

                <div className="hidden items-center gap-3 md:flex">
                    {user?.role === "student" && (
                        <Link to="/credits" className="flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1.5 text-sm font-semibold text-amber-300">
                            <Coins size={16} /> {user.aiCredits ?? 0} credits
                        </Link>
                    )}
                    {user ? (
                        <button onClick={logout} className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800">
                            <LogOut size={16} /> Logout
                        </button>
                    ) : (
                        <>
                            <Link to="/login" className="text-sm text-slate-300 hover:text-white">Login</Link>
                            <Link to="/signup" className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-500">Sign up</Link>
                        </>
                    )}
                </div>

                <button onClick={() => setOpen((value) => !value)} className="text-slate-200 md:hidden" aria-label="Toggle menu">
                    {open ? <X /> : <Menu />}
                </button>
            </div>

            {open && (
                <div className="border-t border-slate-800 bg-ink px-4 py-4 md:hidden">
                    <div className="flex flex-col gap-4 text-sm" onClick={() => setOpen(false)}>
                        <NavLink className={navClass} to="/">Home</NavLink>
                        {!user && <NavLink className={navClass} to="/jobs">Jobs</NavLink>}
                        {user?.role === "student" && studentLinks}
                        {user?.role === "recruiter" && recruiterLinks}
                        {user?.role === "student" && <NavLink className={navClass} to="/credits">Buy Credits ({user.aiCredits ?? 0})</NavLink>}
                        {user ? <button onClick={logout} className="text-left text-slate-300">Logout</button> : <NavLink className={navClass} to="/login">Login</NavLink>}
                    </div>
                </div>
            )}
        </header>
    );
}
