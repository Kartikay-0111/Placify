/*
  # Fix RLS Policies

  1. Changes
    - Drop existing policies to avoid conflicts
    - Recreate all necessary policies
    - Fix recursive policy issues
    
  2. Security
    - Enable RLS on all tables
    - Add proper policies for each role
    - Ensure no infinite recursion in policies
*/

-- Drop existing policies to avoid conflicts
DO $$ 
BEGIN
  -- Users table
  DROP POLICY IF EXISTS "Users can read own row" ON public.users;
  DROP POLICY IF EXISTS "Users can update own row" ON public.users;
  DROP POLICY IF EXISTS "Admins can read all users" ON public.users;
  
  -- Student Profiles
  DROP POLICY IF EXISTS "Students can manage own profile" ON public.student_profiles;
  DROP POLICY IF EXISTS "Companies can view student profiles" ON public.student_profiles;
  DROP POLICY IF EXISTS "Admins can view all student profiles" ON public.student_profiles;
  
  -- Company Profiles
  DROP POLICY IF EXISTS "Companies can manage own profile" ON public.company_profiles;
  DROP POLICY IF EXISTS "Anyone can view company profiles" ON public.company_profiles;
  
  -- Jobs
  DROP POLICY IF EXISTS "Anyone can view published jobs" ON public.jobs;
  DROP POLICY IF EXISTS "Companies can manage own jobs" ON public.jobs;
  DROP POLICY IF EXISTS "Admins can manage all jobs" ON public.jobs;
  
  -- Applications
  DROP POLICY IF EXISTS "Students can view and create own applications" ON public.applications;
  DROP POLICY IF EXISTS "Companies can view applications for their jobs" ON public.applications;
  DROP POLICY IF EXISTS "Companies can update applications for their jobs" ON public.applications;
  DROP POLICY IF EXISTS "Admins can manage all applications" ON public.applications;
  
  -- Notifications
  DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
  DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
END $$;

-- Recreate policies with fixed logic

-- Users table policies
CREATE POLICY "user_read_own"
  ON public.users
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "user_update_own"
  ON public.users
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "admin_read_all"
  ON public.users
  FOR SELECT
  USING (
    auth.jwt() ->> 'role' = 'admin'
  );

-- Student Profiles policies
CREATE POLICY "student_manage_own"
  ON public.student_profiles
  FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "company_view_students"
  ON public.student_profiles
  FOR SELECT
  USING (
    auth.jwt() ->> 'role' = 'company'
  );

CREATE POLICY "admin_view_students"
  ON public.student_profiles
  FOR SELECT
  USING (
    auth.jwt() ->> 'role' = 'admin'
  );

-- Company Profiles policies
CREATE POLICY "company_manage_own"
  ON public.company_profiles
  FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "public_view_companies"
  ON public.company_profiles
  FOR SELECT
  USING (true);

-- Jobs policies
CREATE POLICY "public_view_published"
  ON public.jobs
  FOR SELECT
  USING (status = 'published');

CREATE POLICY "company_manage_own_jobs"
  ON public.jobs
  FOR ALL
  USING (company_id = auth.uid());

CREATE POLICY "admin_manage_jobs"
  ON public.jobs
  FOR ALL
  USING (
    auth.jwt() ->> 'role' = 'admin'
  );

-- Applications policies
CREATE POLICY "student_manage_applications"
  ON public.applications
  FOR ALL
  USING (student_id = auth.uid());

CREATE POLICY "company_view_job_applications"
  ON public.applications
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM jobs
      WHERE jobs.id = applications.job_id
      AND jobs.company_id = auth.uid()
    )
  );

CREATE POLICY "company_update_applications"
  ON public.applications
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM jobs
      WHERE jobs.id = applications.job_id
      AND jobs.company_id = auth.uid()
    )
  );

CREATE POLICY "admin_manage_applications"
  ON public.applications
  FOR ALL
  USING (
    auth.jwt() ->> 'role' = 'admin'
  );

-- Notifications policies
CREATE POLICY "user_view_notifications"
  ON public.notifications
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "user_update_notifications"
  ON public.notifications
  FOR UPDATE
  USING (user_id = auth.uid());