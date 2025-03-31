import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import AppNavbar from '@/components/AppNavbar';

export default function Applications() {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    async function fetchApplications() {
      try {
        const { data, error } = await supabase
          .from('applications')
          .select(`
            *,
            jobs!inner(
              *
            )
          `)
          .eq('student_id', user.id)
          .order('submitted_at', { ascending: false });

        if (error) throw error;
        setApplications(data || []);
        console.log('Fetched applications:', data);
      } catch (error) {
        console.error('Error fetching applications:', error.message);
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      fetchApplications();
    }
  }, [user]);

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending':
        return 'badge badge-warning';
      case 'cell_approved':
        return 'badge badge-info';
      case 'cell_rejected':
        return 'badge badge-error';
      case 'company_approved':
        return 'badge badge-success';
      case 'company_rejected':
        return 'badge badge-error';
      case 'published':
        return 'badge badge-primary';
      default:
        return 'badge badge-ghost';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDeadline = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const daysLeft = Math.ceil((date - now) / (1000 * 60 * 60 * 24));

    return {
      formatted: formatDate(dateString),
      daysLeft: daysLeft,
      isPast: daysLeft < 0
    };
  };

  const getStatusDisplayName = (status) => {
    return status
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const handleViewDetails = (application) => {
    setSelectedApplication(application);
    setIsModalOpen(true);
  };

  const filteredApplications = applications.filter(app => {
    if (statusFilter === 'all') return true;
    return app.status === statusFilter;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-base-200">
        <AppNavbar />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200">
      <AppNavbar />

      <main className="container mx-auto py-6 px-4 sm:px-6 lg:px-8 lg:w-10/12 ">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-base-content">My Applications</h1>
            <p className="text-base-content/70">Track the status of your job applications</p>
          </div>

          <div className="mt-4 md:mt-0">
            <select
              className="select select-bordered w-full max-w-xs"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Applications</option>
              <option value="pending">Pending</option>
              <option value="cell_approved">Placement Cell Approved</option>
              <option value="cell_rejected">Placement Cell Rejected</option>
              <option value="company_approved">Company Approved</option>
              <option value="company_rejected">Company Rejected</option>
              <option value="published">Published</option>
            </select>
          </div>
        </div>

        {filteredApplications.length === 0 ? (
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body items-center text-center">
              <h2 className="card-title">No Applications Found</h2>
              {statusFilter === 'all' ? (
                <p className="text-base-content/70">You haven't applied to any jobs yet.</p>
              ) : (
                <p className="text-base-content/70">No applications with status "{getStatusDisplayName(statusFilter)}".</p>
              )}
              <div className="card-actions mt-4">
                <button className="btn btn-primary" onClick={() => setStatusFilter('all')}>
                  View All Applications
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {filteredApplications.map((application) => {
              const deadline = formatDeadline(application.jobs.application_deadline);

              return (
                <div key={application.id} className="card bg-base-100 shadow-xl">
                  <div className="card-body p-6">
                    <div className="flex flex-col lg:flex-row justify-between">
                      <div>
                        <h2 className="card-title text-lg font-bold">
                          {application.title || application.jobs.title}
                          <span className={getStatusBadgeClass(application.status)}>
                            {getStatusDisplayName(application.status)}
                          </span>
                        </h2>
                        <p className="text-base-content/70">
                          {application.company_name || application.jobs.company_name} • {application.location || application.jobs.location} • {application.job_type || application.jobs.job_type}
                        </p>
                      </div>
                      <div className="mt-4 lg:mt-0 flex flex-col items-start lg:items-end">
                        <p className="text-sm">
                          <span className="font-medium">Applied on:</span> {formatDate(application.submitted_at)}
                        </p>
                        <p className="text-sm">
                          <span className="font-medium">Last updated:</span> {formatDate(application.updated_at)}
                        </p>
                        {deadline && (
                          <p className={`text-sm mt-1 ${deadline.isPast ? 'text-error' : deadline.daysLeft < 3 ? 'text-warning' : ''}`}>
                            <span className="font-medium">Deadline:</span> {deadline.formatted}
                            {!deadline.isPast && (
                              <span className="ml-1">({deadline.daysLeft} days left)</span>
                            )}
                            {deadline.isPast && (
                              <span className="ml-1">(Expired)</span>
                            )}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="divider"></div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <h3 className="font-semibold mb-1">Position</h3>
                        <p className="text-base-content/80">{application.position || application.jobs.position || 'Not specified'}</p>
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">Stipend</h3>
                        <p className="text-base-content/80">{application.stipend || application.jobs.stipend || 'Not specified'}</p>
                      </div>
                      <div className="card-actions justify-end">
                        <button
                          className="btn btn-primary"
                          onClick={() => handleViewDetails(application)}
                        >
                          View Details
                        </button>
                      </div>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Application Details Modal */}
      {selectedApplication && (
        <div className={`modal ${isModalOpen ? 'modal-open' : ''}`}>
          <div className="modal-box max-w-3xl">
            <h3 className="font-bold text-lg">
              {selectedApplication.title || selectedApplication.jobs.title}
              <span className={`ml-2 ${getStatusBadgeClass(selectedApplication.status)}`}>
                {getStatusDisplayName(selectedApplication.status)}
              </span>
            </h3>

            <div className="mt-4">
              <div className="stats stats-vertical lg:stats-horizontal shadow w-full">
                <div className="stat">
                  <div className="stat-title">Company</div>
                  <div className="stat-value text-lg">{selectedApplication.company_name || selectedApplication.jobs.company_name}</div>
                </div>
                <div className="stat">
                  <div className="stat-title">Location</div>
                  <div className="stat-value text-lg">{selectedApplication.location || selectedApplication.jobs.location}</div>
                </div>
                <div className="stat">
                  <div className="stat-title">Job Type</div>
                  <div className="stat-value text-lg">{selectedApplication.job_type || selectedApplication.jobs.job_type}</div>
                </div>
              </div>
            </div>

            <div className="divider"></div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <h4 className="font-semibold">Applied On</h4>
                <p>{formatDate(selectedApplication.submitted_at)}</p>
              </div>
              <div>
                <h4 className="font-semibold">Last Updated</h4>
                <p>{formatDate(selectedApplication.updated_at)}</p>
              </div>
              <div>
                <h4 className="font-semibold">Position</h4>
                <p>{selectedApplication.position || selectedApplication.jobs.position || 'Not specified'}</p>
              </div>
              <div>
                <h4 className="font-semibold">Stipend</h4>
                <p>{selectedApplication.stipend || selectedApplication.jobs.stipend || 'Not specified'}</p>
              </div>
              <div>
                <h4 className="font-semibold">Minimum CGPA</h4>
                <p>{selectedApplication.min_cgpa || selectedApplication.jobs.min_cgpa || 'Not specified'}</p>
              </div>
              <div>
                <h4 className="font-semibold">Application Deadline</h4>
                <p>{formatDate(selectedApplication.application_deadline)}</p>
              </div>
            </div>

            <div className="mb-4">
              <h4 className="font-semibold mb-2">Job Description</h4>
              <p className="text-base-content/80 whitespace-pre-line">{selectedApplication.description || selectedApplication.jobs.description || 'No description provided.'}</p>
            </div>

            <div className="mb-4">
              <h4 className="font-semibold mb-2">Requirements</h4>
              {selectedApplication.requirements || selectedApplication.jobs.requirements ? (
                <ul className="list-disc pl-5">
                  {(selectedApplication.requirements || selectedApplication.jobs.requirements).map((req, index) => (
                    <li key={index}>{req}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-base-content/80">No specific requirements listed.</p>
              )}
            </div>

            <div className="mb-4">
              <h4 className="font-semibold mb-2">Eligibility Criteria</h4>
              <p className="text-base-content/80">{selectedApplication.eligibility_criteria || selectedApplication.jobs.eligibility_criteria || 'No specific eligibility criteria specified.'}</p>
            </div>

            {(selectedApplication.status === 'cell_approved' || selectedApplication.status === 'cell_rejected') && (
              <div className="mb-4">
                <h4 className="font-semibold mb-2">Placement Cell Notes</h4>
                <div className="bg-base-200 p-3 rounded-lg">
                  <p className="text-base-content/80">{selectedApplication.placement_cell_notes || 'No notes provided.'}</p>
                </div>
              </div>
            )}

            {(selectedApplication.status === 'company_approved' || selectedApplication.status === 'company_rejected') && (
              <div className="mb-4">
                <h4 className="font-semibold mb-2">Company Notes</h4>
                <div className="bg-base-200 p-3 rounded-lg">
                  <p className="text-base-content/80">{selectedApplication.company_notes || 'No notes provided.'}</p>
                </div>
              </div>
            )}

            <div className="modal-action">
              <button className="btn" onClick={() => setIsModalOpen(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}