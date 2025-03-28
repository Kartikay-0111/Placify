import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export default function Header() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const getNavLinks = () => {
    const commonLinks = [
      { name: 'Home', path: '/' },
      { name: 'Jobs', path: '/jobs' },
    ];
    
    if (!user) {
      return [...commonLinks, { name: 'Login', path: '/login' }, { name: 'Register', path: '/register' }];
    }
    
    switch (user.role) {
      case 'admin':
        return [...commonLinks, { name: 'Dashboard', path: '/admin' }, { name: 'Manage Jobs', path: '/admin/jobs' }, { name: 'Manage Applications', path: '/admin/applications' }];
      case 'company':
        return [...commonLinks, { name: 'Dashboard', path: '/company/dashboard' }];
      case 'student':
      default:
        return [...commonLinks, { name: 'Dashboard', path: '/dashboard' }, { name: 'Applications', path: '/applications' }, { name: 'Profile', path: '/profile' }];
    }
  };
  
  const navLinks = getNavLinks();

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-white">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold">Placify</Link>
            <nav className="ml-10 hidden space-x-4 md:flex">
              {navLinks.map((link) => (
                <Link to={link.path} key={link.path} className="text-sm font-medium hover:text-blue-500">
                  {link.name}
                </Link>
              ))}
            </nav>
          </div>
          
          <div className="flex items-center space-x-2">
            {!user ? (
              <>
                <Link to="/login" className="hidden md:inline-block px-4 py-2 border rounded-md hover:bg-gray-100">Sign In</Link>
                <Link to="/register" className="hidden md:inline-block px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">Sign Up</Link>
                <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                  ☰
                </button>
              </>
            ) : (
              <>
                <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                  ☰
                </button>
                <button className="rounded-full border p-2" onClick={() => setUserMenuOpen(!userMenuOpen)}>
                  {user.email.substring(0, 2).toUpperCase()}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
      
      {mobileMenuOpen && (
        <div className="md:hidden p-4 bg-gray-100 border-t">
          {navLinks.map((link) => (
            <Link to={link.path} key={link.path} className="block py-2 text-sm hover:text-blue-500">
              {link.name}
            </Link>
          ))}
          {user && (
            <button onClick={signOut} className="w-full text-left text-red-500 py-2">Sign Out</button>
          )}
        </div>
      )}
      
      {userMenuOpen && user && (
        <div className="absolute right-4 mt-2 w-48 bg-white shadow-lg border rounded-md">
          <div className="p-2 text-gray-600 text-sm">{user.email}</div>
          <hr />
          <button onClick={() => navigate('/dashboard')} className="block w-full text-left py-2 px-4 hover:bg-gray-100">Dashboard</button>
          {user.role === 'student' && <button onClick={() => navigate('/profile')} className="block w-full text-left py-2 px-4 hover:bg-gray-100">Profile</button>}
          <button onClick={signOut} className="block w-full text-left py-2 px-4 text-red-500 hover:bg-gray-100">Sign Out</button>
        </div>
      )}
    </header>
  );
}
