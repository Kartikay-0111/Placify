import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { Calendar, Clock, Briefcase, Users, CheckSquare, AlertCircle } from 'lucide-react';
import AppNavbar from '@/components/AppNavbar';

export default function CompanyDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [companyProfile, setCompanyProfile] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    activeJobs: 0,
    totalApplications: 0,
    pendingReviews: 0,
    recentJobs: [],
    completedJobs: 0,
    applicationTrends: [],
    statusDistribution: []
  });

  useEffect(() => {
    if (!user) return;
    
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch company profile
        const { data: profileData } = await supabase
          .from('company_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();
        setCompanyProfile(profileData);
        
        // Fetch jobs
        const { data: jobs } = await supabase
          .from('jobs')
          .select('id, title, job_type, status, application_deadline, created_at')
          .eq('company_id', user.id)
          .order('created_at', { ascending: false });
        
        const activeJobs = jobs ? jobs.filter(job => job.status === 'active').length : 0;
        const completedJobs = jobs ? jobs.filter(job => job.status === 'closed').length : 0;
        
        // Fetch applications
        const { data: applications } = await supabase
          .from('applications')
          .select('id, status, job_id, created_at')
          .in('job_id', jobs ? jobs.map(job => job.id) : []);
        
        const totalApplications = applications ? applications.length : 0;
        const pendingReviews = applications ? applications.filter(app => app.status === 'cell_approved').length : 0;
        
        // Create application trends data (last 7 days)
        const today = new Date();
        const applicationTrends = Array(7).fill().map((_, i) => {
          const date = new Date(today);
          date.setDate(date.getDate() - (6 - i));
          const dateStr = date.toISOString().split('T')[0];
          
          const count = applications ? applications.filter(app => {
            const appDate = new Date(app.created_at).toISOString().split('T')[0];
            return appDate === dateStr;
          }).length : 0;
          
          return {
            date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            count
          };
        });
        
        // Create status distribution data
        const statusCounts = applications ? applications.reduce((acc, app) => {
          acc[app.status] = (acc[app.status] || 0) + 1;
          return acc;
        }, {}) : {};
        
        const statusDistribution = Object.keys(statusCounts).map(status => ({
          name: status.replace('_', ' '),
          value: statusCounts[status]
        }));
        
        setDashboardData({
          activeJobs,
          totalApplications,
          pendingReviews,
          recentJobs: jobs ? jobs.slice(0, 3) : [],
          completedJobs,
          applicationTrends,
          statusDistribution
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [user]);

  // Colors for the charts
  const COLORS = ['#4C51BF', '#38B2AC', '#ED8936', '#ECC94B', '#F56565'];
  
  return (
    <div className="min-h-screen bg-gray-100">
      <AppNavbar />
      
      <div className="drawer lg:drawer-open">
        <input id="dashboard-drawer" type="checkbox" className="drawer-toggle" />
        <div className="drawer-content flex flex-col p-4 lg:p-8">
          {/* Top bar */}
          <div className="navbar bg-base-100 rounded-lg shadow-md mb-6">
            <div className="flex-none lg:hidden">
              <label htmlFor="dashboard-drawer" className="btn btn-square btn-ghost">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-6 h-6 stroke-current">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
                </svg>
              </label>
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-primary">Look at the report in your dashboard</h1>
            </div>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <span className="loading loading-spinner loading-lg text-primary"></span>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Stat Cards */}
              <div className="stats shadow bg-primary text-primary-content">
                <div className="stat">
                  <div className="stat-figure text-primary-content">
                    <Briefcase size={36} />
                  </div>
                  <div className="stat-title">Active Jobs</div>
                  <div className="stat-value">{dashboardData.activeJobs}</div>
                  <div className="stat-desc">Job postings currently live</div>
                </div>
              </div>
              
              <div className="stats shadow bg-secondary text-secondary-content">
                <div className="stat">
                  <div className="stat-figure text-secondary-content">
                    <Users size={36} />
                  </div>
                  <div className="stat-title">Applications</div>
                  <div className="stat-value">{dashboardData.totalApplications}</div>
                  <div className="stat-desc">Total candidates applied</div>
                </div>
              </div>
              
              <div className="stats shadow bg-accent text-accent-content">
                <div className="stat">
                  <div className="stat-figure text-accent-content">
                    <CheckSquare size={36} />
                  </div>
                  <div className="stat-title">Pending Reviews</div>
                  <div className="stat-value">{dashboardData.pendingReviews}</div>
                  <div className="stat-desc">Applications needing attention</div>
                </div>
              </div>
              
              {/* Application Trends Chart */}
              <div className="card shadow-lg bg-base-100 col-span-1 lg:col-span-2">
                <div className="card-body">
                  <h2 className="card-title">
                    <Calendar className="w-6 h-6 mr-2" />
                    Application Trends
                  </h2>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={dashboardData.applicationTrends}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="count" stroke="#4C51BF" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <p className="text-sm text-gray-500">Applications received over last 7 days</p>
                </div>
              </div>
              
              {/* Application Status Distribution */}
              <div className="card shadow-lg bg-base-100">
                <div className="card-body">
                  <h2 className="card-title">
                    <AlertCircle className="w-6 h-6 mr-2" />
                    Status Distribution
                  </h2>
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={dashboardData.statusDistribution}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {dashboardData.statusDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
              
              {/* Quick Actions */}
              <div className="card shadow-lg bg-base-100">
                <div className="card-body">
                  <h2 className="card-title">Quick Actions</h2>
                  <div className="flex flex-wrap gap-4">
                    <Link to="/company/jobs/new" className="btn btn-outline btn-primary">
                      <Briefcase className="w-5 h-5 mr-2" />
                      Post New Job
                    </Link>
                    <Link to="/company/applications" className="btn btn-outline btn-secondary">
                      <Users className="w-5 h-5 mr-2" />
                      View All Applications
                    </Link>
                    <Link to="/company/profile" className="btn btn-outline btn-accent">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                      Edit Company Profile
                    </Link>
                  </div>
                </div>
              </div>
              
              {/* Recent Jobs Table */}
              <div className="card shadow-lg bg-base-100 col-span-1 lg:col-span-2">
                <div className="card-body">
                  <h2 className="card-title">
                    <Clock className="w-6 h-6 mr-2" />
                    Recent Job Postings
                  </h2>
                  <div className="overflow-x-auto">
                    {dashboardData.recentJobs.length === 0 ? (
                      <div className="alert alert-info">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        <span>No jobs posted yet. Create your first job posting!</span>
                      </div>
                    ) : (
                      <table className="table table-zebra">
                        <thead>
                          <tr>
                            <th>Title</th>
                            <th>Type</th>
                            <th>Deadline</th>
                            <th>Status</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {dashboardData.recentJobs.map(job => (
                            <tr key={job.id}>
                              <td>{job.title}</td>
                              <td><span className="badge badge-outline">{job.job_type}</span></td>
                              <td>{new Date(job.application_deadline).toLocaleDateString()}</td>
                              <td>
                                <span className={`badge ${job.status === 'active' ? 'badge-success' : 'badge-ghost'}`}>
                                  {job.status}
                                </span>
                              </td>
                              <td>
                                <Link to={`/jobs/${job.id}`} className="btn btn-xs btn-primary">View</Link>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                  <div className="card-actions justify-end mt-4">
                    <Link to="/company/jobs/new" className="btn btn-primary">
                      Create New Job
                    </Link>
                  </div>
                </div>
              </div>
              
            </div>
          )}
        </div>
        
        {/* Sidebar */}
        {/* <div className="drawer-side">
          <label htmlFor="dashboard-drawer" className="drawer-overlay"></label>
          <ul className="menu p-4 w-64 h-full bg-base-200 text-base-content">
            <li className="mb-4">
              <h2 className="text-xl font-bold">{companyProfile?.name || 'Your Company'}</h2>
            </li>
            <li>
              <a className="active">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Dashboard
              </a>
            </li>
            <li>
              <a>
                <Briefcase className="h-5 w-5" />
                Jobs
              </a>
            </li>
            <li>
              <a>
                <Users className="h-5 w-5" />
                Applications
              </a>
            </li>
            <li>
              <a>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Analytics
              </a>
            </li>
            <li>
              <a>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Settings
              </a>
            </li>
            <div className="divider"></div>
            <li>
              <a>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </a>
            </li>
          </ul>
        </div> */}
      </div>
    </div>
  );
}