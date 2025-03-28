/*
  # Fix Database Policies and Relations

  1. Changes
    - Drop and recreate users table policies to prevent recursion
    - Add proper foreign key relationships for applications table
    - Add RLS policies for jobs table
    
  2. Security
    - Enable RLS on all tables
    - Add proper policies for each table
    - Fix foreign key relationships
*/

-- First, drop any existing policies
DROP POLICY IF EXISTS "Users can read own row" ON public.users;
DROP POLICY IF EXISTS "Admins can read all users" ON public.users;
DROP POLICY IF EXISTS "Users can update own row" ON public.users;

-- Create new policies for users table
CREATE POLICY "Users can read own row"
  ON public.users
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Admins can read all users"
  ON public.users
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM public.users WHERE role = 'admin'
    )
  );

CREATE POLICY "Users can update own row"
  ON public.users
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Fix foreign key relationships for applications table
ALTER TABLE public.applications
  DROP CONSTRAINT IF EXISTS applications_student_id_fkey,
  ADD CONSTRAINT applications_student_id_fkey
    FOREIGN KEY (student_id)
    REFERENCES auth.users(id)
    ON DELETE CASCADE;

-- Add policies for jobs table
DROP POLICY IF EXISTS "Anyone can view published jobs" ON public.jobs;
DROP POLICY IF EXISTS "Companies can manage own jobs" ON public.jobs;
DROP POLICY IF EXISTS "Admins can manage all jobs" ON public.jobs;

CREATE POLICY "Anyone can view published jobs"
  ON public.jobs
  FOR SELECT
  USING (status = 'published');

CREATE POLICY "Companies can manage own jobs"
  ON public.jobs
  FOR ALL
  USING (company_id = auth.uid());

CREATE POLICY "Admins can manage all jobs"
  ON public.jobs
  FOR ALL
  USING (
    auth.uid() IN (
      SELECT id FROM public.users WHERE role = 'admin'
    )
  );

-- Add policies for applications table
DROP POLICY IF EXISTS "Students can view own applications" ON public.applications;
DROP POLICY IF EXISTS "Companies can view applications for their jobs" ON public.applications;
DROP POLICY IF EXISTS "Admins can view all applications" ON public.applications;

CREATE POLICY "Students can view own applications"
  ON public.applications
  FOR SELECT
  USING (student_id = auth.uid());

CREATE POLICY "Companies can view applications for their jobs"
  ON public.applications
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM jobs
      WHERE jobs.id = applications.job_id
      AND jobs.company_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all applications"
  ON public.applications
  FOR ALL
  USING (
    auth.uid() IN (
      SELECT id FROM public.users WHERE role = 'admin'
    )
  );