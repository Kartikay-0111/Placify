import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export default function AppNavbar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error.message);
    }
  };

  const getNavLinks = () => {
    if (!user) return [];

    switch (user.role) {
      case 'student':
        return [
          { to: '/student/dashboard', label: 'Dashboard' },
          { to: '/student/profile', label: 'Profile' },
          { to: '/student/applications', label: 'Applications' },
          { to: '/jobs', label: 'Jobs' },
        ];
      case 'company':
        return [
          { to: '/company/dashboard', label: 'Dashboard' },
          { to: '/company/profile', label: 'Profile' },
          { to: '/company/jobs', label: 'Jobs' },
          { to: '/company/applications', label: 'Applications' },
        ];
      case 'admin':
        return [
          { to: '/admin/dashboard', label: 'Dashboard' },
          { to: '/admin/jobs', label: 'Jobs' },
        ];
      default:
        return [];
    }
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to="/" className="flex items-center">
              <span className="text-xl font-bold text-primary">Placement Cell</span>
            </Link>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {getNavLinks().map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 hover:text-primary transition-custom"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center">
            {user ? (
              <button
                onClick={handleSignOut}
                className="ml-4 px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary/90 transition-custom"
              >
                Sign Out
              </button>
            ) : (
              <Link
                to="/login"
                className="ml-4 px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary/90 transition-custom"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}