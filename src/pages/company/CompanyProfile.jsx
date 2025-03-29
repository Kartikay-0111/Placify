import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import AppNavbar from '@/components/AppNavbar';
import Header from '@/components/Header';
import CompanyProfileForm from '@/components/CompanyProfileForm';

export default function CompanyProfile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [isNewProfile, setIsNewProfile] = useState(false);
  // console.log('User:', user);
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
    
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('company_profiles')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching company profile:', error.message);
          alert('Failed to load company profile');
        }

        setProfile(data);
        // console.log('Profile:', data);
        setIsNewProfile(!data);
      } catch (error) {
        console.error('Error in fetchProfile:', error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const handleProfileSuccess = async () => {
    const { data } = await supabase
      .from('company_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    setProfile(data);
    setIsNewProfile(false);

    if (!data?.company_name) return;

    if (isNewProfile) {
      alert('Profile created! Now you can post job opportunities');
      setTimeout(() => navigate('/company/jobs/new'), 1500);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-base-200">
      <AppNavbar />
      <main className="flex-1 p-5 max-w-3xl mx-auto">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-2">
            {isNewProfile ? "Create Company Profile" : "Edit Company Profile"}
          </h2>
          <p className="text-gray-600 mb-4">
            {isNewProfile
              ? "Provide details about your company to attract the right talent"
              : "Update your company information"}
          </p>
          {loading ? (
            <div className="text-center py-5">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="mt-2">Loading profile...</p>
            </div>
          ) : (
            <CompanyProfileForm
              initialData={profile}
              onSuccess={handleProfileSuccess}
            />
          )}
        </div>
      </main>
    </div>
  );
}