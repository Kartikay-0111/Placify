import { useState, useEffect } from 'react';
import { getTable } from '@/lib/supabase-helpers';
import { useAuth } from '@/contexts/AuthContext';
import AppNavbar from '@/components/AppNavbar';
import { format } from 'date-fns';
import { Search, Filter, User, Briefcase, Check, X, RefreshCw, Download } from 'lucide-react';

export default function ApplicationsManagement() {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState(null);
  const [status, setStatus] = useState('');
  const [notes, setNotes] = useState('');
  const [viewMode, setViewMode] = useState(null); // 'student' or 'job'
  const [viewData, setViewData] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Filter options
  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'pending', label: 'Pending' },
    { value: 'cell_approved', label: 'Approved' },
    { value: 'cell_rejected', label: 'Rejected' },
    { value: 'company_approved', label: 'Company Approved' },
    { value: 'company_rejected', label: 'Company Rejected' },
  ];

  useEffect(() => {
    fetchApplications();
  }, [user]);

  useEffect(() => {
    // Apply filters whenever applications, searchTerm, or statusFilter changes
    applyFilters();
  }, [applications, searchTerm, statusFilter]);

  const fetchApplications = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await getTable('applications')
        .select(`*, job:jobs(*), student:student_profiles(*)`)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setApplications(data || []);
      console.log('Applications fetched successfully:', data);
    } catch (error) {
      console.error('Error fetching applications:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...applications];
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(app => app.status === statusFilter);
    }
    
    // Apply search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(app => 
        app.student?.full_name?.toLowerCase().includes(term) ||
        app.job?.title?.toLowerCase().includes(term) ||
        app.job?.company_name?.toLowerCase().includes(term)
      );
    }
    
    setFilteredApplications(filtered);
  };

  const handleStatusChange = async () => {
    if (!selectedApp || !status) return;
    try {
      await getTable('applications').update({
        status,
        placement_cell_notes: notes,
        updated_at: new Date().toISOString(),
      }).eq('id', selectedApp.id);
      await fetchApplications();
      setSelectedApp(null);
      setStatus('');
      setNotes('');
    } catch (error) {
      console.error('Error updating application status:', error.message);
    }
  };

  const viewStudentProfile = (student) => {
    setViewMode('student');
    setViewData(student);
  };

  const viewJobDetails = (job) => {
    setViewMode('job');
    setViewData(job);
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending':
        return 'badge badge-warning';
      case 'cell_approved':
        return 'badge badge-success';
      case 'cell_rejected':
        return 'badge badge-error';
      case 'company_approved':
        return 'badge badge-success badge-outline';
      case 'company_rejected':
        return 'badge badge-error badge-outline';
      default:
        return 'badge';
    }
  };

  const getReadableStatus = (status) => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'cell_approved':
        return 'Approved';
      case 'cell_rejected':
        return 'Rejected';
      case 'company_approved':
        return 'Company Approved';
      case 'company_rejected':
        return 'Company Rejected';
      default:
        return status;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-base-100">
      <AppNavbar />
      <main className="flex-1 pt-10 pb-12 px-4 md:px-8 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <h1 className="text-3xl font-bold">Applications Management</h1>
            <button 
              onClick={fetchApplications} 
              className="btn btn-primary mt-2 md:mt-0 flex items-center gap-2"
            >
              <RefreshCw size={18} />
              Refresh
            </button>
          </div>

          {/* Filters and Search */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="form-control flex-1">
              <div className="input-group">
                <input 
                  type="text" 
                  placeholder="Search by student or job..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input input-bordered w-full" 
                />
              </div>
            </div>
            
            <div className="flex-none w-full md:w-64">
              <div className="input-group">
                <select 
                  className="select select-bordered flex-1 w-full"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  {statusOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Applications Table */}
          {loading ? (
            <div className="flex justify-center my-12">
              <span className="loading loading-spinner loading-lg"></span>
            </div>
          ) : filteredApplications.length === 0 ? (
            <div className="card bg-base-200 p-8 text-center">
              <h3 className="text-xl font-semibold">No Applications Found</h3>
              <p className="mt-2">Try adjusting your filters or search terms</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table table-zebra w-full">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Position</th>
                    <th>Company</th>
                    <th>Applied On</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredApplications.map(app => (
                    <tr key={app.id} className="hover">
                      <td 
                        className="cursor-pointer text-primary font-medium"
                        onClick={() => viewStudentProfile(app.student)}
                      >
                        {app.student?.full_name}
                      </td>
                      <td 
                        className="cursor-pointer hover:text-primary"
                        onClick={() => viewJobDetails(app.job)}
                      >
                        {app.job?.title}
                      </td>
                      <td>{app.job?.company_name}</td>
                      <td>{format(new Date(app.submitted_at), 'PPP')}</td>
                      <td>
                        <span className={getStatusBadgeClass(app.status)}>
                          {getReadableStatus(app.status)}
                        </span>
                      </td>
                      <td>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => {
                              setSelectedApp(app);
                              setStatus(app.status);
                              setNotes(app.placement_cell_notes || '');
                            }} 
                            className="btn btn-sm btn-primary"
                          >
                            Review
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Review Application Modal */}
          {selectedApp && (
            <div className="modal modal-open">
              <div className="modal-box max-w-md">
                <h3 className="font-bold text-lg mb-1">Review Application</h3>
                <p className="text-sm text-base-content/70 mb-4">
                  Update status and provide notes
                </p>
                <div className="divider mt-0"></div>
                
                <div className="mb-4">
                  <div className="font-semibold">{selectedApp.student?.full_name}</div>
                  <div className="text-sm text-base-content/70">
                    {selectedApp.job?.title} at {selectedApp.job?.company_name}
                  </div>
                </div>
                
                <div className="form-control mb-4">
                  <label className="label">
                    <span className="label-text">Status</span>
                  </label>
                  <select 
                    value={status} 
                    onChange={e => setStatus(e.target.value)} 
                    className="select select-bordered w-full"
                  >
                    <option value="pending">Pending</option>
                    <option value="cell_approved">Approved</option>
                    <option value="cell_rejected">Rejected</option>
                  </select>
                </div>
                
                <div className="form-control mb-4">
                  <label className="label">
                    <span className="label-text">Placement Cell Notes</span>
                  </label>
                  <textarea 
                    value={notes} 
                    onChange={e => setNotes(e.target.value)} 
                    className="textarea textarea-bordered h-24"
                    placeholder="Add notes about this application..."
                  ></textarea>
                </div>
                
                <div className="modal-action">
                  <button 
                    onClick={() => setSelectedApp(null)} 
                    className="btn btn-ghost"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleStatusChange} 
                    className="btn btn-primary"
                  >
                    Update
                  </button>
                </div>
              </div>
              <div className="modal-backdrop" onClick={() => setSelectedApp(null)}></div>
            </div>
          )}

          {/* Student Profile Modal */}
          {viewMode === 'student' && viewData && (
            <div className="modal modal-open">
              <div className="modal-box max-w-2xl">
                <h3 className="font-bold text-lg mb-1">Student Profile</h3>
                <div className="divider mt-0"></div>
                
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-none">
                    {viewData.avatar_url ? (
                      <img 
                        src={viewData.avatar_url} 
                        alt={viewData.full_name} 
                        className="w-32 h-32 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center">
                        <User size={48} className="text-primary" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-base-content/70">Full Name</div>
                      <div className="font-medium">{viewData.full_name}</div>
                    </div>
                    
                    <div>
                      <div className="text-sm text-base-content/70">Roll Number</div>
                      <div className="font-medium">{viewData.roll_number}</div>
                    </div>
                    
                    <div>
                      <div className="text-sm text-base-content/70">Branch</div>
                      <div className="font-medium">{viewData.branch || 'Not specified'}</div>
                    </div>
                    
                    <div>
                      <div className="text-sm text-base-content/70">CGPA</div>
                      <div className="font-medium">{viewData.cgpa || 'Not specified'}</div>
                    </div>
                    
                    <div>
                      <div className="text-sm text-base-content/70">Year of Graduation</div>
                      <div className="font-medium">{viewData.year_of_graduation || 'Not specified'}</div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <div className="text-sm text-base-content/70 mb-2">Skills</div>
                  <div className="flex flex-wrap gap-2">
                    {viewData.skills && viewData.skills.length > 0 ? (
                      viewData.skills.map((skill, index) => (
                        <span key={index} className="badge badge-primary badge-outline">
                          {skill}
                        </span>
                      ))
                    ) : (
                      <span className="text-base-content/50">No skills listed</span>
                    )}
                  </div>
                </div>
                
                <div className="mt-6">
                  <div className="text-sm text-base-content/70 mb-2">About</div>
                  <div className="bg-base-200 p-4 rounded-lg">
                    {viewData.about || 'No information provided.'}
                  </div>
                </div>
                
                {viewData.resume_url && (
                  <div className="mt-6">
                    <a 
                      href={viewData.resume_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="btn btn-outline btn-primary flex items-center gap-2"
                    >
                      <Download size={18} />
                      Download Resume
                    </a>
                  </div>
                )}
                
                <div className="modal-action">
                  <button onClick={() => setViewMode(null)} className="btn">Close</button>
                </div>
              </div>
              <div className="modal-backdrop" onClick={() => setViewMode(null)}></div>
            </div>
          )}

          {/* Job Details Modal */}
          {viewMode === 'job' && viewData && (
            <div className="modal modal-open">
              <div className="modal-box max-w-2xl">
                <h3 className="font-bold text-lg mb-1">Job Details</h3>
                <div className="divider mt-0"></div>
                
                <div className="mb-6">
                  <h4 className="text-xl font-bold">{viewData.title}</h4>
                  <div className="text-base-content/70">{viewData.company_name} • {viewData.location}</div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="card bg-base-200 p-4">
                    <div className="text-sm text-base-content/70">Job Type</div>
                    <div className="font-medium">{viewData.job_type}</div>
                  </div>
                  <div className="card bg-base-200 p-4">
                    <div className="text-sm text-base-content/70">Stipend</div>
                    <div className="font-medium">{viewData.stipend}</div>
                  </div>
                  <div className="card bg-base-200 p-4">
                    <div className="text-sm text-base-content/70">Min. CGPA</div>
                    <div className="font-medium">{viewData.min_cgpa}</div>
                  </div>
                </div>
                
                <div className="mb-6">
                  <div className="text-sm text-base-content/70 mb-2">Job Description</div>
                  <div className="bg-base-200 p-4 rounded-lg whitespace-pre-line">
                    {viewData.description}
                  </div>
                </div>
                
                <div className="mb-6">
                  <div className="text-sm text-base-content/70 mb-2">Requirements</div>
                  {viewData.requirements && viewData.requirements.length > 0 ? (
                    <ul className="list-disc pl-5 space-y-1">
                      {viewData.requirements.map((req, index) => (
                        <li key={index}>{req}</li>
                      ))}
                    </ul>
                  ) : (
                    <div className="bg-base-200 p-4 rounded-lg">
                      No specific requirements listed.
                    </div>
                  )}
                </div>
                
                {viewData.eligibility_criteria && (
                  <div className="mb-6">
                    <div className="text-sm text-base-content/70 mb-2">Eligibility Criteria</div>
                    <div className="bg-base-200 p-4 rounded-lg whitespace-pre-line">
                      {viewData.eligibility_criteria}
                    </div>
                  </div>
                )}
                
                <div className="mb-4">
                  <div className="text-sm text-base-content/70">Application Deadline</div>
                  <div className="font-medium">
                    {format(new Date(viewData.application_deadline), 'PPP')}
                  </div>
                </div>
                
                <div className="modal-action">
                  <button onClick={() => setViewMode(null)} className="btn">Close</button>
                </div>
              </div>
              <div className="modal-backdrop" onClick={() => setViewMode(null)}></div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}