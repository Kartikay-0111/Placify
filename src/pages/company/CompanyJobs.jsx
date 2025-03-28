import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import AppNavbar from '@/components/AppNavbar';
import Header from '@/components/Header';
import { useNavigate } from 'react-router-dom';

export default function CompanyJobs() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [jobToDelete, setJobToDelete] = useState(null);

  useEffect(() => {
    if (!user) return;

    const fetchJobs = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('jobs')
          .select('*')
          .eq('company_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setJobs(data || []);
      } catch (error) {
        console.error('Error fetching jobs:', error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [user]);

  const handleDelete = async () => {
    if (!jobToDelete) return;

    try {
      const { error } = await supabase.from('jobs').delete().eq('id', jobToDelete.id);
      if (error) throw error;
      setJobs(jobs.filter((job) => job.id !== jobToDelete.id));
    } catch (error) {
      console.error('Error deleting job:', error);
    } finally {
      setJobToDelete(null);
    }
  };

  const filteredJobs = jobs.filter((job) => {
    const searchMatch =
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.location.toLowerCase().includes(searchTerm.toLowerCase());
    const statusMatch = statusFilter === 'all' || job.status === statusFilter;
    return searchMatch && statusMatch;
  });

  return (
    <div>
      <AppNavbar />
      <Header title="Manage Jobs" subtitle="Post and manage job opportunities for students" />

      <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
        <input
          type="text"
          placeholder="Search jobs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
        />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="closed">Closed</option>
          <option value="draft">Draft</option>
        </select>

        {loading ? (
          <p>Loading jobs...</p>
        ) : filteredJobs.length === 0 ? (
          <p>No jobs found.</p>
        ) : (
          <ul>
            {filteredJobs.map((job) => (
              <li key={job.id} style={{ border: '1px solid #ddd', padding: '10px', margin: '10px 0' }}>
                <h3>{job.title}</h3>
                <p>Location: {job.location}</p>
                <p>Status: {job.status}</p>
                <button onClick={() => navigate(`/company/jobs/edit/${job.id}`)}>Edit</button>
                <button onClick={() => setJobToDelete(job)}>Delete</button>
              </li>
            ))}
          </ul>
        )}

        {jobToDelete && (
          <div style={{ background: '#f8d7da', padding: '10px', marginTop: '20px' }}>
            <p>Are you sure you want to delete "{jobToDelete.title}"?</p>
            <button onClick={handleDelete}>Confirm Delete</button>
            <button onClick={() => setJobToDelete(null)}>Cancel</button>
          </div>
        )}
      </div>
    </div>
  );
}
