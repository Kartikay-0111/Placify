import { useState, useEffect } from 'react';
import { getTable } from '@/lib/supabase-helpers';
import { useAuth } from '@/contexts/AuthContext';
import AppNavbar from '@/components/AppNavbar';
import { format } from 'date-fns';

export default function ApplicationsManagement() {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState(null);
  const [status, setStatus] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchApplications();
  }, [user]);

  const fetchApplications = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await getTable('applications')
        .select(`*, job:jobs(*), student:student_profiles(*)`)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setApplications(data || []);
    } catch (error) {
      console.error('Error fetching applications:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async () => {
    if (!selectedApp || !status) return;
    try {
      await getTable('applications').update({
        status,
        placement_cell_notes: notes,
        updated_at: new Date().toISOString(),
      }).eq('id', selectedApp.id);
      fetchApplications();
      setSelectedApp(null);
      setStatus('');
      setNotes('');
    } catch (error) {
      console.error('Error updating application status:', error.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <AppNavbar />
      <main className="flex-1 pt-20 pb-12 px-4 md:px-8 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-4">Applications Management</h1>
          <button onClick={fetchApplications} className="px-4 py-2 bg-gray-800 text-white rounded">Refresh</button>
          {loading ? <p>Loading...</p> : (
            <table className="w-full border mt-4">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border p-2">Student</th>
                  <th className="border p-2">Position</th>
                  <th className="border p-2">Company</th>
                  <th className="border p-2">Applied On</th>
                  <th className="border p-2">Status</th>
                  <th className="border p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {applications.map(app => (
                  <tr key={app.id} className="border">
                    <td className="p-2">{app.student?.full_name}</td>
                    <td className="p-2">{app.job?.title}</td>
                    <td className="p-2">{app.job?.company_name}</td>
                    <td className="p-2">{format(new Date(app.submitted_at), 'PPP')}</td>
                    <td className="p-2">{app.status}</td>
                    <td className="p-2">
                      <button onClick={() => setSelectedApp(app)} className="px-3 py-1 bg-blue-500 text-white rounded">Review</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {selectedApp && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
              <div className="bg-white p-6 rounded shadow-lg w-96">
                <h2 className="text-xl font-bold">Review Application</h2>
                <p>{selectedApp.student?.full_name} - {selectedApp.job?.title}</p>
                <label className="block mt-4">Status:
                  <select value={status} onChange={e => setStatus(e.target.value)} className="block w-full border p-2">
                    <option value="pending">Pending</option>
                    <option value="cell_approved">Approved</option>
                    <option value="cell_rejected">Rejected</option>
                  </select>
                </label>
                <label className="block mt-4">Notes:
                  <textarea value={notes} onChange={e => setNotes(e.target.value)} className="block w-full border p-2"></textarea>
                </label>
                <div className="flex justify-between mt-4">
                  <button onClick={() => setSelectedApp(null)} className="px-4 py-2 bg-gray-300 rounded">Cancel</button>
                  <button onClick={handleStatusChange} className="px-4 py-2 bg-green-500 text-white rounded">Update</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
