import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import AppNavbar from '@/components/AppNavbar';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalJobs: 0,
    totalApplications: 0,
    totalStudents: 0,
  });
  const [recentApplications, setRecentApplications] = useState([]);
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
  
        if (!user || user.role !== 'admin') return;
  
        // Fetch admin's college_id
        const { data: adminData, error: adminError } = await supabase
          .from('users')
          .select('college_id')
          .eq('id', user.id)
          .single();
  
        if (adminError || !adminData?.college_id) {
          throw new Error('Failed to fetch admin college data.');
        }
  
        const adminCollegeId = adminData.college_id;
  
        // Fetch job IDs linked to this college
        const { data: jobTargets } = await supabase
          .from('job_college_targets')
          .select('job_id')
          .eq('college_id', adminCollegeId);
  
        const jobIds = jobTargets?.map((job) => job.job_id) || [];
  
        //Fetch student IDs linked to this college
        const { data: studentProfiles } = await supabase
          .from('student_profiles')
          .select('user_id')
          .eq('college_id', adminCollegeId);
  
        const studentIds = studentProfiles?.map((student) => student.user_id) || [];
  
        //Fetch counts only for this college
        const { count: jobsCount } = jobIds.length
          ? await supabase.from('jobs').select('*', { count: 'exact', head: true }).in('id', jobIds)
          : { count: 0 };
  
        const { count: applicationsCount } = studentIds.length
          ? await supabase.from('applications').select('*', { count: 'exact', head: true }).in('student_id', studentIds)
          : { count: 0 };
  
        const { count: studentsCount } = await supabase
          .from('student_profiles')
          .select('*', { count: 'exact', head: true })
          .eq('college_id', adminCollegeId);
  
        //Fetch recent applications for this college
        // const { data: recentApplicationsData } = studentIds.length
        //   ? await supabase
        //       .from('applications')
        //       .select(`
        //         *,
        //         jobs ( id, title, company_name )
        //       `)
        //       .in('student_id', studentIds)
        //       .order('submitted_at', { ascending: false })
        //       .limit(5)
        //   : { data: [] };

        const {data: recentApplicationsData, error } = await supabase 
        .from('applications')
        .select(`*, job:jobs(id, title, company_name ), student:student_profiles(full_name)`)
        .order('updated_at', { ascending: false })
        .limit(5)
  
        setStats({
          totalJobs: jobsCount || 0,
          totalApplications: applicationsCount || 0,
          totalStudents: studentsCount || 0,
        });
        setRecentApplications(recentApplicationsData || []);
        // console.log('Recent Applications:', recentApplicationsData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchDashboardData();
  }, [user]);
  
  

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <AppNavbar />
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-gray-500">Welcome back, {user?.email}. Here's an overview.</p>

        <div className="grid gap-4 grid-cols-1 md:grid-cols-3 my-6">
          {[
            { label: 'Total Jobs', value: stats.totalJobs },
            { label: 'Applications', value: stats.totalApplications },
            { label: 'Students', value: stats.totalStudents },
          ].map(({ label, value }, index) => (
            <div key={index} className="p-4 border rounded-lg shadow-sm bg-white">
              <h2 className="text-lg font-medium">{label}</h2>
              <p className="text-2xl font-bold">{value}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="border rounded-lg shadow-sm bg-white p-4">
            <h2 className="text-lg font-medium mb-4">Recent Applications</h2>
            {recentApplications.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left border-b">
                      <th className="p-2">Student</th>
                      <th className="p-2">Job</th>
                      <th className="p-2">Status</th>
                      <th className="p-2">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentApplications.map((app) => (
                      <tr key={app.id} className="border-b">
                        <td className="p-2">{app.student?.full_name}</td>
                        <td className="p-2">{app.job?.title}</td>
                        <td className="p-2">
                          <span className="px-2 py-1 text-xs rounded bg-gray-100">
                            {app.status}
                          </span>
                        </td>
                        <td className="p-2">{format(new Date(app.submitted_at), 'MMM d, yyyy')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500">No recent applications</p>
            )}
            <Link to="/admin/applications" className="text-blue-500 hover:underline mt-4 inline-block">
              View All Applications
            </Link>
          </div>

          <div className="border rounded-lg shadow-sm bg-white p-4">
            <h2 className="text-lg font-medium mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <Link
                to="/admin/jobs"
                className="block w-full text-center bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
              >
                Manage Jobs
              </Link>
              <Link
                to="/admin/applications"
                className="block w-full text-center bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
              >
                Review Applications
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}