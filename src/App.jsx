import { BrowserRouter, Routes, Route ,Navigate} from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { useAuth } from "./contexts/AuthContext";
// Pages
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import StudentDashboard from "./pages/student/StudentDashboard";
import JobDetails from "./pages/student/JobDetails";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import JobListings from "./pages/student/JobListings";
import Profile from "./pages/student/Profile";
import Applications from "./pages/student/Applications";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import ApplicationsManagement from "./pages/admin/ApplicationsManagement";
import JobManagement from "./pages/admin/JobManagement";
import AdminStudentManagement from "./pages/admin/manageStudents";

// Company Pages
import CompanyProfile from "./pages/company/CompanyProfile";
import CompanyJobs from "./pages/company/CompanyJobs";
import CompanyDashboard from "./pages/company/CompanyDashboard";
import NewJob from "./pages/company/NewJob";
import EditJob from "./pages/company/EditJob";
import ManageApplications from "./pages/company/ManageApplications";
import InterviewManagement from "./pages/company/InterviewManagement";
import OfferManagement from "./pages/company/OffersManagement";

const AuthRedirect = ({ children }) => {
  const { user } = useAuth();
  return user ? <Navigate to="/" replace /> : children;
};

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<AuthRedirect><Login /></AuthRedirect>} />
        <Route path="/register" element={<AuthRedirect><Register /></AuthRedirect>} />
        <Route path="/jobs/:id" element={<JobDetails />} />

        {/* Protected Student Routes */}
        <Route element={<ProtectedRoute allowedRoles={["student"]} />}>
          <Route path="/jobs" element={<JobListings />} />
          <Route path="/dashboard" element={<StudentDashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/applications" element={<Applications />} />
        </Route>

        {/* Protected Admin Routes */}
        <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/applications" element={<ApplicationsManagement />} />
          <Route path="/admin/jobs" element={<JobManagement />} />
          <Route path="/admin/students" element={<AdminStudentManagement />} />
        </Route>

        {/* Protected Company Routes */}
        <Route element={<ProtectedRoute allowedRoles={["company"]} />}>
          <Route path="/company/dashboard" element={<CompanyDashboard />} />
          <Route path="/company/profile" element={<CompanyProfile />} />
          <Route path="/company/applications" element={<ManageApplications />} />
          <Route path="/company/interview" element={<InterviewManagement />} />
          <Route path="/company/offers" element={<OfferManagement />} />
          <Route path="/company/jobs" element={<CompanyJobs />} />
          <Route path="/company/jobs/new" element={<NewJob />} />
          <Route path="/company/jobs/edit/:id" element={<EditJob />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </AuthProvider>
  </BrowserRouter>
);

export default App;
