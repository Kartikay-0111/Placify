import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export default function AppNavbar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error.message);
    }
  };

  const getNavLinks = () => {
    const commonLinks = [
      { to: '/', label: 'Home' },
    ];

    if (!user) {
      return [...commonLinks, { to: '/login', label: 'Login' }, { to: '/register', label: 'Register' }];
    }

    switch (user.role) {
      case 'student':
        return [...commonLinks, { to: '/jobs', label: 'Jobs' }, { to: '/dashboard', label: 'Dashboard' }, { to: '/applications', label: 'Applications' }, { to: '/profile', label: 'Profile' }];
      case 'company':
        return [
          ...commonLinks,
          { to: '/company/dashboard', label: 'Dashboard' },
          { to: '/company/jobs', label: 'Manage Jobs' },
          { to: '/company/jobs/new', label: 'Post Job' },
          { to: '/company/applications', label: 'Applications' }
        ];
      case 'admin':
        return [...commonLinks, { to: '/admin', label: 'Dashboard' }, { to: '/admin/jobs', label: 'Manage Jobs' }, { to: '/admin/applications', label: 'Manage Applications' }, { to: '/admin/students', label: 'Manage Students' }];
      default:
        return commonLinks;
    }
  };

  const navLinks = getNavLinks();

  return (
    <nav className="bg-white shadow-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold text-primary">Placify</Link>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navLinks.map((link) => (
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

          {/* User Menu */}
          <div className="flex items-center">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="rounded-full border p-2 text-sm font-medium"
                >
                  {user.email.substring(0, 2).toUpperCase()}
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg border rounded-md">
                    <div className="p-2 text-gray-600 text-sm">{user.email}</div>
                    <hr />
                    <button
                      onClick={() => navigate('/dashboard')}
                      className="block w-full text-left py-2 px-4 hover:bg-gray-100"
                    >
                      Dashboard
                    </button>
                    {user.role === 'student' && (
                      <button
                        onClick={() => navigate('/profile')}
                        className="block w-full text-left py-2 px-4 hover:bg-gray-100"
                      >
                        Profile
                      </button>
                    )}
                    {user.role === 'company' && (
                      <button
                        onClick={() => navigate('/company/profile')}
                        className="block w-full text-left py-2 px-4 hover:bg-gray-100"
                      >
                        Profile
                      </button>
                    )}
                    <button
                      onClick={handleSignOut}
                      className="block w-full text-left py-2 px-4 text-red-500 hover:bg-gray-100"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="ml-4 px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary/90 transition-custom"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="ml-4 px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600 transition-custom"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}