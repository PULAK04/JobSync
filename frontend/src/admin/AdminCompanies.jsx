import { Building2, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import api from "../utils/api.js";
import { endpoints } from "../utils/endpoints.js";
import Loading from "../components/shared/Loading.jsx";

export default function AdminCompanies() {
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get(`${endpoints.company}/get`)
            .then(({ data }) => setCompanies(data.companies || []))
            .catch((error) => toast.error(error.response?.data?.message || "Unable to load companies"))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <Loading label="Loading companies..." />;

    return (
        <section className="mx-auto min-h-[75vh] max-w-6xl px-4 py-12 sm:px-6">
            <div className="flex items-end justify-between gap-4"><div><p className="text-sm uppercase tracking-widest text-purple-400">Recruiter workspace</p><h1 className="mt-2 text-3xl font-bold text-white">Companies</h1></div><Link to="/admin/companies/create" className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-3 font-semibold"><Plus size={18} /> Create company</Link></div>
            <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {companies.map((company) => <Link key={company._id} to={`/admin/companies/${company._id}`} className="rounded-2xl border border-slate-800 bg-panel p-6 transition hover:border-purple-500/50"><div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl bg-slate-800">{company.logo ? <img src={company.logo} alt="" className="h-full w-full object-cover" /> : <Building2 className="text-purple-400" />}</div><h2 className="mt-4 text-xl font-bold text-white">{company.name}</h2><p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-400">{company.description || "Complete the company profile."}</p><p className="mt-4 text-sm text-purple-300">Edit company →</p></Link>)}
            </div>
            {!companies.length && <div className="mt-16 rounded-2xl border border-dashed border-slate-700 p-12 text-center text-slate-400">Create a company before posting jobs.</div>}
        </section>
    );
}
