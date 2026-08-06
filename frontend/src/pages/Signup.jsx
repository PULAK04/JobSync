import { useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";

import api from "../utils/api.js";
import { endpoints } from "../utils/endpoints.js";
import { setUser } from "../redux/slices/authSlice.js";

export default function Signup() {
    const [form, setForm] = useState({
        fullname: "",
        email: "",
        phoneNumber: "",
        password: "",
        role: "student",
        file: null
    });

    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const submit = async (event) => {
        event.preventDefault();
        setLoading(true);

        const payload = new FormData();

        Object.entries(form).forEach(([key, value]) => {
            if (value) {
                payload.append(key, value);
            }
        });

        try {
            const { data } = await api.post(
                `${endpoints.user}/register`,
                payload
            );

            dispatch(setUser(data.user));
            toast.success(data.message);
            navigate("/");
        } catch (error) {
            toast.error(
                error.response?.data?.message ||
                "Unable to create account"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="mx-auto flex min-h-[75vh] max-w-7xl items-center justify-center px-4 py-12">
            <form
                onSubmit={submit}
                className="w-full max-w-xl rounded-2xl border border-slate-800 bg-panel p-7 shadow-2xl shadow-black/30"
            >
                <h1 className="text-2xl font-bold text-white">
                    Create your JobSync account
                </h1>

                <p className="mt-2 text-sm text-slate-400">
                    Job seekers receive free AI credits after registration.
                </p>

                <div className="mt-7 grid gap-4 sm:grid-cols-2">
                    <label className="text-sm text-slate-300">
                        Full name

                        <input
                            required
                            type="text"
                            value={form.fullname}
                            onChange={(event) =>
                                setForm({
                                    ...form,
                                    fullname: event.target.value
                                })
                            }
                            placeholder="Enter your full name"
                            autoComplete="name"
                            className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950/60 px-4 py-3 outline-none focus:border-purple-500"
                        />
                    </label>

                    <label className="text-sm text-slate-300">
                        Phone number

                        <input
                            type="tel"
                            value={form.phoneNumber}
                            onChange={(event) =>
                                setForm({
                                    ...form,
                                    phoneNumber: event.target.value
                                })
                            }
                            placeholder="Enter your phone number"
                            autoComplete="tel"
                            className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950/60 px-4 py-3 outline-none focus:border-purple-500"
                        />
                    </label>

                    <label className="text-sm text-slate-300 sm:col-span-2">
                        Email

                        <input
                            required
                            type="email"
                            value={form.email}
                            onChange={(event) =>
                                setForm({
                                    ...form,
                                    email: event.target.value
                                })
                            }
                            placeholder="Enter your email address"
                            autoComplete="email"
                            className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950/60 px-4 py-3 outline-none focus:border-purple-500"
                        />
                    </label>

                    <div className="text-sm text-slate-300">
                        <label htmlFor="signup-password">
                            Password
                        </label>

                        <div className="relative mt-2">
                            <input
                                id="signup-password"
                                required
                                minLength={6}
                                type={
                                    showPassword
                                        ? "text"
                                        : "password"
                                }
                                value={form.password}
                                onChange={(event) =>
                                    setForm({
                                        ...form,
                                        password: event.target.value
                                    })
                                }
                                placeholder="Create a password"
                                autoComplete="new-password"
                                className="w-full rounded-xl border border-slate-700 bg-slate-950/60 px-4 py-3 pr-12 outline-none focus:border-purple-500"
                            />

                            <button
                                type="button"
                                onClick={() =>
                                    setShowPassword(
                                        (previousValue) =>
                                            !previousValue
                                    )
                                }
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-white focus:outline-none"
                                aria-label={
                                    showPassword
                                        ? "Hide password"
                                        : "Show password"
                                }
                                title={
                                    showPassword
                                        ? "Hide password"
                                        : "Show password"
                                }
                            >
                                {showPassword ? (
                                    <EyeOff size={20} />
                                ) : (
                                    <Eye size={20} />
                                )}
                            </button>
                        </div>
                    </div>

                    <label className="text-sm text-slate-300">
                        Account type

                        <select
                            value={form.role}
                            onChange={(event) =>
                                setForm({
                                    ...form,
                                    role: event.target.value
                                })
                            }
                            className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950/60 px-4 py-3 outline-none focus:border-purple-500"
                        >
                            <option value="student">
                                Job seeker
                            </option>

                            <option value="recruiter">
                                Recruiter
                            </option>
                        </select>
                    </label>

                    <label className="text-sm text-slate-300 sm:col-span-2">
                        Profile photo{" "}
                        <span className="text-slate-500">
                            (optional)
                        </span>

                        <input
                            type="file"
                            accept="image/png,image/jpeg,image/webp"
                            onChange={(event) =>
                                setForm({
                                    ...form,
                                    file:
                                        event.target.files?.[0] ||
                                        null
                                })
                            }
                            className="mt-2 block w-full rounded-xl border border-dashed border-slate-700 px-4 py-3 text-slate-400 file:mr-4 file:rounded-lg file:border-0 file:bg-purple-600 file:px-3 file:py-2 file:text-white"
                        />
                    </label>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="mt-6 w-full rounded-xl bg-purple-600 py-3 font-semibold text-white transition-colors hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {loading
                        ? "Creating account..."
                        : "Create account"}
                </button>

                <p className="mt-6 text-center text-sm text-slate-400">
                    Already registered?{" "}
                    <Link
                        className="font-medium text-purple-400 hover:text-purple-300"
                        to="/login"
                    >
                        Log in
                    </Link>
                </p>
            </form>
        </section>
    );
}