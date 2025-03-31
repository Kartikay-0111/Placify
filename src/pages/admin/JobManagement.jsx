import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import AppNavbar from '@/components/AppNavbar';
import { CheckCircle, XCircle, Trash2, Search, Filter, Clock, AlertTriangle } from 'lucide-react';

export default function AdminJobManagement() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [approvedJobs, setApprovedJobs] = useState([]);
  const [pendingJobs, setPendingJobs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [jobToDelete, setJobToDelete] = useState(null);
  const [activeTab, setActiveTab] = useState('approved');
  const [collegeInfo, setCollegeInfo] = useState(null);

  useEffect(() => {
    if (!user) return;
    
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // First, get admin's college_id
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('college_id')
          .eq('id', user.id)
          .single();
          
        if (userError) throw userError;
        
        if (!userData.college_id) {
          console.error('Admin is not associated with any college');
          return;
        }
        
        // Get college info
        const { data: collegeData, error: collegeError } = await supabase
          .from('colleges')
          .select('*')
          .eq('id', userData.college_id)
          .single();
          
        if (collegeError) throw collegeError;
        setCollegeInfo(collegeData);
        
        // Get approved jobs
        const { data: approvedJobsData, error: approvedError } = await supabase
          .from('jobs')
          .select(`
            *,
            job_college_targets!inner(approval_status, college_id)
          `)
          .eq('job_college_targets.college_id', userData.college_id)
          .eq('job_college_targets.approval_status', 'approved')
          .order('created_at', { ascending: false });
          
        if (approvedError) throw approvedError;
        setApprovedJobs(approvedJobsData || []);
        
        // Get pending job requests
        const { data: pendingJobsData, error: pendingError } = await supabase
          .from('jobs')
          .select(`
            *,
            job_college_targets!inner(approval_status, college_id)
          `)
          .eq('job_college_targets.college_id', userData.college_id)
          .eq('job_college_targets.approval_status', 'pending')
          .order('created_at', { ascending: false });
          
        if (pendingError) throw pendingError;
        setPendingJobs(pendingJobsData || []);
        
      } catch (error) {
        console.error('Error fetching data:', error.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [user]);

  const handleDeleteJob = async () => {
    if (!jobToDelete) return;
    
    try {
      // We're not actually deleting the job, just removing the college from its targets
      const { error } = await supabase
        .from('job_college_targets')
        .delete()
        .eq('job_id', jobToDelete.id)
        .eq('college_id', collegeInfo.id);
        
      if (error) throw error;
      
      // Update the local state to reflect the change
      setApprovedJobs(approvedJobs.filter(job => job.id !== jobToDelete.id));
      
    } catch (error) {
      console.error('Error removing job:', error);
    } finally {
      setJobToDelete(null);
    }
  };

  const handleJobApproval = async (jobId, status) => {
    try {
      // Update the approval status in the database
      const { error } = await supabase
        .from('job_college_targets')
        .update({ approval_status: status, updated_at: new Date() })
        .eq('job_id', jobId)
        .eq('college_id', collegeInfo.id);
        
      if (error) throw error;
      
      // Update the local state
      if (status === 'approved') {
        // Move from pending to approved
        const jobToMove = pendingJobs.find(job => job.id === jobId);
        if (jobToMove) {
          setPendingJobs(pendingJobs.filter(job => job.id !== jobId));
          setApprovedJobs([jobToMove, ...approvedJobs]);
        }
      } else if (status === 'rejected') {
        // Remove from pending
        setPendingJobs(pendingJobs.filter(job => job.id !== jobId));
      }
      
    } catch (error) {
      console.error(`Error ${status === 'approved' ? 'approving' : 'rejecting'} job:`, error);
    }
  };

  // Filter jobs based on search term and status filter
  const filteredApprovedJobs = approvedJobs.filter(job => {
    return (
      (searchTerm === '' || job.title.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (statusFilter === 'all' || job.status === statusFilter)
    );
  });

  const filteredPendingJobs = pendingJobs.filter(job => {
    return (
      (searchTerm === '' || job.title.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (statusFilter === 'all' || job.status === statusFilter)
    );
  });

  return (
    <div className="min-h-screen bg-base-200">
      <AppNavbar />
      
      <div className="container mx-auto px-4 py-8 w-11/12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-primary">Job Management</h1>
            {collegeInfo && (
              <p className="text-lg text-base-content/70">
                {collegeInfo.name} • {collegeInfo.location}
              </p>
            )}
          </div>
          
          <div className="join mt-4 md:mt-0">
            <button 
              className={`join-item btn ${activeTab === 'approved' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setActiveTab('approved')}
            >
              Approved Jobs
            </button>
            <button 
              className={`join-item btn ${activeTab === 'pending' ? 'btn-primary' : 'btn-ghost'} relative`}
              onClick={() => setActiveTab('pending')}
            >
              Pending Requests
              {pendingJobs.length > 0 && (
                <span className="absolute -top-2 -right-2 badge badge-error badge-sm">{pendingJobs.length}</span>
              )}
            </button>
          </div>
        </div>
        
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="form-control flex-1">
                <div className="input-group">
                  <input
                    type="text"
                    placeholder="Search jobs..."
                    className="input input-bordered w-full"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="form-control sm:w-64">
                <div className="input-group">
                  <select
                    className="select select-bordered w-full"
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value)}
                  >
                    <option value="all">All Status</option>
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
              </div>
            </div>
            
            {loading ? (
              <div className="flex justify-center py-12">
                <span className="loading loading-spinner loading-lg text-primary"></span>
              </div>
            ) : activeTab === 'approved' ? (
              <>
                {filteredApprovedJobs.length === 0 ? (
                  <div className="alert">
                    <AlertTriangle className="h-6 w-6" />
                    <span>No approved jobs found matching your criteria.</span>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="table table-zebra w-full">
                      <thead>
                        <tr>
                          <th>Job Title</th>
                          <th>Company</th>
                          <th>Location</th>
                          <th>Status</th>
                          <th>Deadline</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredApprovedJobs.map(job => (
                          <tr key={job.id}>
                            <td className="font-medium">{job.title}</td>
                            <td>{job.company_name}</td>
                            <td>{job.location}</td>
                            <td>
                              <span className={`badge ${
                                job.status === 'published' ? 'badge-success' :
                                job.status === 'draft' ? 'badge-warning' :
                                'badge-error'
                              }`}>
                                {job.status}
                              </span>
                            </td>
                            <td>
                              {new Date(job.application_deadline).toLocaleDateString()}
                            </td>
                            <td className="flex gap-2">
                              <Link to={`/jobs/${job.id}`} className="btn btn-sm btn-ghost tooltip" data-tip="View Details">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                              </Link>
                              <button 
                                className="btn btn-sm btn-ghost text-error tooltip" 
                                data-tip="Remove Job"
                                onClick={() => setJobToDelete(job)}
                              >
                                <Trash2 size={18} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            ) : (
              <>
                {filteredPendingJobs.length === 0 ? (
                  <div className="alert alert-success">
                    <CheckCircle className="h-6 w-6" />
                    <span>No pending job requests to review.</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredPendingJobs.map(job => (
                      <div key={job.id} className="card bg-base-200 border">
                        <div className="card-body">
                          <div className="flex items-center gap-2 mb-2">
                            <Clock size={16} className="text-warning" />
                            <span className="badge badge-warning">Pending Approval</span>
                          </div>
                          
                          <h2 className="card-title">{job.title}</h2>
                          <p className="text-base-content/70">{job.company_name}</p>
                          
                          <div className="flex flex-col gap-1 my-2">
                            <div className="flex items-center gap-2">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-base-content/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              <span>{job.location}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-base-content/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                              <span>{job.job_type}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-base-content/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <span>{new Date(job.application_deadline).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-base-content/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span>{job.stipend}</span>
                            </div>
                          </div>
                          
                          <div className="divider text-xs text-base-content/50">REQUIREMENTS</div>
                          
                          <div className="mb-2">
                            <div className="flex items-center gap-2">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-base-content/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                              <span>Min CGPA: {job.min_cgpa}</span>
                            </div>
                          </div>
                          
                          <div className="card-actions justify-between mt-4">
                            <Link 
                              to={`/jobs/${job.id}`} 
                              className="btn btn-sm btn-ghost"
                            >
                              View Details
                            </Link>
                            <div className="join">
                              <button 
                                className="join-item btn btn-sm btn-error"
                                onClick={() => handleJobApproval(job.id, 'rejected')}
                              >
                                <XCircle size={16} className="mr-1" />
                                Reject
                              </button>
                              <button 
                                className="join-item btn btn-sm btn-success"
                                onClick={() => handleJobApproval(job.id, 'approved')}
                              >
                                <CheckCircle size={16} className="mr-1" />
                                Approve
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* Delete Confirmation Modal */}
      {jobToDelete && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Confirm Removal</h3>
            <p className="py-4">
              Are you sure you want to remove <span className="font-semibold">{jobToDelete.title}</span> from your college's job listings? Students will no longer be able to view or apply to this job.
            </p>
            <div className="modal-action">
              <button className="btn" onClick={() => setJobToDelete(null)}>Cancel</button>
              <button className="btn btn-error" onClick={handleDeleteJob}>Remove Job</button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => setJobToDelete(null)}></div>
        </div>
      )}
    </div>
  );
}