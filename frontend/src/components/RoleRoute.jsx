import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

export default function RoleRoute({ role, children }) {
    const user = useSelector((state) => state.auth.user);
    if (!user || user.role !== role) return <Navigate to="/" replace />;
    return children;
}
