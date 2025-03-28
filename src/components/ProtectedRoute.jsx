
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader } from "lucide-react";

export default function ProtectedRoute({ allowedRoles }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  console.log("ProtectedRoute - user:", user, "loading:", loading, "allowedRoles:", allowedRoles);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // If not logged in, redirect to login page
  if (!user) {
    console.log("User not logged in, redirecting to login");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If user role is not allowed, redirect to appropriate dashboard
  if (!allowedRoles.includes(user.role)) {
    console.log("User role not allowed, redirecting to appropriate dashboard");
    let redirectPath;
    switch (user.role) {
      case 'admin':
        redirectPath = '/admin';
        break;
      case 'company':
        redirectPath = '/company/dashboard';
        break;
      case 'student':
      default:
        redirectPath = '/dashboard';
    }
    return <Navigate to={redirectPath} replace />;
  }

  // If all checks pass, render the protected content
  console.log("All checks passed, rendering protected content");
  return <Outlet />;
}
