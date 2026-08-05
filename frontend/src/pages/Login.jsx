import { KeyRound, LockKeyhole, Mail } from "lucide-react";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import api from "../utils/api.js";
import { endpoints } from "../utils/endpoints.js";
import { setUser } from "../redux/slices/authSlice.js";

export default function Login() {
    const [mode, setMode] = useState("password");
    const [otpStep, setOtpStep] = useState("request");
    const [form, setForm] = useState({ email: "", password: "", otp: "" });
    const [loginToken, setLoginToken] = useState("");
    const [maskedEmail, setMaskedEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();

    const finishLogin = (data) => {
        dispatch(setUser(data.user));
        toast.success(data.message || "Login successful");
        navigate(location.state?.from || "/", { replace: true });
    };

    const submitPasswordLogin = async (event) => {
        event.preventDefault();
        setLoading(true);

        try {
            const { data } = await api.post(`${endpoints.user}/login`, {
                email: form.email,
                password: form.password
            });
            finishLogin(data);
        } catch (error) {
            toast.error(error.response?.data?.message || "Unable to log in");
        } finally {
            setLoading(false);
        }
    };

    const requestOtp = async (event) => {
        event.preventDefault();
        setLoading(true);

        try {
            const { data } = await api.post(`${endpoints.user}/login/request-otp`, {
                email: form.email
            });
            setLoginToken(data.loginToken);
            setMaskedEmail(data.maskedEmail);
            setOtpStep("verify");
            toast.success(data.message);
            if (data.developmentOtp) toast.info(`Development OTP: ${data.developmentOtp}`);
        } catch (error) {
            toast.error(error.response?.data?.message || "Unable to send OTP");
        } finally {
            setLoading(false);
        }
    };

    const verifyOtp = async (event) => {
        event.preventDefault();
        setLoading(true);

        try {
            const { data } = await api.post(`${endpoints.user}/login/verify-otp`, {
                loginToken,
                otp: form.otp
            });
            finishLogin(data);
        } catch (error) {
            toast.error(error.response?.data?.message || "OTP verification failed");
        } finally {
            setLoading(false);
        }
    };

    const resendOtp = async () => {
        setLoading(true);

        try {
            const { data } = await api.post(`${endpoints.user}/login/resend-otp`, { loginToken });
            toast.success(data.message);
            if (data.developmentOtp) toast.info(`Development OTP: ${data.developmentOtp}`);
        } catch (error) {
            toast.error(error.response?.data?.message || "Unable to resend OTP");
        } finally {
            setLoading(false);
        }
    };

    const switchMode = (nextMode) => {
        setMode(nextMode);
        setOtpStep("request");
        setLoginToken("");
        setMaskedEmail("");
        setForm((current) => ({ ...current, otp: "" }));
    };

    return (
        <section className="mx-auto flex min-h-[75vh] max-w-7xl items-center justify-center px-4 py-12">
            <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-panel p-7 shadow-2xl shadow-black/30">
                <h1 className="text-2xl font-bold text-white">Welcome back</h1>
                <p className="mt-2 text-sm text-slate-400">Choose password login or passwordless OTP login.</p>

                <div className="mt-6 grid grid-cols-2 rounded-xl border border-slate-700 bg-slate-950/50 p-1">
                    <button
                        type="button"
                        onClick={() => switchMode("password")}
                        className={`inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition ${mode === "password" ? "bg-purple-600 text-white" : "text-slate-400 hover:text-white"}`}
                    >
                        <LockKeyhole size={16} /> Password
                    </button>
                    <button
                        type="button"
                        onClick={() => switchMode("otp")}
                        className={`inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition ${mode === "otp" ? "bg-purple-600 text-white" : "text-slate-400 hover:text-white"}`}
                    >
                        <KeyRound size={16} /> Login with OTP
                    </button>
                </div>

                {mode === "password" && (
                    <form onSubmit={submitPasswordLogin} className="mt-7 space-y-4">
                        <label className="block text-sm text-slate-300">
                            Email
                            <div className="relative mt-2">
                                <Mail className="absolute left-3 top-3.5 text-slate-500" size={18} />
                                <input required type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} className="w-full rounded-xl border border-slate-700 bg-slate-950/60 py-3 pl-10 pr-4 outline-none focus:border-purple-500" />
                            </div>
                        </label>
                        <label className="block text-sm text-slate-300">
                            Password
                            <input required type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950/60 px-4 py-3 outline-none focus:border-purple-500" />
                        </label>
                        <button disabled={loading} className="w-full rounded-xl bg-purple-600 py-3 font-semibold text-white hover:bg-purple-500 disabled:opacity-50">
                            {loading ? "Logging in..." : "Login with password"}
                        </button>
                        <button type="button" onClick={() => switchMode("otp")} className="w-full text-sm text-purple-400 hover:text-purple-300">
                            Forgot your password or prefer OTP? Login with OTP
                        </button>
                    </form>
                )}

                {mode === "otp" && otpStep === "request" && (
                    <form onSubmit={requestOtp} className="mt-7 space-y-4">
                        <p className="text-sm leading-6 text-slate-400">Enter your registered email. You do not need your password for this login method.</p>
                        <label className="block text-sm text-slate-300">
                            Email
                            <input required type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950/60 px-4 py-3 outline-none focus:border-purple-500" />
                        </label>
                        <button disabled={loading} className="w-full rounded-xl bg-purple-600 py-3 font-semibold text-white hover:bg-purple-500 disabled:opacity-50">
                            {loading ? "Sending OTP..." : "Send login OTP"}
                        </button>
                    </form>
                )}

                {mode === "otp" && otpStep === "verify" && (
                    <form onSubmit={verifyOtp} className="mt-7 space-y-4">
                        <p className="text-sm text-slate-400">Enter the OTP sent to <span className="font-semibold text-slate-200">{maskedEmail}</span>.</p>
                        <label className="block text-sm text-slate-300">
                            6-digit OTP
                            <input required inputMode="numeric" maxLength={6} value={form.otp} onChange={(event) => setForm({ ...form, otp: event.target.value.replace(/\D/g, "") })} className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950/60 px-4 py-3 text-center text-2xl tracking-[0.5em] outline-none focus:border-purple-500" />
                        </label>
                        <button disabled={loading || form.otp.length !== 6} className="w-full rounded-xl bg-purple-600 py-3 font-semibold text-white hover:bg-purple-500 disabled:opacity-50">
                            {loading ? "Verifying..." : "Verify and login"}
                        </button>
                        <div className="flex justify-between text-sm">
                            <button type="button" onClick={() => setOtpStep("request")} className="text-slate-400 hover:text-white">Change email</button>
                            <button type="button" disabled={loading} onClick={resendOtp} className="text-purple-400 hover:text-purple-300 disabled:opacity-50">Resend OTP</button>
                        </div>
                    </form>
                )}

                <p className="mt-6 text-center text-sm text-slate-400">New to JobSync? <Link className="text-purple-400" to="/signup">Create an account</Link></p>
            </div>
        </section>
    );
}
