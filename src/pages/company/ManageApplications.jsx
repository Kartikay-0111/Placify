import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Link } from 'react-router-dom';
import AppNavbar from '../../components/AppNavbar';
import { useAuth } from '../../contexts/AuthContext';

export default function ManageApplications() {
    const [loading, setLoading] = useState(true);
    const [applications, setApplications] = useState([]);
    const [filteredApplications, setFilteredApplications] = useState([]);
    const [selectedStatus, setSelectedStatus] = useState('cell_approved');
    const [error, setError] = useState(null);
    const [companyNotes, setCompanyNotes] = useState('');
    const [processingId, setProcessingId] = useState(null);

    const { user } = useAuth();
    // console.log(user);
    const companyId = user?.id;

    useEffect(() => {
        if (companyId) {
            fetchApplications();
        }
    }, [companyId, selectedStatus]);

    const fetchApplications = async () => {
        try {
            setLoading(true);

            // Fetch job IDs posted by the company
            const { data: jobIds, error: jobError } = await supabase
                .from('jobs')
                .select('id')
                .eq('company_id', companyId);

            if (jobError) throw jobError;

            if (!jobIds || jobIds.length === 0) {
                setApplications([]);
                setFilteredApplications([]);
                return;
            }

            // Fetch applications for each job ID and merge results
            let applicationsData = [];
            for (const job of jobIds) {
                const { data, error } = await supabase.rpc('get_approved_applications', { job_id: job.id, app_status: selectedStatus });
                if (error) throw error;
                if (data) applicationsData = [...applicationsData, ...data];
            }

            setApplications(applicationsData || []);
            // console.log(applicationsData);
            setFilteredApplications(
                applicationsData?.filter(app => app.status === selectedStatus) || []
            );
        } catch (err) {
            setError('Failed to fetch applications');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };


    const updateApplicationStatus = async (applicationId, newStatus) => {
        if (!applicationId) {
            console.error("Invalid applicationId: ", applicationId);
            setError("Invalid application ID.");
            return;
        }
        // console.log("Updating application status for ID: ", applicationId, " to ", newStatus);
        try {
            setProcessingId(applicationId);
    
            const { error } = await supabase
                .from('applications')
                .update({
                    status: newStatus,
                    company_notes: companyNotes || null, // Prevent empty string issues
                    updated_at: new Date().toISOString()
                })
                .eq('id', applicationId)
                .select();
    
            if (error) throw error;
    
            setApplications(prev =>
                prev.map(app =>
                    app.id === applicationId
                        ? { ...app, status: newStatus, company_notes: companyNotes }
                        : app
                )
            );
    
            setFilteredApplications(prev =>
                prev.map(app =>
                    app.id === applicationId
                        ? { ...app, status: newStatus, company_notes: companyNotes }
                        : app
                )
            );
    
            setCompanyNotes('');
    
        } catch (err) {
            setError('Failed to update application status');
            console.error(err);
        } finally {
            setProcessingId(null);
            setSelectedStatus(newStatus);
        }
    };
    
    
    const formatDate = (dateString) => {
        const options = {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    return (
        <div className="min-h-screen flex flex-col">
            <AppNavbar />
            <div className='pt-4 w-10/12 mx-auto'>
                <div className="flex justify-between items-center mb-6 ">
                    <h2 className="text-2xl font-bold">Manage Applications</h2>
                    <div className="flex items-center space-x-2">
                        <span className="font-medium">Filter:</span>
                        <select
                            className="select select-bordered w-full max-w-xs"
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                        >
                            <option value="cell_approved">Awaiting Review</option>
                            <option value="company_approved">Approved</option>
                            <option value="company_rejected">Rejected</option>
                        </select>
                    </div>
                </div>

                {error && (
                    <div className="alert alert-error mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{error}</span>
                        <button className="btn btn-sm" onClick={() => setError(null)}>Dismiss</button>
                    </div>
                )}

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <span className="loading loading-spinner loading-lg"></span>
                    </div>
                ) : filteredApplications.length === 0 ? (
                    <div className="alert">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-info shrink-0 w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        <span>No applications found with status: {selectedStatus.replace('_', ' ')}</span>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="table w-full">
                            <thead>
                                <tr>
                                    <th>Student</th>
                                    <th>Job Position</th>
                                    <th>Applied On</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredApplications.map((application) => (
                                    <tr key={application.id} className="hover">
                                        <td>
                                            <div>
                                                <div className="font-bold">{application.full_name}</div>
                                                {/* <div className="text-sm opacity-70">{application.auth?.email}</div> */}
                                                <div className="text-xs">
                                                    {application.branch} ({application.year_of_graduation})
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="font-medium">{application.job_title}</div>
                                            <div className="text-sm opacity-70">{application.jobs?.location}</div>
                                        </td>
                                        <td>{formatDate(application.submitted_at)}</td>
                                        <td>
                                            <div className={`badge ${application.status === 'cell_approved' ? 'badge-warning' :
                                                application.status === 'company_approved' ? 'badge-success' :
                                                    'badge-error'
                                                }`}>
                                                {application.status.replace('_', ' ')}
                                            </div>
                                        </td>
                                        <td>
                                            {application.status === 'cell_approved' ? (
                                                <div className="flex flex-col gap-2">
                                                    <textarea
                                                        className="textarea textarea-bordered w-full"
                                                        placeholder="Add notes (optional)"
                                                        value={companyNotes}
                                                        onChange={(e) => setCompanyNotes(e.target.value)}
                                                    />
                                                    <div className="flex gap-2">
                                                        <button
                                                            className="btn btn-success btn-sm"
                                                            disabled={processingId === application.application_id}
                                                            onClick={() => updateApplicationStatus(application.application_id, 'company_approved')}
                                                        >
                                                            {processingId === application.id ?
                                                                <span className="loading loading-spinner loading-xs"></span> :
                                                                'Approve'
                                                            }
                                                        </button>
                                                        <button
                                                            className="btn btn-error btn-sm"
                                                            disabled={processingId === application.application_id}
                                                            onClick={() => updateApplicationStatus(application.application_id, 'company_rejected')}
                                                        >
                                                            {processingId === application.id ?
                                                                <span className="loading loading-spinner loading-xs"></span> :
                                                                'Reject'
                                                            }
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="collapse bg-base-200">
                                                    <Link to='/company/interview' className="collapse-title text-sm font-medium px-2 py-1 min-h-0">
                                                        Schedule Interview
                                                    </Link>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};
