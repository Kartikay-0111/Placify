import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export default function JobPostingForm({ initialData, onSuccess }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [requirement, setRequirement] = useState('');
  const [requirements, setRequirements] = useState(initialData?.requirements || []);

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: initialData || {
      title: '', position: '', company_name: '', location: '', job_type: 'Full-time',
      description: '', stipend: '', min_cgpa: 7.0, application_deadline: '', status: 'Draft',
      eligibility_criteria: ''
    }
  });

  const addRequirement = () => {
    if (requirement.trim() === '') return;
    setRequirements([...requirements, requirement.trim()]);
    setRequirement('');
  };

  const removeRequirement = (index) => {
    setRequirements(requirements.filter((_, i) => i !== index));
  };

  const saveJob = async (formData) => {
    if (!user) return;
    setLoading(true);
    try {
      const jobData = { ...formData, requirements, company_id: user.id, updated_at: new Date().toISOString() };
      let result = initialData?.id 
        ? await supabase.from('jobs').update(jobData).eq('id', initialData.id) 
        : await supabase.from('jobs').insert({ ...jobData, created_at: new Date().toISOString() });
      if (result.error) throw result.error;
      onSuccess();
    } catch (error) {
      console.error('Error saving job:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(saveJob)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label>Job Title</label>
          <input type="text" {...register('title', { required: 'Job title is required' })} className="border p-2 w-full" />
          {errors.title && <p className="text-red-500 text-sm">{errors.title.message}</p>}
        </div>
        <div>
          <label>Company Name</label>
          <input type="text" {...register('company_name', { required: 'Company name is required' })} className="border p-2 w-full" />
          {errors.company_name && <p className="text-red-500 text-sm">{errors.company_name.message}</p>}
        </div>
      </div>
      
      <div>
        <label>Requirements</label>
        <div className="flex gap-2 flex-wrap">
          {requirements.map((req, index) => (
            <span key={index} className="px-3 py-1 bg-gray-200 rounded flex items-center">
              {req} <button type="button" onClick={() => removeRequirement(index)} className="ml-2 text-red-500">x</button>
            </span>
          ))}
        </div>
        <div className="flex gap-2 mt-2">
          <input type="text" value={requirement} onChange={(e) => setRequirement(e.target.value)} 
            className="border p-2 w-full" placeholder="Add requirement" />
          <button type="button" onClick={addRequirement} className="bg-blue-500 text-white px-4 py-2">+</button>
        </div>
      </div>
      
      <div className="flex justify-end space-x-2">
        <button type="button" onClick={onSuccess} className="border px-4 py-2">Cancel</button>
        <button type="submit" disabled={loading} className="bg-blue-500 text-white px-4 py-2">
          {loading ? 'Saving...' : initialData?.id ? 'Update Job' : 'Create Job'}
        </button>
      </div>
    </form>
  );
}
