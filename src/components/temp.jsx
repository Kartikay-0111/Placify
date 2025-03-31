import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { X, Plus, Calendar, Info } from 'lucide-react';

const JobPostingForm = ({ initialFormData = null }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [requirements, setRequirements] = useState([]);
  const [newRequirement, setNewRequirement] = useState('');
  const [colleges, setColleges] = useState([]);
  const [selectedColleges, setSelectedColleges] = useState([]);

  const [formData, setFormData] = useState({
    title: '',
    company_name: '',
    position: '',
    location: '',
    job_type: 'Full-time',
    description: '',
    min_cgpa: 0,
    stipend: '',
    eligibility_criteria: '',
    application_deadline: '',
    status: 'pending',
  });

  useEffect(() => {
    const fetchColleges = async () => {
      const { data, error } = await supabase.from('colleges').select('id, name');
      if (!error) setColleges(data);
    };
    fetchColleges();
  }, []);

  useEffect(() => {
    if (initialFormData) {
      setFormData(initialFormData);
      setRequirements(initialFormData.requirements || []);
    }
  }, [initialFormData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCollegeSelect = (collegeId) => {
    setSelectedColleges((prev) =>
      prev.includes(collegeId) ? prev.filter((id) => id !== collegeId) : [...prev, collegeId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const jobData = {
        ...formData,
        requirements,
        company_id: user?.id,
        updated_at: new Date(),
      };

      let jobId;
      if (initialFormData) {
        const { data, error } = await supabase
          .from('jobs')
          .update(jobData)
          .eq('id', initialFormData.id)
          .select();

        if (error) throw error;
        jobId = initialFormData.id;
      } else {
        jobData.created_at = new Date();
        const { data, error } = await supabase.from('jobs').insert([jobData]).select();
        if (error) throw error;
        jobId = data[0].id;
      }

      await supabase.from('job_college_targets').delete().eq('job_id', jobId);
      const jobColleges = selectedColleges.map((collegeId) => ({ job_id: jobId, college_id: collegeId }));
      if (jobColleges.length > 0) await supabase.from('job_college_targets').insert(jobColleges);

      navigate('/jobs');
    } catch (err) {
      console.error('Error saving job:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          {error && <div className="alert alert-error"><Info size={16} /><span>{error}</span></div>}

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="form-control">
                <label className="label">Job Title</label>
                <input type="text" name="title" value={formData.title} onChange={handleInputChange} className="input input-bordered w-full" required />
              </div>
              <div className="form-control">
                <label className="label">Company Name</label>
                <input type="text" name="company_name" value={formData.company_name} onChange={handleInputChange} className="input input-bordered w-full" required />
              </div>
            </div>

            {/* College Selection */}
            <div className="form-control mt-6">
              <label className="label">Target Colleges</label>
              <div className="dropdown">
                <div tabIndex={0} className="input input-bordered w-full cursor-pointer">Select Colleges</div>
                <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-full">
                  {colleges.map((college) => (
                    <li key={college.id}>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedColleges.includes(college.id)}
                          onChange={() => handleCollegeSelect(college.id)}
                        />
                        {college.name}
                      </label>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="card-actions justify-end mt-8">
              <button type="button" className="btn btn-ghost" onClick={() => navigate('/jobs')}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? <span className="loading loading-spinner"></span> : initialFormData ? 'Update Job' : 'Create Job'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default JobPostingForm;
