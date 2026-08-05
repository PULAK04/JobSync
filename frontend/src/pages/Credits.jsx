import { Check, Coins, History, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import api from "../utils/api.js";
import { endpoints } from "../utils/endpoints.js";
import { setUser } from "../redux/slices/authSlice.js";

const loadRazorpay = () => new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
});

export default function Credits() {
    const [plans, setPlans] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [buying, setBuying] = useState("");
    const user = useSelector((state) => state.auth.user);
    const dispatch = useDispatch();

    const loadHistory = () => api.get(`${endpoints.payment}/history`)
        .then(({ data }) => setTransactions(data.transactions || []))
        .catch(() => {});

    useEffect(() => {
        api.get(`${endpoints.payment}/plans`).then(({ data }) => setPlans(data.plans || [])).catch(() => toast.error("Unable to load credit plans"));
        loadHistory();
    }, []);

    const buyCredits = async (planId) => {
        setBuying(planId);
        try {
            const loaded = await loadRazorpay();
            if (!loaded) throw new Error("Razorpay Checkout could not be loaded");

            const { data } = await api.post(`${endpoints.payment}/create-order`, { planId });
            const options = {
                key: data.key,
                amount: data.order.amount,
                currency: data.order.currency,
                name: "JobSync",
                description: `${data.plan.credits} AI Match credits`,
                order_id: data.order.id,
                prefill: {
                    name: user.fullname,
                    email: user.email,
                    contact: user.phoneNumber || ""
                },
                theme: { color: "#7c3aed" },
                handler: async (response) => {
                    try {
                        const verified = await api.post(`${endpoints.payment}/verify`, response);
                        dispatch(setUser(verified.data.user));
                        toast.success(verified.data.message);
                        await loadHistory();
                    } catch (error) {
                        toast.error(error.response?.data?.message || "Payment verification failed. Keep the payment ID and contact support.");
                    }
                },
                modal: {
                    ondismiss: () => toast.info("Payment checkout closed")
                }
            };

            const checkout = new window.Razorpay(options);
            checkout.on("payment.failed", (response) => {
                toast.error(response.error?.description || "Payment failed");
            });
            checkout.open();
        } catch (error) {
            toast.error(error.response?.data?.message || error.message || "Unable to start payment");
        } finally {
            setBuying("");
        }
    };

    return (
        <section className="mx-auto min-h-[75vh] max-w-6xl px-4 py-12 sm:px-6">
            <div className="text-center"><span className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-4 py-2 text-sm text-amber-300"><Coins size={17} /> Current balance: {user.aiCredits ?? 0}</span><h1 className="mt-5 text-4xl font-black text-white">Buy AI Match credits</h1><p className="mx-auto mt-3 max-w-2xl text-slate-400">One new AI Match Report uses one credit. Opening an existing report does not use another credit.</p></div>

            <div className="mt-10 grid gap-5 md:grid-cols-3">
                {plans.map((plan) => (
                    <div key={plan.id} className={`relative rounded-3xl border bg-panel p-7 ${plan.id === "popular" ? "border-purple-500 shadow-xl shadow-purple-950/30" : "border-slate-800"}`}>
                        {plan.id === "popular" && <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-purple-600 px-3 py-1 text-xs font-semibold">Most popular</span>}
                        <Sparkles className="text-purple-400" /><h2 className="mt-4 text-xl font-bold text-white">{plan.name}</h2><p className="mt-4 text-4xl font-black text-white">₹{plan.displayAmount}</p><p className="mt-2 text-slate-400">{plan.credits} AI credits</p>
                        <ul className="mt-6 space-y-3 text-sm text-slate-300"><li className="flex gap-2"><Check size={17} className="text-emerald-400" /> {plan.credits} new AI Match Reports</li><li className="flex gap-2"><Check size={17} className="text-emerald-400" /> Existing report access remains free</li><li className="flex gap-2"><Check size={17} className="text-emerald-400" /> Secure Razorpay Checkout</li></ul>
                        <button onClick={() => buyCredits(plan.id)} disabled={buying === plan.id} className="mt-7 w-full rounded-xl bg-purple-600 py-3 font-semibold hover:bg-purple-500 disabled:opacity-50">{buying === plan.id ? "Opening checkout..." : "Buy credits"}</button>
                    </div>
                ))}
            </div>

            <div className="mt-10 rounded-3xl border border-slate-800 bg-panel p-6">
                <h2 className="flex items-center gap-2 text-xl font-bold text-white"><History className="text-purple-400" /> Credit history</h2>
                <div className="mt-5 overflow-x-auto"><table className="w-full min-w-[650px] text-left text-sm"><thead className="text-slate-500"><tr><th className="px-4 py-3">Date</th><th className="px-4 py-3">Type</th><th className="px-4 py-3">Change</th><th className="px-4 py-3">Balance</th><th className="px-4 py-3">Description</th></tr></thead><tbody>{transactions.map((item) => <tr key={item._id} className="border-t border-slate-800"><td className="px-4 py-4 text-slate-400">{new Date(item.createdAt).toLocaleString()}</td><td className="px-4 py-4">{item.type.replaceAll("_", " ")}</td><td className={`px-4 py-4 font-semibold ${item.amount > 0 ? "text-emerald-400" : "text-rose-400"}`}>{item.amount > 0 ? "+" : ""}{item.amount}</td><td className="px-4 py-4">{item.balanceAfter}</td><td className="px-4 py-4 text-slate-400">{item.description}</td></tr>)}</tbody></table>{!transactions.length && <p className="py-8 text-center text-slate-400">No credit transactions yet.</p>}</div>
            </div>

            <p className="mt-6 text-center text-xs text-slate-500">This integration intentionally does not use Razorpay webhooks. Credits are added only after the frontend success response is verified by the backend.</p>
        </section>
    );
}
