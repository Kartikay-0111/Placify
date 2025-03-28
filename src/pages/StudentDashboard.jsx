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
  function calculateProfileCompleteness(profile) {
    const requiredFields = [
      'full_name', 'roll_number', 'branch',
      'cgpa', 'year_of_graduation', 'skills',
      'resume_url', 'avatar_url', 'about'
    ];

    const completedFields = requiredFields.filter(field =>
      profile[field] &&
      (typeof profile[field] !== 'string' || profile[field].trim() !== '')
    );

    return Math.round((completedFields.length / requiredFields.length) * 100);
  }

  return (
    <div className="min-h-screen flex flex-col">
      <AppNavbar />
      <main className="flex-1 p-4 md:p-8 container mx-auto">
        <h1 className="text-3xl font-bold mb-6">Student Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <div className="flex flex-col space-x-6 items-center">
                {/* Profile Picture */}
                <div className='flex flex-row gap-4'>
                  <div className="avatar">
                    <div className="w-24 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                      <img
                        src={profile?.avatar_url || '/default-avatar.png'}
                        alt="Profile"
                        className="object-cover"
                      />
                    </div>
                  </div>

                  {/* Profile Details */}
                  <div className="flex-1">
                    <h2 className="card-title text-xl font-bold">
                      {profile?.full_name || 'Complete Your Profile'}
                    </h2>
                    <div className="text-sm text-base-content/70 space-y-1">
                      {profile?.roll_number && (
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">Roll Number:</span>
                          <span>{profile.roll_number}</span>
                        </div>
                      )}
                      {profile?.branch && (
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">Branch:</span>
                          <span>{profile.branch}</span>
                        </div>
                      )}
                      {profile?.cgpa && (
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">CGPA:</span>
                          <span className="badge badge-primary badge-sm">{profile.cgpa.toFixed(2)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Profile Action */}
                <div className="card-actions mt-8">
                  <Link to="/profile" className="btn btn-primary btn-outline">
                    {profile ? 'Update Profile' : 'Complete Profile'}
                  </Link>
                </div>
              </div>

              {/* Profile Completeness */}
              {profile && (
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Profile Completeness</span>
                    <span className="text-sm font-medium">
                      {calculateProfileCompleteness(profile)}%
                    </span>
                  </div>
                  <progress
                    className="progress progress-primary w-full"
                    value={calculateProfileCompleteness(profile)}
                    max="100"
                  ></progress>
                </div>
              )}
            </div>
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
