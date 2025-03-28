import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { supabase } from '@/lib/supabase';
import { getTable } from '@/lib/supabase-helpers';

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_FILE_TYPES = ['application/pdf'];

export function ProfileForm({ initialData = {}, userId, onSuccess }) {
  const [isUploading, setIsUploading] = useState(false);
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeUrl, setResumeUrl] = useState(initialData.resume_url || null);
  
  const { register, handleSubmit, setValue, watch } = useForm({
    defaultValues: {
      full_name: initialData.full_name || '',
      roll_number: initialData.roll_number || '',
      cgpa: initialData.cgpa || 0,
      branch: initialData.branch || '',
      year_of_graduation: initialData.year_of_graduation || new Date().getFullYear() + 1,
      skills: initialData.skills ? initialData.skills.join(', ') : '',
      about: initialData.about || '',
    },
  });

  const handleResumeChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_FILE_SIZE || !ACCEPTED_FILE_TYPES.includes(file.type)) return;
    setResumeFile(file);
  };

  const uploadResume = async () => {
    if (!resumeFile) return resumeUrl;
    setIsUploading(true);
    try {
      const fileExt = resumeFile.name.split('.').pop();
      const fileName = `${userId}-resume-${Date.now()}.${fileExt}`;
      const filePath = `${userId}/${fileName}`;
      const { error } = await supabase.storage.from('resumes').upload(filePath, resumeFile);
      if (error) throw error;
      const { data } = supabase.storage.from('resumes').getPublicUrl(filePath);
      return data.publicUrl;
    } catch {
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const onSubmit = async (data) => {
    const uploadedResumeUrl = await uploadResume();
    const profileData = { ...data, skills: data.skills.split(',').map(skill => skill.trim()), resume_url: uploadedResumeUrl };
    const { data: existingProfile } = await getTable('student_profiles').select('user_id').eq('user_id', userId).single();
    existingProfile
      ? await getTable('student_profiles').update(profileData).eq('user_id', userId)
      : await getTable('student_profiles').insert({ ...profileData, created_at: new Date().toISOString() });
    if (onSuccess) onSuccess();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-4 border rounded-lg">
      <h3 className="text-lg font-medium">Personal Information</h3>
      <input {...register('full_name')} placeholder="Full Name" className="border p-2 w-full" />
      <input {...register('roll_number')} placeholder="Roll Number" className="border p-2 w-full" />
      <input {...register('cgpa')} type="number" placeholder="CGPA" className="border p-2 w-full" />
      <input {...register('branch')} placeholder="Branch" className="border p-2 w-full" />
      <input {...register('year_of_graduation')} type="number" placeholder="Year of Graduation" className="border p-2 w-full" />
      
      <h3 className="text-lg font-medium">Professional Information</h3>
      <input {...register('skills')} placeholder="Skills (comma separated)" className="border p-2 w-full" />
      <textarea {...register('about')} placeholder="About" className="border p-2 w-full" />
      
      <div>
        <label className="block">Resume (PDF)</label>
        <input type="file" accept=".pdf" onChange={handleResumeChange} className="border p-2 w-full" />
        {resumeUrl && <a href={resumeUrl} target="_blank" rel="noopener noreferrer">View Resume</a>}
      </div>
      
      <button type="submit" className="bg-blue-500 text-white p-2 rounded" disabled={isUploading}>
        {isUploading ? 'Uploading...' : 'Save Profile'}
      </button>
    </form>
  );
}
