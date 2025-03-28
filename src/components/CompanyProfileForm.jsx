import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export default function CompanyProfileForm({ initialData, onSuccess }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(initialData?.logo_url || null);

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: initialData || {
      company_name: '',
      industry: '',
      location: '',
      website: '',
      description: ''
    }
  });

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert("File too large. Logo should be less than 5MB");
      return;
    }
    setLogoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setLogoPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const uploadLogo = async (userId) => {
    if (!logoFile) return null;
    const fileExt = logoFile.name.split('.').pop();
    const filePath = `${userId}-${Date.now()}.${fileExt}`;
    try {
      const { data, error } = await supabase.storage.from('company_logos').upload(filePath, logoFile, { upsert: true });
      if (error) throw error;
      return supabase.storage.from('company_logos').getPublicUrl(filePath).data.publicUrl;
    } catch (error) {
      alert("Error uploading logo: " + error.message);
      return null;
    }
  };

  const saveProfile = async (formData) => {
    if (!user) return;
    setLoading(true);
    try {
      let logoUrl = initialData?.logo_url || null;
      if (logoFile) logoUrl = await uploadLogo(user.id);
      const profileData = { ...formData, logo_url: logoUrl, user_id: user.id, updated_at: new Date().toISOString() };
      const { data: existingProfile } = await supabase.from('company_profiles').select('user_id').eq('user_id', user.id).single();
      let result = existingProfile
        ? await supabase.from('company_profiles').update(profileData).eq('user_id', user.id)
        : await supabase.from('company_profiles').insert({ ...profileData, created_at: new Date().toISOString() });
      if (result.error) throw result.error;
      alert("Profile saved successfully");
      if (onSuccess) onSuccess();
    } catch (error) {
      alert("Error saving profile: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(saveProfile)} className="space-y-6">
      <div className="space-y-4">
        <label className="block">Company Name</label>
        <input className="border p-2 w-full" {...register('company_name', { required: "Company name is required" })} />
        {errors.company_name && <p className="text-red-500 text-sm">{errors.company_name.message}</p>}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block">Industry</label>
          <input className="border p-2 w-full" {...register('industry', { required: "Industry is required" })} />
          {errors.industry && <p className="text-red-500 text-sm">{errors.industry.message}</p>}
        </div>
        <div>
          <label className="block">Location</label>
          <input className="border p-2 w-full" {...register('location', { required: "Location is required" })} />
          {errors.location && <p className="text-red-500 text-sm">{errors.location.message}</p>}
        </div>
      </div>
      
      <div>
        <label className="block">Website</label>
        <input className="border p-2 w-full" {...register('website')} />
      </div>
      
      <div>
        <label className="block">Company Description</label>
        <textarea className="border p-2 w-full h-24" {...register('description', { required: "Description is required" })}></textarea>
        {errors.description && <p className="text-red-500 text-sm">{errors.description.message}</p>}
      </div>
      
      <div>
        <label className="block">Company Logo</label>
        {logoPreview && <img src={logoPreview} alt="Logo preview" className="w-24 h-24 border rounded" />}
        <input type="file" accept="image/*" onChange={handleLogoChange} className="block mt-2" />
      </div>
      
      <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded" disabled={loading}>
        {loading ? 'Saving...' : 'Save Company Profile'}
      </button>
    </form>
  );
}