import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import AppNavbar from '../../components/AppNavbar';

const AdminStudentManagement = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('pending');

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        try {
            setLoading(true);

            // Get admin's college_id
            const { data: userData, error: userError } = await supabase.auth.getUser();
            if (userError) throw userError;

            const { data: adminData, error: adminError } = await supabase
                .from('users')
                .select('college_id')
                .eq('id', userData.user.id)
                .single();
            if (adminError) throw adminError;

            // Fetch students from the admin's college
            const { data, error } = await supabase
                .from('student_profiles')
                .select(`
                user_id,
                full_name,
                roll_number,
                branch,
                year_of_graduation,
                skills,
                cgpa,
                about,
                resume_url,
                avatar_url,
                status,
                created_at,
                users (
                    email
                )
                `)
                .eq('college_id', adminData.college_id)
                .order('created_at', { ascending: false });

            if (error) throw error;

            setStudents(data);
        } catch (error) {
            console.error('Error fetching students:', error);
            alert('Error fetching students. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleStudentClick = (student) => {
        setSelectedStudent(student);
        setIsModalOpen(true);
    };

    const handleApprove = async () => {
        try {
            const { error } = await supabase
                .from('student_profiles')
                .update({ status: 'approved' })
                .eq('user_id', selectedStudent.user_id);

            if (error) throw error;

            setStudents(students.map(student =>
                student.user_id === selectedStudent.user_id
                    ? { ...student, status: 'approved' }
                    : student
            ));

            setIsModalOpen(false);
            alert('Student approved successfully!');
        } catch (error) {
            console.error('Error approving student:', error);
            alert('Error approving student. Please try again.');
        }
    };

    const handleReject = async () => {
        try {
            const { error } = await supabase
                .from('student_profiles')
                .update({ status: 'rejected' })
                .eq('user_id', selectedStudent.user_id);

            if (error) throw error;

            setStudents(students.map(student =>
                student.user_id === selectedStudent.user_id
                    ? { ...student, status: 'rejected' }
                    : student
            ));

            setIsModalOpen(false);
            alert('Student rejected successfully!');
        } catch (error) {
            console.error('Error rejecting student:', error);
            alert('Error rejecting student. Please try again.');
        }
    };

    const pendingStudents = students.filter(student => student.status === 'pending');
    const approvedStudents = students.filter(student => student.status === 'approved');
    const rejectedStudents = students.filter(student => student.status === 'rejected');

    const displayStudents = activeTab === 'pending'
        ? pendingStudents
        : activeTab === 'approved'
            ? approvedStudents
            : rejectedStudents;

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <span className="loading loading-spinner loading-lg text-primary"></span>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-base-200">
            <AppNavbar />
            <div className="container px-4 py-8  lg:w-10/12 mx-auto">
                <h1 className="text-3xl font-bold mb-6">Student Management</h1>

                {/* Tabs */}
                <div className='card bg-base-100 shadow-xl'>
                    <div className='card-body'>
                        <div className="tabs tabs-boxed mb-6">
                            <button
                                className={`tab flex items-center gap-2 ${activeTab === 'pending' ? 'tab-active' : ''}`}
                                onClick={() => setActiveTab('pending')}
                            >
                                Pending
                                <div className="badge badge-secondary">{pendingStudents.length}</div>
                            </button>
                            <button
                                className={`tab flex items-center gap-2 ${activeTab === 'approved' ? 'tab-active' : ''}`}
                                onClick={() => setActiveTab('approved')}
                            >
                                Approved
                                <div className="badge badge-primary">{approvedStudents.length}</div>
                            </button>
                            <button
                                className={`tab flex items-center gap-2 ${activeTab === 'rejected' ? 'tab-active' : ''}`}
                                onClick={() => setActiveTab('rejected')}
                            >
                                Rejected
                                <div className="badge badge-error">{rejectedStudents.length}</div>
                            </button>
                        </div>

                        {/* Student List */}
                        <div className="overflow-x-auto">
                            <table className="table w-full">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Roll Number</th>
                                        <th>Branch</th>
                                        <th>Year of Graduation</th>
                                        <th>CGPA</th>
                                        <th>Created At</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {displayStudents.length > 0 ? (
                                        displayStudents.map((student) => (
                                            <tr key={student.user_id} className="hover">
                                                <td>
                                                    <div className="flex items-center space-x-3">
                                                        <div className="avatar">
                                                            <div className="mask mask-squircle w-12 h-12">
                                                                <img
                                                                    src={student.avatar_url || 'https://via.placeholder.com/40'}
                                                                    alt={student.full_name}
                                                                />
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <div className="font-bold">{student.full_name}</div>
                                                            {/* <div className="text-sm opacity-50">{student.users.email}</div> */}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>{student.roll_number}</td>
                                                <td>{student.branch}</td>
                                                <td>{student.year_of_graduation}</td>
                                                <td>{student.cgpa}</td>
                                                <td>{new Date(student.created_at).toLocaleDateString()}</td>
                                                <td>
                                                    <button
                                                        className="btn btn-sm btn-primary"
                                                        onClick={() => handleStudentClick(student)}
                                                    >
                                                        View Details
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="7" className="text-center py-4">
                                                No students found in this category.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Student Detail Modal */}
                        {selectedStudent && (
                            <div className={`modal ${isModalOpen ? 'modal-open' : ''}`}>
                                <div className="modal-box max-w-3xl">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-4">
                                            <div className="avatar">
                                                <div className="w-16 rounded-full">
                                                    <img
                                                        src={selectedStudent.avatar_url || 'https://via.placeholder.com/64'}
                                                        alt={selectedStudent.full_name}
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold">{selectedStudent.full_name}</h3>
                                                {/* <p className="text-gray-500">{selectedStudent.users.email}</p> */}
                                            </div>
                                        </div>
                                        <button
                                            className="btn btn-sm btn-circle"
                                            onClick={() => setIsModalOpen(false)}
                                        >
                                            ✕
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                        <div className="form-control">
                                            <label className="label">
                                                <span className="label-text font-semibold">Roll Number</span>
                                            </label>
                                            <input type="text" value={selectedStudent.roll_number || 'N/A'} className="input input-bordered" readOnly />
                                        </div>

                                        <div className="form-control">
                                            <label className="label">
                                                <span className="label-text font-semibold">Branch</span>
                                            </label>
                                            <input type="text" value={selectedStudent.branch || 'N/A'} className="input input-bordered" readOnly />
                                        </div>

                                        <div className="form-control">
                                            <label className="label">
                                                <span className="label-text font-semibold">Year of Graduation</span>
                                            </label>
                                            <input type="text" value={selectedStudent.year_of_graduation || 'N/A'} className="input input-bordered" readOnly />
                                        </div>

                                        <div className="form-control">
                                            <label className="label">
                                                <span className="label-text font-semibold">CGPA</span>
                                            </label>
                                            <input type="text" value={selectedStudent.cgpa || 'N/A'} className="input input-bordered" readOnly />
                                        </div>
                                    </div>

                                    <div className="form-control mb-4">
                                        <label className="label">
                                            <span className="label-text font-semibold">Skills</span>
                                        </label>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedStudent.skills && selectedStudent.skills.length > 0 ? (
                                                selectedStudent.skills.map((skill, index) => (
                                                    <div key={index} className="badge badge-primary">{skill}</div>
                                                ))
                                            ) : (
                                                <span className="text-gray-500">No skills listed</span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="form-control mb-4">
                                        <label className="label">
                                            <span className="label-text font-semibold">About</span>
                                        </label>
                                        <textarea
                                            className="textarea textarea-bordered h-24"
                                            value={selectedStudent.about || 'No information provided'}
                                            readOnly
                                        />
                                    </div>

                                    {selectedStudent.resume_url && (
                                        <div className="form-control mb-6">
                                            <label className="label">
                                                <span className="label-text font-semibold">Resume</span>
                                            </label>
                                            <a
                                                href={selectedStudent.resume_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="btn btn-outline"
                                            >
                                                View Resume
                                            </a>
                                        </div>
                                    )}

                                    {selectedStudent.status === 'pending' && (
                                        <div className="modal-action flex justify-end gap-2">
                                            <button
                                                className="btn btn-error"
                                                onClick={handleReject}
                                            >
                                                Reject
                                            </button>
                                            <button
                                                className="btn btn-success"
                                                onClick={handleApprove}
                                            >
                                                Approve
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminStudentManagement;