import { supabase } from './supabase';

/**
 * Wrapper for supabase.from() to allow querying tables
 */
export function getTable(tableName) {
  return supabase.from(tableName);
}

/**
 * Fetches a user profile by user ID and returns the data
 */
export const fetchUserProfile = async (userId, profileTable) => {
  try {
    const { data, error } = await getTable(profileTable)
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      console.error(`Error fetching ${profileTable}:`, error.message);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error(`Error in fetchUserProfile for ${profileTable}:`, error.message);
    return null;
  }
};

/**
 * Creates or updates a profile in the specified table
 */
export const upsertProfile = async (table, profile) => {
  try {
    const { data: existingProfile } = await getTable(table)
      .select('user_id')
      .eq('user_id', profile.user_id)
      .single();

    const profileData = {
      ...profile,
      updated_at: new Date().toISOString()
    };

    if (existingProfile) {
      return await getTable(table)
        .update(profileData)
        .eq('user_id', profile.user_id);
    } else {
      return await getTable(table)
        .insert({
          ...profileData,
          created_at: new Date().toISOString()
        });
    }
  } catch (error) {
    console.error(`Error in upsertProfile for ${table}:`, error.message);
    return { data: null, error };
  }
};

/**
 * Fetches jobs with proper filters and error handling
 */
export const fetchJobs = async (filters = {}) => {
  try {
    let query = getTable('jobs')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false });

    if (filters.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }

    if (filters.minCgpa) {
      query = query.lte('min_cgpa', filters.minCgpa);
    }

    if (filters.jobType) {
      query = query.eq('job_type', filters.jobType);
    }

    if (filters.location) {
      query = query.ilike('location', `%${filters.location}%`);
    }

    const { data, error } = await query;

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching jobs:', error.message);
    return { data: null, error };
  }
};

/**
 * Fetches applications with related data
 */
export const fetchApplications = async (userId, role) => {
  try {
    let query = getTable('applications')
      .select(`
        *,
        jobs (
          id,
          title,
          company_name,
          location,
          job_type
        ),
        student:student_profiles!applications_student_id_fkey (
          full_name,
          roll_number,
          branch
        )
      `)
      .order('submitted_at', { ascending: false });

    if (role === 'student') {
      query = query.eq('student_id', userId);
    } else if (role === 'company') {
      query = query.eq('jobs.company_id', userId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching applications:', error.message);
    return { data: null, error };
  }
};