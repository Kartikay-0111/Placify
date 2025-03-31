import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import AppNavbar from '../../components/AppNavbar';
import { Info, MapPin, Video, FileText } from 'lucide-react';
const InterviewSchedule = () => {
const [loading, setLoading] = useState(true);
const [interviews, setInterviews] = useState([]);
const [pendingApplications, setPendingApplications] = useState([]);
const [stats, setStats] = useState({
    totalApproved: 0,
    totalInterviews: 0,
    totalSelected: 0,
    totalRejected: 0
});
const [error, setError] = useState(null);
const [success, setSuccess] = useState(null);
const [processingId, setProcessingId] = useState(null);
const companyId = useAuth().user?.id;

// Form state
const [formData, setFormData] = useState({
    application_id: '',
    interview_date: '',
    interview_time: '',
    interview_type: 'technical',
    location: '',
    meeting_link: '',
    notes: ''
});

useEffect(() => {
    if (companyId) fetchData();
}, [companyId]);

const fetchData = async () => {
    try {
        setLoading(true);
        setError(null);

        // Ensure companyId is available
        if (!companyId) {
            setLoading(false);
            return;
        }

        // Get all job IDs for this company
        const { data: jobIds, error: jobError } = await supabase
            .from('jobs')
            .select('id')
            .eq('company_id', companyId);

        if (jobError) throw jobError;
        if (!jobIds?.length) {
            setInterviews([]);
            setPendingApplications([]);
            setStats({
                totalApproved: 0,
                totalInterviews: 0,
                totalSelected: 0,
                totalRejected: 0
            });
            setLoading(false);
            return;
        }

        const jobIdsList = jobIds.map(job => job.id);

        // Fetch interview application IDs separately
        const { data: interviewApps, error: interviewAppsError } = await supabase
            .from('interviews')
            .select('application_id');

        if (interviewAppsError) throw interviewAppsError;

        const interviewApplicationIds = interviewApps?.map(app => app.application_id) || [];

        // Get all approved applications without scheduled interviews
        const { data: approved, error: approvedError } = await supabase
            .from('applications')
            .select(`
            id, 
            student_id,
            status,
            submitted_at,
            student_profiles (user_id, full_name),
            jobs (id, title)
        `)
            .in('job_id', jobIdsList)
            .eq('status', 'company_approved');

        if (approvedError) throw approvedError;

        // Filter out applications that already have interviews
        const filteredApplications = approved?.filter(app => !interviewApplicationIds.includes(app.id)) || [];

        setPendingApplications(filteredApplications);

        // Get all interviews for this company's applications
        const { data: interviewsData, error: interviewsError } = await supabase
            .from('interviews')
            .select(`
            id, 
            interview_date, 
            interview_type, 
            location, 
            meeting_link, 
            result, 
            notes,
            applications (
                id, 
                student_profiles (user_id, full_name),
                jobs (id, title)
            )
        `)
            .in('application_id', approved.map(app => app.id));

        if (interviewsError) throw interviewsError;
        setInterviews(interviewsData || []);
        console.log('Interviews:', interviewsData);

        // Calculate stats
        const totalApproved = filteredApplications.length + (interviewsData?.length || 0);
        const totalInterviews = interviewsData?.length || 0;
        const totalSelected = interviewsData?.filter(interview => interview.result === 'selected').length || 0;
        const totalRejected = interviewsData?.filter(interview => interview.result === 'not_selected').length || 0;

        setStats({
            totalApproved,
            totalInterviews,
            totalSelected,
            totalRejected
        });

    } catch (err) {
        setError('Failed to fetch data');
        console.error(err);
    } finally {
        setLoading(false);
    }
};

const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
};

const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        setLoading(true);
        setError(null);
        setSuccess(null);

        // Ensure application ID is selected
        if (!formData.application_id) {
            setError('Please select an application.');
            setLoading(false);
            return;
        }

        // Combine date and time
        const dateTime = new Date(`${formData.interview_date}T${formData.interview_time}`);

        const { error } = await supabase
            .from('interviews')
            .insert({
                application_id: formData.application_id,
                interview_date: dateTime.toISOString(),
                interview_type: formData.interview_type,
                location: formData.location || null,
                meeting_link: formData.meeting_link || null,
                notes: formData.notes || null
            });

        if (error) throw error;

        setSuccess('Interview scheduled successfully');
        setFormData({
            application_id: '',
            interview_date: '',
            interview_time: '',
            interview_type: 'technical',
            location: '',
            meeting_link: '',
            notes: ''
        });

        fetchData(); // Refresh data

    } catch (err) {
        setError('Failed to schedule interview');
        console.error(err);
    } finally {
        setLoading(false);
    }
};

