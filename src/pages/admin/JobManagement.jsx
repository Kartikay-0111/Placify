import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import AppNavbar from '@/components/AppNavbar';

export default function JobManagement() {
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
        const { data, error } = await supabase.from('jobs').select('*').order('created_at', { ascending: false });
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
      setJobs(jobs.filter(job => job.id !== jobToDelete.id));
    } catch (error) {
      console.error('Error deleting job:', error);
    } finally {
      setJobToDelete(null);
    }
  };

  const filteredJobs = jobs.filter(job => {
    return (
      (searchTerm === '' || job.title.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (statusFilter === 'all' || job.status === statusFilter)
    );
  });

  return (
    <div className="min-h-screen flex flex-col">
      <AppNavbar />
      <main className="p-8 max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">Manage Jobs</h1>
        <div className="flex gap-4 mb-6">
          <input type="text" placeholder="Search jobs..." className="border p-2 w-full" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          <select className="border p-2" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
            <option value="closed">Closed</option>
          </select>
        </div>
        {loading ? (
          <p>Loading jobs...</p>
        ) : filteredJobs.length === 0 ? (
          <p>No jobs found</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredJobs.map(job => (
              <div key={job.id} className="border p-4 rounded">
                <h2 className="text-xl font-semibold">{job.title}</h2>
                <p>{job.company_name}</p>
                <p>{job.location}</p>
                <p>{job.status}</p>
                <div className="flex justify-between mt-4">
                  <Link to={`/jobs/${job.id}`} className="text-blue-500">View Details</Link>
                  <button className="text-red-500" onClick={() => setJobToDelete(job)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
        {jobToDelete && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded shadow-md">
              <p>Are you sure you want to delete {jobToDelete.title}?</p>
              <div className="flex justify-end gap-4 mt-4">
                <button className="border px-4 py-2" onClick={() => setJobToDelete(null)}>Cancel</button>
                <button className="bg-red-500 text-white px-4 py-2" onClick={handleDelete}>Delete</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}