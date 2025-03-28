import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import JobCard from '@/components/JobCard';
import ApplicationStatus from '@/components/ApplicationStatus';
import AppNavbar from '@/components/AppNavbar';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('jobs');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const { data: profileData } = await supabase
          .from('student_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();
        setProfile(profileData);

        const { data: jobsData } = await supabase
          .from('jobs')
          .select('*')
          .eq('status', 'published')
          .order('created_at', { ascending: false })
          .limit(5);
        setJobs(jobsData || []);

        const { data: applicationsData } = await supabase
          .from('applications')
          .select(`id, status, submitted_at, jobs (id, title, company_name, location, job_type) `)
          .eq('student_id', user.id)
          .order('submitted_at', { ascending: false })
          .limit(5);
        setApplications(applicationsData || []);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchData();
  }, [user]);

  return (
    <div className="min-h-screen flex flex-col">
      <AppNavbar />
      <main className="flex-1 p-4 md:p-8 container mx-auto">
        <h1 className="text-3xl font-bold mb-6">Student Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-4 shadow rounded-lg">
            <h2 className="text-xl font-semibold">Your Profile</h2>
            {loading ? (
              <p>Loading...</p>
            ) : profile ? (
              <div className="mt-2">
                <p><strong>Name:</strong> {profile.full_name || 'Not provided'}</p>
                <p><strong>Roll Number:</strong> {profile.roll_number || 'Not provided'}</p>
                <p><strong>Branch:</strong> {profile.branch || 'Not provided'}</p>
                <p><strong>CGPA:</strong> {profile.cgpa || 'Not provided'}</p>
              </div>
            ) : (
              <p className="text-gray-500">Complete your profile</p>
            )}
            <Link to="/profile" className="block mt-4 bg-blue-500 text-white text-center py-2 rounded-md">
              {profile ? 'Update Profile' : 'Complete Profile'}
            </Link>
          </div>
          <div className="md:col-span-2">
            <div className="flex border-b mb-4">
              <button 
                className={`px-4 py-2 ${tab === 'jobs' ? 'border-b-2 border-blue-500' : ''}`} 
                onClick={() => setTab('jobs')}>
                Recommended Jobs
              </button>
              <button 
                className={`px-4 py-2 ${tab === 'applications' ? 'border-b-2 border-blue-500' : ''}`} 
                onClick={() => setTab('applications')}>
                Recent Applications
              </button>
            </div>
            {tab === 'jobs' && (
              <div className="space-y-4">
                {loading ? (
                  <p>Loading jobs...</p>
                ) : jobs.length > 0 ? (
                  jobs.map(job => <JobCard key={job.id} job={job} isEligible={profile?.cgpa >= job.min_cgpa} />)
                ) : (
                  <p>No recommended jobs available.</p>
                )}
                <Link to="/jobs" className="block text-center mt-4 bg-gray-200 py-2 rounded-md">
                  View All Jobs
                </Link>
              </div>
            )}
            {tab === 'applications' && (
              <div className="space-y-4">
                {loading ? (
                  <p>Loading applications...</p>
                ) : applications.length > 0 ? (
                  applications.map(application => (
                    <div key={application.id} className="p-4 border rounded-md">
                      <h3 className="text-lg font-semibold">{application.jobs?.title}</h3>
                      <p className="text-sm text-gray-500">{application.jobs?.company_name} - {application.jobs?.location}</p>
                      <ApplicationStatus status={application.status} />
                    </div>
                  ))
                ) : (
                  <p>You haven't applied to any jobs yet.</p>
                )}
                <Link to="/applications" className="block text-center mt-4 bg-gray-200 py-2 rounded-md">
                  View All Applications
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
