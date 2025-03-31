import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import AppNavbar from '@/components/AppNavbar';
import Header from '@/components/Header';

export default function JobListings() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    jobType: '',
    location: '',
    minCgpa: '',
  });
  // console.log('User:', user);
  useEffect(() => {
    fetchJobs(user.id);
  }, [user]);

  async function fetchJobs(userId) {
    try {
        // Fetch the student's college_id first
        const { data: studentData, error: studentError } = await supabase
            .from('users')
            .select('college_id')
            .eq('id', userId)
            .single();

        if (studentError) throw studentError;
        if (!studentData) throw new Error('Student not found');

        // Fetch approved jobs for that college
        const { data: jobs, error: jobsError } = await supabase
            .from('jobs')
            .select('*, job_college_targets!inner(*)')
            .eq('job_college_targets.college_id', studentData.college_id)
            .eq('job_college_targets.approval_status', 'approved');

        if (jobsError) throw jobsError;
        setJobs(jobs || []);
        setLoading(false);
        // console.log('Approved Jobs:', jobs);
        return jobs;
    } catch (error) {
        console.error('Error fetching approved jobs:', error.message);
        return [];
    }
}

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesJobType = !filters.jobType || job.job_type.toLowerCase().trim() === filters.jobType.toLowerCase().trim();
    const matchesLocation = !filters.location || job.location.toLowerCase().includes(filters.location.toLowerCase());
    const matchesCgpa = !filters.minCgpa || job.min_cgpa <= parseFloat(filters.minCgpa);

    return matchesSearch && matchesJobType && matchesLocation && matchesCgpa;
  });

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
        title="Job Listings" 
        description="Explore available job opportunities"
      /> */}
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="mb-6 space-y-4">
          <div className="glass-card p-4">
            <input
              type="text"
              placeholder="Search jobs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <div className="glass-card p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <select
              value={filters.jobType}
              onChange={(e) => setFilters({ ...filters, jobType: e.target.value })}
              className="px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="">All Job Types</option>
              <option value="full-time">Full-time</option>
              <option value="internship">Internship</option>
              <option value="part-time">Part-time</option>
            </select>

            <input
              type="text"
              placeholder="Filter by location"
              value={filters.location}
              onChange={(e) => setFilters({ ...filters, location: e.target.value })}
              className="px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />

            <input
              type="number"
              step="0.01"
              placeholder="Minimum CGPA"
              value={filters.minCgpa}
              onChange={(e) => setFilters({ ...filters, minCgpa: e.target.value })}
              className="px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        </div>

        {filteredJobs.length === 0 ? (
          <div className="glass-card p-8 text-center">
            <p className="text-gray-500">No jobs found matching your criteria.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredJobs.map((job) => (
              <Link
                key={job.id}
                to={`/jobs/${job.id}`}
                className="block glass-card p-6 hover:shadow-lg transition-custom"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                    <p className="text-sm text-gray-600">{job.company_name}</p>
                    <div className="mt-2 space-x-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {job.job_type}
                      </span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {job.location}
                      </span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Min CGPA: {job.min_cgpa}
                      </span>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(job.created_at).toLocaleDateString()}
                  </div>
                </div>
                <p className="mt-2 text-sm text-gray-600 line-clamp-2">{job.description}</p>
                <div className="mt-4 flex justify-between items-center">
                  <div className="text-sm font-medium text-gray-900">
                    Stipend: {job.stipend}
                  </div>
                  <div className="text-sm text-gray-500">
                    Apply by: {new Date(job.application_deadline).toLocaleDateString()}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}