/*
  # Security Policies Setup

  1. Policies
    - User access control
    - Profile management
    - Job visibility and management
    - Application handling
    - Notification management

  2. Changes
    - Add RLS policies for all tables
    - Fix recursive policy issues
    - Implement proper role-based access
*/

-- Users table policies
CREATE POLICY "Users can read own row"
  ON public.users
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own row"
  ON public.users
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can read all users"
  ON public.users
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.uid() = auth.users.id
      AND (auth.users.raw_user_meta_data->>'role')::text = 'admin'
    )
  );

-- Student Profiles policies
CREATE POLICY "Students can manage own profile"
  ON public.student_profiles
  FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Companies can view student profiles"
  ON public.student_profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.uid() = auth.users.id
      AND (auth.users.raw_user_meta_data->>'role')::text = 'company'
    )
  );

CREATE POLICY "Admins can view all student profiles"
  ON public.student_profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.uid() = auth.users.id
      AND (auth.users.raw_user_meta_data->>'role')::text = 'admin'
    )
  );

-- Company Profiles policies
CREATE POLICY "Companies can manage own profile"
  ON public.company_profiles
  FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view company profiles"
  ON public.company_profiles
  FOR SELECT
  USING (true);

-- Jobs policies
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
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.uid() = auth.users.id
      AND (auth.users.raw_user_meta_data->>'role')::text = 'admin'
    )
  );

-- Applications policies
CREATE POLICY "Students can view and create own applications"
  ON public.applications
  FOR ALL
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

CREATE POLICY "Companies can update applications for their jobs"
  ON public.applications
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM jobs
      WHERE jobs.id = applications.job_id
      AND jobs.company_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all applications"
  ON public.applications
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.uid() = auth.users.id
      AND (auth.users.raw_user_meta_data->>'role')::text = 'admin'
    )
  );

-- Notifications policies
CREATE POLICY "Users can view own notifications"
  ON public.notifications
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications"
  ON public.notifications
  FOR UPDATE
  USING (user_id = auth.uid());