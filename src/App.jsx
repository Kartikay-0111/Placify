import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";

// Pages
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import StudentDashboard from "./pages/StudentDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import JobDetails from "./pages/JobDetails";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import JobListings from "./pages/JobListings";
import Profile from "./pages/Profile";
import Applications from "./pages/Applications";

// Admin Pages
import ApplicationsManagement from "./pages/admin/ApplicationsManagement";
import JobManagement from "./pages/admin/JobManagement";

// Company Pages
import CompanyProfile from "./pages/company/CompanyProfile";
import CompanyJobs from "./pages/company/CompanyJobs";
import CompanyDashboard from "./pages/company/CompanyDashboard";
import NewJob from "./pages/company/NewJob";
import EditJob from "./pages/company/EditJob";

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/jobs" element={<JobListings />} />
        <Route path="/jobs/:id" element={<JobDetails />} />

        {/* Protected Student Routes */}
        <Route element={<ProtectedRoute allowedRoles={["student"]} />}>
          <Route path="/dashboard" element={<StudentDashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/applications" element={<Applications />} />
        </Route>

        {/* Protected Admin Routes */}
        <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/applications" element={<ApplicationsManagement />} />
          <Route path="/admin/jobs" element={<JobManagement />} />
        </Route>

        {/* Protected Company Routes */}
        <Route element={<ProtectedRoute allowedRoles={["company"]} />}>
          <Route path="/company/dashboard" element={<CompanyDashboard />} />
          <Route path="/company/profile" element={<CompanyProfile />} />
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
