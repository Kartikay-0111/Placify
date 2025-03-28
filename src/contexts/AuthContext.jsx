import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const initAuth = async () => {
      try {
        // Set up auth state listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            if (session?.user) {
              const userRole = session.user.user_metadata?.role || 'student';
              setUser({
                id: session.user.id,
                email: session.user.email,
                role: userRole
              });
            } else {
              setUser(null);
            }
            setLoading(false);
          }
        );

        // Check for existing session
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const userRole = session.user.user_metadata?.role || 'student';
          setUser({
            id: session.user.id,
            email: session.user.email,
            role: userRole
          });
        }

        setLoading(false);
        return () => subscription.unsubscribe();
      } catch (error) {
        console.error('Auth initialization error:', error);
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const signIn = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      const userRole = data.user.user_metadata?.role || 'company';
      console.log(data.user);
      setUser({
        id: data.user.id,
        email: data.user.email,
        role: userRole
      });

      // Navigate based on role
      switch (userRole) {
        case 'admin':
          navigate('/admin');
          break;
        case 'company':
          navigate('/company/dashboard');
          break;
        case 'student':
          navigate('/dashboard');
          break;
        default:
          navigate('/');
      }

      return { data, error: null };
    } catch (error) {
      console.error('Sign in error:', error);
      return { data: null, error };
    }
  };

  const signUp = async (email, password, role = 'student') => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { role }
        }
      });

      if (error) throw error;

      navigate('/login');
      return { data, error: null };
    } catch (error) {
      console.error('Sign up error:', error);
      return { data: null, error };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      navigate('/');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};