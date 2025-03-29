import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import AppNavbar from '@/components/AppNavbar';
import { useNavigate } from 'react-router-dom';
import { Search, Trash2, Edit, Plus, Filter, Calendar, MapPin, Briefcase, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

export default function CompanyJobs() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [jobToDelete, setJobToDelete] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

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
      setLoading(true);
      const { error } = await supabase.from('jobs').delete().eq('id', jobToDelete.id);
      if (error) throw error;
      setJobs(jobs.filter((job) => job.id !== jobToDelete.id));
      setIsDeleteModalOpen(false);
    } catch (error) {
      console.error('Error deleting job:', error);
    } finally {
      setJobToDelete(null);
      setLoading(false);
    }
  };

  const openDeleteModal = (job) => {
    setJobToDelete(job);
    setIsDeleteModalOpen(true);
  };

  const filteredJobs = jobs.filter((job) => {
    const searchMatch =
      job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const statusMatch = statusFilter === 'all' || job.status === statusFilter;
    return searchMatch && statusMatch;
  });

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'active':
        return 'badge-success';
      case 'pending':
        return 'badge-warning';
      case 'closed':
        return 'badge-error';
      case 'draft':
        return 'badge-ghost';
      default:
        return 'badge-secondary';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No deadline';
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch (error) {
      return dateString;
    }
  };

  return (
    <div className="min-h-screen bg-base-100">
      <AppNavbar />
      
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Manage Jobs</h1>
          <p className="text-base-content text-opacity-70">Post and manage job opportunities for students</p>
        </header>

        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          {/* Search Bar */}
          <div className="relative flex-grow max-w-md">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search jobs by title, location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input input-bordered w-full pl-10"
            />
          </div>

          <div className="flex items-center gap-4">
            {/* Filter Dropdown */}
            <div className="form-control">
              <div className="input-group">
                <span className="btn btn-square btn-secondary">
                  <Filter size={18} />
                </span>
                <select 
                  value={statusFilter} 
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="select select-bordered"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="closed">Closed</option>
                  <option value="draft">Draft</option>
                </select>
              </div>
            </div>

            {/* Add New Job Button */}
            <button 
              className="btn btn-primary"
              onClick={() => navigate('/company/jobs/new')}
            >
              <Plus size={18} /> 
              <span className="hidden sm:inline">Add New Job</span>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <span className="loading loading-spinner loading-lg text-primary"></span>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="card bg-base-200 p-12 text-center">
            <div className="card-body">
              <h2 className="card-title justify-center mb-2">No Jobs Found</h2>
              <p className="mb-6">You haven't posted any jobs yet or none match your filters.</p>
              <div className="card-actions justify-center">
                <button 
                  className="btn btn-primary"
                  onClick={() => navigate('/company/jobs/new')}
                >
                  <Plus size={18} /> Post Your First Job
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-6">
            {filteredJobs.map((job) => (
              <div key={job.id} className="card bg-base-200 shadow-lg hover:shadow-xl transition-shadow w-9/12 mx-auto">
                <div className="card-body">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="card-title text-xl">{job.title}</h2>
                      <p className="text-base-content text-opacity-70">{job.company_name}</p>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        className="btn btn-circle btn-ghost btn-sm"
                        onClick={() => navigate(`/company/jobs/edit/${job.id}`)}
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        className="btn btn-circle btn-ghost btn-sm text-error"
                        onClick={() => openDeleteModal(job)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="divider my-2"></div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
                    <div className="flex items-center gap-2">
                      <Briefcase size={16} className="text-primary" />
                      <span>{job.job_type || 'Not specified'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin size={16} className="text-primary" />
                      <span>{job.location || 'Remote'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar size={16} className="text-primary" />
                      <span>Deadline: {formatDate(job.application_deadline)}</span>
                    </div>
                  </div>
                  
                  <div className="mt-2">
                    <span className={`badge ${getStatusBadgeClass(job.status)}`}>
                      {job.status ? job.status.charAt(0).toUpperCase() + job.status.slice(1) : 'Unknown'}
                    </span>
                    {job.min_cgpa && (
                      <span className="badge badge-outline ml-2">Min CGPA: {job.min_cgpa}</span>
                    )}
                    {job.stipend && (
                      <span className="badge badge-outline ml-2">{job.stipend}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <dialog className={`modal ${isDeleteModalOpen ? 'modal-open' : ''}`}>
        <div className="modal-box">
          <div className="flex items-center mb-4">
            <AlertCircle size={24} className="text-error mr-2" />
            <h3 className="font-bold text-lg">Confirm Deletion</h3>
          </div>
          <p>Are you sure you want to delete this job posting?</p>
          <p className="font-semibold my-2">{jobToDelete?.title}</p>
          <p className="text-sm text-base-content text-opacity-70 mb-4">This action cannot be undone.</p>
          <div className="modal-action">
            <button className="btn btn-ghost" onClick={() => setIsDeleteModalOpen(false)}>Cancel</button>
            <button 
              className="btn btn-error" 
              onClick={handleDelete} 
              disabled={loading}
            >
              {loading ? <span className="loading loading-spinner loading-sm"></span> : 'Delete Job'}
            </button>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button onClick={() => setIsDeleteModalOpen(false)}>close</button>
        </form>
      </dialog>
    </div>
  );
}