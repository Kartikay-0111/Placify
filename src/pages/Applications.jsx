import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import AppNavbar from '@/components/AppNavbar';
import Header from '@/components/Header';

export default function Applications() {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchApplications() {
      try {
        const { data, error } = await supabase
          .from('applications')
          .select(`
            *,
            jobs (
              id,
              title,
              company_name,
              location,
              job_type
            )
          `)
          .eq('student_id', user.id)
          .order('submitted_at', { ascending: false });

        if (error) throw error;
        setApplications(data || []);
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
    const baseClasses = 'px-2 py-1 rounded-full text-xs font-medium';
    switch (status) {
      case 'pending':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'cell_approved':
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case 'cell_rejected':
        return `${baseClasses} bg-red-100 text-red-800`;
      case 'company_approved':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'company_rejected':
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <AppNavbar />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AppNavbar />
      {/* <Header 
        title="My Applications" 
        description="Track the status of your job applications"
      /> */}
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {applications.length === 0 ? (
          <div className="glass-card p-8 text-center">
            <p className="text-gray-500">You haven't applied to any jobs yet.</p>
          </div>
        ) : (
          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Job Details
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Applied On
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Updated
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {applications.map((application) => (
                    <tr key={application.id}>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <div className="text-sm font-medium text-gray-900">
                            {application.jobs.title}
                          </div>
                          <div className="text-sm text-gray-500">
                            {application.jobs.company_name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {application.jobs.location} • {application.jobs.job_type}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={getStatusBadgeClass(application.status)}>
                          {application.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {formatDate(application.submitted_at)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {formatDate(application.updated_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}