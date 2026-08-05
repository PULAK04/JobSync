import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import Loading from "./shared/Loading.jsx";

export default function ProtectedRoute({ children }) {
    const { user, hydrated } = useSelector((state) => state.auth);
    const location = useLocation();

    if (!hydrated) return <Loading label="Checking session..." />;
    if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
    return children;
}
