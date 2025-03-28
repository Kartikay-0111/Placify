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

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('company_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching company profile:', error.message);
          alert('Failed to load company profile');
        }

        setProfile(data || null);
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
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f8f9fa' }}>
      <AppNavbar />
      <main style={{ flex: 1, padding: '20px', maxWidth: '800px', margin: 'auto' }}>
        <Header title="Company Profile" subtitle={isNewProfile ? "Complete your company profile to start posting jobs" : "Manage your company information"} />
        <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h2>{isNewProfile ? "Create Company Profile" : "Edit Company Profile"}</h2>
          <p>{isNewProfile ? "Provide details about your company to attract the right talent" : "Update your company information"}</p>
          {!isNewProfile && (
            <button onClick={() => navigate('/company/jobs/new')} style={{ margin: '10px 0', padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
              Post a Job
            </button>
          )}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <div style={{ width: '40px', height: '40px', border: '4px solid #007bff', borderTop: '4px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
              <p>Loading profile...</p>
            </div>
          ) : (
            <CompanyProfileForm initialData={profile} onSuccess={handleProfileSuccess} />
          )}
        </div>
      </main>
    </div>
  );
}