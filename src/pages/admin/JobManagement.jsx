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
    <div className="min-h-screen flex flex-col bg-gray-50">
      <AppNavbar />
      <main className="p-8 max-w-6xl mx-auto">
        <h1 className="text-4xl font-extrabold text-gray-800 mb-6">Manage Jobs</h1>
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <input
            type="text"
            placeholder="Search jobs..."
            className="border border-gray-300 rounded-lg p-3 w-full shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          <select
            className="border border-gray-300 rounded-lg p-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
            <option value="closed">Closed</option>
          </select>
        </div>
        {loading ? (
          <p className="text-gray-500 text-center">Loading jobs...</p>
        ) : filteredJobs.length === 0 ? (
          <p className="text-gray-500 text-center">No jobs found</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredJobs.map(job => (
              <div
                key={job.id}
                className="border border-gray-200 rounded-lg p-6 shadow-sm bg-white hover:shadow-md transition-shadow"
              >
                <h2 className="text-xl font-semibold text-gray-800">{job.title}</h2>
                <p className="text-gray-600">{job.company_name}</p>
                <p className="text-gray-500">{job.location}</p>
                <p
                  className={`inline-block px-3 py-1 mt-2 text-sm font-medium rounded-full ${
                    job.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : job.status === 'draft'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {job.status}
                </p>
                <div className="flex justify-between mt-6">
                  <Link
                    to={`/jobs/${job.id}`}
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    View Details
                  </Link>
                  <button
                    className="text-red-600 hover:text-red-800 font-medium"
                    onClick={() => setJobToDelete(job)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        {jobToDelete && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-8 rounded-lg shadow-lg w-96">
              <p className="text-gray-800 text-lg font-medium">
                Are you sure you want to delete <span className="font-bold">{jobToDelete.title}</span>?
              </p>
              <div className="flex justify-end gap-4 mt-6">
                <button
                  className="border border-gray-300 px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100"
                  onClick={() => setJobToDelete(null)}
                >
                  Cancel
                </button>
                <button
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                  onClick={handleDelete}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}