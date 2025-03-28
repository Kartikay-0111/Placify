import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import AppNavbar from '@/components/AppNavbar';
import Header from '@/components/Header';

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

  if (loading) return <p>Loading...</p>;
  if (!job) return <p>Job not found. <Link to="/jobs">Go back</Link></p>;

  return (
    <div>
      <AppNavbar />
      <Header title={job.title} subtitle={`${job.position} at ${job.company_name}`} />
      <div>
        <p><strong>Company:</strong> {job.company_name}</p>
        <p><strong>Location:</strong> {job.location}</p>
        <p><strong>Stipend:</strong> {job.stipend}</p>
        <p><strong>Minimum CGPA:</strong> {job.min_cgpa}</p>
        <p><strong>Deadline:</strong> {new Date(job.application_deadline).toLocaleDateString()}</p>
        <p><strong>Description:</strong> {job.description}</p>
        {job.eligibility_criteria && <p><strong>Eligibility:</strong> {job.eligibility_criteria}</p>}
        {applicationStatus ? (
          <p>Status: {applicationStatus}</p>
        ) : (
          user ? (
            <button onClick={handleApply} disabled={applying}>Apply Now</button>
          ) : (
            <p><Link to="/login">Log in</Link> to apply.</p>
          )
        )}
      </div>
    </div>
  );
}
