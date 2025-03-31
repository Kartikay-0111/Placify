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
    status: 'published',
  });

  const addRequirement = () => {
    if (newRequirement.trim() !== '') {
      setRequirements([...requirements, newRequirement.trim()]);
      setNewRequirement('');
    }
  };

  const removeRequirement = (index) => {
    setRequirements(requirements.filter((_, i) => i !== index));
  };

  useEffect(() => {
    const fetchColleges = async () => {
      const { data, error } = await supabase.from('colleges').select('id, name');
      if (error) {
        console.error("Error fetching colleges:", error);
      } else {
        setColleges(data);
      }
    };

    fetchColleges();
  }, []);

  useEffect(() => {
    const fetchSelectedColleges = async () => {
      if (!initialFormData || !initialFormData.id) {
        console.warn("Skipping fetchSelectedColleges: No initialFormData or job_id");
        return;
      }

      const { data, error } = await supabase
        .from('job_college_targets')
        .select('*')
        .eq('job_id', initialFormData.id);

      if (error) {
        console.error("Error fetching selected colleges:", error);
      } else {
        // console.log("Fetched selected colleges:", data);
        const collegeIds = data.map((college) => college.college_id);
        setSelectedColleges(collegeIds);
        console.log("Selected colleges:", collegeIds);
      }
    };

    fetchSelectedColleges();
  }, [initialFormData]);

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
        // Update job
        const { error } = await supabase
          .from('jobs')
          .update(jobData)
          .eq('id', initialFormData.id);

        if (error) throw error;
        jobId = initialFormData.id;
      } else {
        // Create new job
        jobData.created_at = new Date();
        const { data,error } = await supabase.from('jobs').insert([jobData]);
        
        if (error) throw error;
        jobId = data[0].id;
      }
      console.log('Job ID:', jobId);
      
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
          {error && (
            <div className="alert alert-error mb-6">
              <Info size={16} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Job Title */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Job Title</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g. Software Engineer Intern"
                  className="input input-bordered w-full"
                  required
                />
              </div>

              {/* Company Name */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Company Name</span>
                </label>
                <input
                  type="text"
                  name="company_name"
                  value={formData.company_name}
                  onChange={handleInputChange}
                  placeholder="Your company name"
                  className="input input-bordered w-full"
                  required
                />
              </div>

              {/* Position */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Position</span>
                </label>
                <input
                  type="text"
                  name="position"
                  value={formData.position}
                  onChange={handleInputChange}
                  placeholder="e.g. Junior Developer"
                  className="input input-bordered w-full"
                  required
                />
              </div>

              {/* Location */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Location</span>
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="e.g. Remote, Bangalore, etc."
                  className="input input-bordered w-full"
                  required
                />
              </div>

              {/* Job Type */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Job Type</span>
                </label>
                <select
                  name="job_type"
                  value={formData.job_type}
                  onChange={handleInputChange}
                  className="select select-bordered w-full"
                  required
                >
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Internship">Internship</option>
                  <option value="Contract">Contract</option>
                  <option value="Freelance">Freelance</option>
                </select>
              </div>

              {/* Min CGPA */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Minimum CGPA Required</span>
                </label>
                <input
                  type="number"
                  name="min_cgpa"
                  value={formData.min_cgpa}
                  onChange={handleInputChange}
                  placeholder="e.g. 7.5"
                  step="0.1"
                  min="0"
                  max="10"
                  className="input input-bordered w-full"
                  required
                />
              </div>

              {/* Stipend */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Stipend/Salary</span>
                </label>
                <input
                  type="text"
                  name="stipend"
                  value={formData.stipend}
                  onChange={handleInputChange}
                  placeholder="e.g. ₹20,000/month"
                  className="input input-bordered w-full"
                  required
                />
              </div>

              {/* Application Deadline */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Application Deadline</span>
                </label>
                <div className="input-group">
                  <input
                    type="datetime-local"
                    name="application_deadline"
                    value={formData.application_deadline ? formData.application_deadline.slice(0,16) : ''}
                    onChange={handleInputChange}
                    className="input input-bordered w-full"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="form-control mt-6">
              <label className="label">
                <span className="label-text">Job Description</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Detailed description of the job role and responsibilities"
                className="textarea textarea-bordered h-32"
                required
              ></textarea>
            </div>

            {/* Requirements */}
            <div className="form-control mt-6">
              <label className="label">
                <span className="label-text">Requirements</span>
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {requirements.map((req, index) => (
                  <div key={index} className="badge badge-primary gap-2">
                    <span>{req}</span>
                    <button
                      type="button"
                      onClick={() => removeRequirement(index)}
                      className="btn btn-ghost btn-xs p-0"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
              <div className="input-group">
                <input
                  type="text"
                  value={newRequirement}
                  onChange={(e) => setNewRequirement(e.target.value)}
                  placeholder="Add a requirement (e.g. JavaScript, 3 years experience, etc.)"
                  className="input input-bordered w-full"
                />
                <button
                  type="button"
                  onClick={addRequirement}
                  className="btn btn-square"
                >
                  <Plus size={18} />
                </button>
              </div>
            </div>

            {/* Eligibility Criteria */}
            <div className="form-control mt-6">
              <label className="label">
                <span className="label-text">Eligibility Criteria</span>
              </label>
              <textarea
                name="eligibility_criteria"
                value={formData.eligibility_criteria}
                onChange={handleInputChange}
                placeholder="Specific eligibility criteria for applying to this position"
                className="textarea textarea-bordered h-20"
                required
              ></textarea>
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
            {/* Form Actions */}
            <div className="card-actions justify-end mt-8">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => navigate('/jobs')}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <span className="loading loading-spinner"></span>
                ) : initialFormData ? (
                  'Update Job'
                ) : (
                  'Create Job'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default JobPostingForm;