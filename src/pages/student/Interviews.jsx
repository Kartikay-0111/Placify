import React, { useState } from 'react';

const InterviewsList = ({ interviews, loading }) => {
    const [selectedInterview, setSelectedInterview] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString();
    };

    const openModal = (interview) => {
        setSelectedInterview(interview);
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
    };

    return (
        <div className="p-4">
            {loading ? (
                <div className="flex justify-center items-center p-8">
                    <span className="loading loading-spinner loading-md text-primary"></span>
                    <p className="ml-2">Loading interviews...</p>
                </div>
            ) : interviews.length > 0 ? (
                <div className="space-y-4">
                    <h2 className="text-xl font-bold mb-4">Upcoming Interviews</h2>
                    <div className="overflow-x-auto">
                        <table className="table table-zebra w-full">
                            <thead>
                                <tr>
                                    <th>Company</th>
                                    <th>Position</th>
                                    <th>Date</th>
                                    <th>Type</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {interviews.map((interview) => (
                                    <tr key={interview.id} className="hover">
                                        <td>{interview.applications.jobs.company_name}</td>
                                        <td>{interview.applications.jobs.title}</td>
                                        <td>{formatDate(interview.interview_date)}</td>
                                        <td>
                                            <span className="badge badge-accent">{interview.interview_type}</span>
                                        </td>
                                        <td>
                                            <button 
                                                className="btn btn-sm btn-primary" 
                                                onClick={() => openModal(interview)}
                                            >
                                                View Details
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="text-center p-8 bg-base-200 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="mt-2 text-lg">No interviews scheduled.</p>
                    <p className="text-sm text-gray-500">When you have interviews, they'll appear here.</p>
                </div>
            )}

            {/* Modal for interview details */}
            {modalOpen && selectedInterview && (
                <div className="modal modal-open">
                    <div className="modal-box max-w-3xl">
                        <h3 className="font-bold text-lg">
                            {selectedInterview.applications.jobs.title} at {selectedInterview.applications.jobs.company_name}
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <div className="space-y-2">
                                <div className="flex items-center">
                                    <span className="font-semibold w-32">Date & Time:</span>
                                    <span>{formatDate(selectedInterview.interview_date)}</span>
                                </div>
                                <div className="flex items-center">
                                    <span className="font-semibold w-32">Type:</span>
                                    <span className="badge badge-accent">{selectedInterview.interview_type}</span>
                                </div>
                                <div className="flex items-center">
                                    <span className="font-semibold w-32">Location:</span>
                                    <span>{selectedInterview.location}</span>
                                </div>
                                <div className="flex items-center">
                                    <span className="font-semibold w-32">Job Type:</span>
                                    <span>{selectedInterview.applications.jobs.job_type}</span>
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                {selectedInterview.meeting_link && (
                                    <div>
                                        <span className="font-semibold block">Meeting Link:</span>
                                        <a 
                                            href={selectedInterview.meeting_link} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="link link-primary break-all"
                                        >
                                            {selectedInterview.meeting_link}
                                        </a>
                                    </div>
                                )}
                                
                                {selectedInterview.notes && (
                                    <div>
                                        <span className="font-semibold block">Notes:</span>
                                        <p className="p-2 bg-base-200 rounded">{selectedInterview.notes}</p>
                                    </div>
                                )}
                                
                                {selectedInterview.result ? (
                                    <div>
                                        <span className="font-semibold block">Result:</span>
                                        <span>{selectedInterview.result}</span>
                                    </div>
                                ): 
                                (
                                    <div className="flex items-center">
                                        <span className="font-semibold w-32">Result:</span>
                                        <span className="badge badge-warning">Pending</span>
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        <div className="divider"></div>
                        
                        <div>
                            <span className="font-semibold block">Job Description:</span>
                            <p className="p-2 bg-base-200 rounded mt-1">{selectedInterview.applications.jobs.description}</p>
                        </div>
                        
                        <div className="modal-action">
                            <button className="btn" onClick={closeModal}>Close</button>
                        </div>
                    </div>
                    <div className="modal-backdrop" onClick={closeModal}></div>
                </div>
            )}
        </div>
    );
};

export default InterviewsList;