import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import RoleRoute from "./components/RoleRoute.jsx";
import { useCurrentUser } from "./hooks/useCurrentUser.js";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import Jobs from "./pages/Jobs.jsx";
import JobDescription from "./pages/JobDescription.jsx";
import Profile from "./pages/Profile.jsx";
import SavedJobs from "./pages/SavedJobs.jsx";
import Credits from "./pages/Credits.jsx";
import NotFound from "./pages/NotFound.jsx";
import AIHistory from "./interview/AIHistory.jsx";
import AIReport from "./interview/AIReport.jsx";
import AdminCompanies from "./admin/AdminCompanies.jsx";
import CompanyCreate from "./admin/CompanyCreate.jsx";
import CompanySetup from "./admin/CompanySetup.jsx";
import AdminJobs from "./admin/AdminJobs.jsx";
import PostJob from "./admin/PostJob.jsx";
import Applicants from "./admin/Applicants.jsx";

const Protected = ({ children }) => <ProtectedRoute>{children}</ProtectedRoute>;
const StudentOnly = ({ children }) => <ProtectedRoute><RoleRoute role="student">{children}</RoleRoute></ProtectedRoute>;
const RecruiterOnly = ({ children }) => <ProtectedRoute><RoleRoute role="recruiter">{children}</RoleRoute></ProtectedRoute>;

export default function App() {
    useCurrentUser();

    return (
        <Routes>
            <Route element={<Layout />}>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/jobs" element={<Jobs />} />
                <Route path="/browse" element={<Navigate to="/jobs" replace />} />
                <Route path="/description/:id" element={<JobDescription />} />

                <Route path="/profile" element={<Protected><Profile /></Protected>} />
                <Route path="/saved-jobs" element={<StudentOnly><SavedJobs /></StudentOnly>} />
                <Route path="/credits" element={<StudentOnly><Credits /></StudentOnly>} />
                <Route path="/ai-history" element={<StudentOnly><AIHistory /></StudentOnly>} />
                <Route path="/ai-report/:interviewId" element={<StudentOnly><AIReport /></StudentOnly>} />

                <Route path="/admin/companies" element={<RecruiterOnly><AdminCompanies /></RecruiterOnly>} />
                <Route path="/admin/companies/create" element={<RecruiterOnly><CompanyCreate /></RecruiterOnly>} />
                <Route path="/admin/companies/:id" element={<RecruiterOnly><CompanySetup /></RecruiterOnly>} />
                <Route path="/admin/jobs" element={<RecruiterOnly><AdminJobs /></RecruiterOnly>} />
                <Route path="/admin/jobs/create" element={<RecruiterOnly><PostJob /></RecruiterOnly>} />
                <Route path="/admin/jobs/:id/applicants" element={<RecruiterOnly><Applicants /></RecruiterOnly>} />

                <Route path="*" element={<NotFound />} />
            </Route>
        </Routes>
    );
}