const updateInterviewResult = async (interviewId, result) => {
    try {
        setProcessingId(interviewId);
        setError(null);

        const { error } = await supabase
            .from('interviews')
            .update({
                result,
                updated_at: new Date().toISOString()
            })
            .eq('id', interviewId);

        if (error) throw error;

        // Optimistically update the state
        setInterviews(prev =>
            prev.map(interview =>
                interview.id === interviewId
                    ? { ...interview, result }
                    : interview
            )
        );

        fetchData(); // Refresh stats

    } catch (err) {
        setError('Failed to update interview result');
        console.error(err);
    } finally {
        setProcessingId(null);
    }
};

const formatDateTime = (dateString) => {
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
    <div className="min-h-screen bg-base-200">
        <AppNavbar />
        <div className="p-4">
            <h2 className="text-2xl font-bold mb-6">Interview Management</h2>

            {/* Stats Summary */}
            <div className="stats shadow mb-6 w-full">
                <div className="stat">
                    <div className="stat-title">Total Approved</div>
                    <div className="stat-value">{stats.totalApproved}</div>
                    <div className="stat-desc">Applications approved</div>
                </div>

                <div className="stat">
                    <div className="stat-title">Interviews</div>
                    <div className="stat-value">{stats.totalInterviews}</div>
                    <div className="stat-desc">Scheduled interviews</div>
                </div>

                <div className="stat">
                    <div className="stat-title">Selected</div>
                    <div className="stat-value text-success">{stats.totalSelected}</div>
                    <div className="stat-desc">Candidates selected</div>
                </div>

                <div className="stat">
                    <div className="stat-title">Rejected</div>
                    <div className="stat-value text-error">{stats.totalRejected}</div>
                    <div className="stat-desc">Candidates rejected</div>
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

            {success && (
                <div className="alert alert-success mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{success}</span>
                    <button className="btn btn-sm" onClick={() => setSuccess(null)}>Dismiss</button>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-10 lg:gap-6">
                {/* Schedule Interview Form */}
                <div className="card bg-base-100 lg:col-span-4 shadow-xl">
                    <div className="card-body">
                        <h3 className="card-title">Schedule New Interview</h3>

                        {pendingApplications.length === 0 ? (
                            <div className="alert">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-info shrink-0 w-6 h-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                </svg>
                                <span>No pending applications that need interviews.</span>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit}>
                                <div className="form-control mb-4">
                                    <label className="label">
                                        <span className="label-text">Select Candidate</span>
                                    </label>
                                    <select
                                        name="application_id"
                                        value={formData.application_id}
                                        onChange={handleChange}
                                        className="select select-bordered w-full"
                                        required
                                    >
                                        <option value="" disabled>Select an approved candidate</option>
                                        {pendingApplications.map(app => (
                                            <option key={app.id} value={app.id}>
                                                {app.student_profiles?.full_name} - {app.jobs?.title}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 mb-4">
                                    <div className="form-control">
                                        <label className="label">
                                            <span className="label-text">Interview Date</span>
                                        </label>
                                        <input
                                            type="date"
                                            name="interview_date"
                                            value={formData.interview_date}
                                            onChange={handleChange}
                                            className="input input-bordered"
                                            required
                                        />
                                    </div>

                                    <div className="form-control">
                                        <label className="label">
                                            <span className="label-text">Interview Time</span>
                                        </label>
                                        <input
                                            type="time"
                                            name="interview_time"
                                            value={formData.interview_time}
                                            onChange={handleChange}
                                            className="input input-bordered"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="form-control mb-4">
                                    <label className="label">
                                        <span className="label-text">Interview Type</span>
                                    </label>
                                    <select
                                        name="interview_type"
                                        value={formData.interview_type}
                                        onChange={handleChange}
                                        className="select select-bordered w-full"
                                        required
                                    >
                                        <option value="technical">Technical</option>
                                        <option value="hr">HR</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <div className="form-control">
                                        <label className="label">
                                            <span className="label-text">Location (if in-person)</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="location"
                                            value={formData.location}
                                            onChange={handleChange}
                                            className="input input-bordered"
                                            placeholder="Office address or room number"
                                        />
                                    </div>

                                    <div className="form-control">
                                        <label className="label">
                                            <span className="label-text">Meeting Link (if virtual)</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="meeting_link"
                                            value={formData.meeting_link}
                                            onChange={handleChange}
                                            className="input input-bordered"
                                            placeholder="Zoom/Teams/Meet link"
                                        />
                                    </div>
                                </div>

                                <div className="form-control mb-4">
                                    <label className="label">
                                        <span className="label-text">Notes (optional)</span>
                                    </label>
                                    <textarea
                                        name="notes"
                                        value={formData.notes}
                                        onChange={handleChange}
                                        className="textarea textarea-bordered"
                                        placeholder="Additional instructions for the candidate"
                                    ></textarea>
                                </div>

                                <div className="form-control mt-6">
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={loading}
                                    >
                                        {loading ? <span className="loading loading-spinner"></span> : 'Schedule Interview'}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>

                {/* Interviews List */}
                <div className="card bg-base-100 lg:col-span-6 shadow-xl mt-3 lg:mt-0">
                    <div className="card-body">
                        <h3 className="card-title">Scheduled Interviews</h3>

                        {loading ? (
                            <div className="flex justify-center items-center h-64">
                                <span className="loading loading-spinner loading-lg"></span>
                            </div>
                        ) : interviews.length === 0 ? (
                            <div className="alert">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-info shrink-0 w-6 h-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>No interviews scheduled yet.</span>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="table w-full">
                                    <thead>
                                        <tr>
                                            <th>Candidate</th>
                                            <th>Position</th>
                                            <th>Date & Time</th>
                                            <th>Type</th>
                                            <th>Result</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {interviews.map(interview => {
                                            const isPastInterview = new Date(interview.interview_date) < new Date();
                                            return (
                                                <tr key={interview.id}>
                                                    <td>{interview.applications?.student_profiles?.full_name}</td>
                                                    <td>{interview.applications?.jobs?.title}</td>
                                                    <td>{formatDateTime(interview.interview_date)}</td>
                                                    <td>
                                                        <span className="badge">
                                                            {interview.interview_type}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        {interview.result === 'selected' && (
                                                            <span className="badge badge-success">Selected</span>
                                                        )}
                                                        {interview.result === 'not_selected' && (
                                                            <span className="badge badge-error">Rejected</span>
                                                        )}
                                                        {interview.result == null && isPastInterview && (
                                                            <span className="badge badge-warning">Pending</span>
                                                        )}
                                                        {interview.result == null && !isPastInterview && (
                                                            <span className="badge badge-ghost">Upcoming</span>
                                                        )}
                                                    </td>
                                                    <td>
                                                        {isPastInterview && !interview.result && (
                                                            <div className="flex gap-2">
                                                                <button
                                                                    className="btn btn-xs btn-success"
                                                                    disabled={processingId === interview.id}
                                                                    onClick={() => updateInterviewResult(interview.id, 'selected')}
                                                                >
                                                                    {processingId === interview.id ?
                                                                        <span className="loading loading-spinner loading-xs"></span> :
                                                                        'Select'
                                                                    }
                                                                </button>
                                                                <button
                                                                    className="btn btn-xs btn-error"
                                                                    disabled={processingId === interview.id}
                                                                    onClick={() => updateInterviewResult(interview.id, 'not_selected')}
                                                                >
                                                                    {processingId === interview.id ?
                                                                        <span className="loading loading-spinner loading-xs"></span> :
                                                                        'Reject'
                                                                    }
                                                                </button>
                                                            </div>
                                                        )}
                                                        {/* Replace the dropdown with this */}
                                                        <>
                                                            <button
                                                                className="btn btn-xs btn-ghost"
                                                                onClick={() => document.getElementById(`modal-${interview.id}`).showModal()}
                                                            >
                                                                <Info className="w-4 h-4" />
                                                                Details
                                                            </button>

                                                            <dialog id={`modal-${interview.id}`} className="modal modal-bottom sm:modal-middle">
                                                                <div className="modal-box">
                                                                    <h3 className="font-bold text-lg">{interview.applications?.student_profiles?.full_name}</h3>
                                                                    <div className="divider"></div>
                                                                    {interview.location && (
                                                                        <div className="flex items-center gap-2 mb-2">
                                                                            <MapPin className="w-4 h-4" />
                                                                            <span>{interview.location}</span>
                                                                        </div>
                                                                    )}
                                                                    {interview.meeting_link && (
                                                                        <div className="flex items-center gap-2 mb-2">
                                                                            <Video className="w-4 h-4" />
                                                                            <a href={interview.meeting_link} target="_blank" rel="noopener noreferrer" className="link link-primary">
                                                                                Join Meeting
                                                                            </a>
                                                                        </div>
                                                                    )}
                                                                    {interview.notes && (
                                                                        <div className="flex items-start gap-2">
                                                                            <FileText className="w-4 h-4 mt-1" />
                                                                            <span>{interview.notes}</span>
                                                                        </div>
                                                                    )}
                                                                    <div className="modal-action">
                                                                        <form method="dialog">
                                                                            <button className="btn">Close</button>
                                                                        </form>
                                                                    </div>
                                                                </div>
                                                            </dialog>
                                                        </>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    </div>
);
};

export default InterviewSchedule;