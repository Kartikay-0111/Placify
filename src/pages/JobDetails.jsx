import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import AppNavbar from '@/components/AppNavbar';
import { 
  Building2, 
  MapPin, 
  DollarSign, 
  GraduationCap, 
  Calendar, 
  FileText 
} from 'lucide-react';

export default function JobDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState(null);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const fetchJob = async () => {
      setLoading(true);
      const { data, error } = await supabase.from('jobs').select('*').eq('id', id).single();
      if (!error) setJob(data);
      setLoading(false);
    };
    if (id) fetchJob();
  }, [id]);

  useEffect(() => {
    const fetchApplicationStatus = async () => {
      if (!user || !job) return;
      const { data } = await supabase
        .from('applications')
        .select('status')
        .eq('student_id', user.id)
        .eq('job_id', job.id)
        .single();
      setApplicationStatus(data?.status || null);
    };
    if (user && job) fetchApplicationStatus();
  }, [user, job]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      const { data } = await supabase.from('student_profiles').select('*').eq('user_id', user.id).single();
      setProfile(data || null);
    };
    fetchProfile();
  }, [user]);

  const handleApply = async () => {
    if (!user || !job || !profile?.resume_url) return;
    setApplying(true);
    await supabase.from('applications').insert({
      student_id: user.id,
      job_id: job.id,
      status: 'pending',
      submitted_at: new Date().toISOString(),
    });
    setApplicationStatus('pending');
    setApplying(false);
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen">
      <span className="loading loading-spinner loading-lg"></span>
    </div>
  );

  if (!job) return (
    <div className="hero min-h-screen bg-base-200">
      <div className="hero-content text-center">
        <div className="max-w-md">
          <h1 className="text-2xl font-bold mb-4">Job not found</h1>
          <Link to="/jobs" className="btn btn-primary">
            Go back to Jobs
          </Link>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto">
      <AppNavbar />
      <div className="card shadow-xl w-8/12 mx-auto mt-10">
        <div className="card-body">
          <h2 className="card-title text-2xl font-bold mb-4">
            {job.position} at {job.company_name}
          </h2>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Building2 className="h-6 w-6 text-primary" />
                <p><strong>Company:</strong> {job.company_name}</p>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="h-6 w-6 text-primary" />
                <p><strong>Location:</strong> {job.location}</p>
              </div>
              <div className="flex items-center space-x-3">
                <DollarSign className="h-6 w-6 text-primary" />
                <p><strong>Stipend:</strong> {job.stipend}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <GraduationCap className="h-6 w-6 text-primary" />
                <p><strong>Minimum CGPA:</strong> {job.min_cgpa}</p>
              </div>
              <div className="flex items-center space-x-3">
                <Calendar className="h-6 w-6 text-primary" />
                <p><strong>Deadline:</strong> {new Date(job.application_deadline).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          <div className="divider"></div>

          <div className="space-y-4">
            <h3 className="text-xl font-semibold flex items-center">
              <FileText className="mr-2 h-6 w-6 text-primary" />
              Job Description
            </h3>
            <p className="text-base-content/70">{job.description}</p>

            {job.eligibility_criteria && (
              <>
                <h3 className="text-xl font-semibold mt-4">Eligibility Criteria</h3>
                <p className="text-base-content/70">{job.eligibility_criteria}</p>
              </>
            )}
          </div>

          <div className="divider"></div>

          <div className="flex justify-center">
            {applicationStatus ? (
              <div className={`badge ${
                applicationStatus === 'pending' ? 'badge-secondary' : 
                applicationStatus === 'accepted' ? 'badge-success' : 
                'badge-error'
              } p-4`}>
                Application Status: {applicationStatus}
              </div>
            ) : (
              user ? (
                profile?.resume_url ? (
                  <button 
                    onClick={handleApply} 
                    disabled={applying}
                    className="btn btn-primary w-full max-w-xs"
                  >
                    {applying ? 
                      <span className="loading loading-spinner"></span> : 
                      'Apply Now'
                    }
                  </button>
                ) : (
                  <div className="alert alert-error">
                    <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <span>Please upload your resume in your profile to apply.</span>
                  </div>
                )
              ) : (
                <div className="alert alert-info">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  <span>
                    <Link to="/login" className="text-primary underline">
                      Log in
                    </Link>{' '}
                    to apply for this job.
                  </span>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}