import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Define types/models for the application
export const UserRoles = {
  STUDENT: 'student',
  ADMIN: 'admin',
  COMPANY: 'company'
};

// Profile functions
export async function getProfile(userId, type = 'student') {
  const table = type === 'company' ? 'company_profiles' : 'student_profiles';
  const { data, error } = await supabase
    .from(table)
    .select('*')
    .eq('user_id', userId)
    .single();
  return { data, error };
}

export async function updateProfile(userId, profileData, type = 'student') {
  const table = type === 'company' ? 'company_profiles' : 'student_profiles';
  const { data, error } = await supabase
    .from(table)
    .upsert({ 
      user_id: userId,
      ...profileData,
      updated_at: new Date().toISOString()
    });
  return { data, error };
}

// Storage functions
export async function uploadFile(file, bucket, path) {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: true
    });
  return { data, error };
}

export async function getFileUrl(bucket, path) {
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(path);
  return data.publicUrl;
}

export async function deleteFile(bucket, path) {
  const { error } = await supabase.storage
    .from(bucket)
    .remove([path]);
  return { error };
}