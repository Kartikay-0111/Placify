/*
  # Initial Schema Setup

  1. Tables
    - users (core user data)
    - student_profiles (student information)
    - company_profiles (company information)
    - jobs (job listings)
    - applications (job applications)
    - notifications (user notifications)

  2. Security
    - Enable RLS on all tables
    - Set up proper policies for each role
    - Add necessary constraints
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS public.users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  role text NOT NULL CHECK (role IN ('student', 'admin', 'company')),
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Student Profiles
CREATE TABLE IF NOT EXISTS public.student_profiles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  roll_number text,
  branch text,
  year_of_graduation integer,
  skills text[],
  cgpa numeric(3,2),
  about text,
  resume_url text,
  avatar_url text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.student_profiles ENABLE ROW LEVEL SECURITY;

-- Company Profiles
CREATE TABLE IF NOT EXISTS public.company_profiles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name text,
  industry text,
  location text,
  website text,
  description text,
  logo_url text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.company_profiles ENABLE ROW LEVEL SECURITY;

-- Jobs
CREATE TABLE IF NOT EXISTS public.jobs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  company_name text NOT NULL,
  company_id uuid REFERENCES auth.users(id),
  position text,
  location text NOT NULL,
  job_type text NOT NULL,
  description text NOT NULL,
  requirements text[],
  min_cgpa numeric(3,2) NOT NULL,
  stipend text NOT NULL,
  eligibility_criteria text,
  application_deadline timestamptz NOT NULL,
  status text NOT NULL CHECK (status IN ('draft', 'published', 'closed')),
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

-- Applications
CREATE TABLE IF NOT EXISTS public.applications (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  job_id uuid NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  status text NOT NULL CHECK (status IN ('pending', 'cell_approved', 'cell_rejected', 'company_approved', 'company_rejected')),
  submitted_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  placement_cell_notes text,
  company_notes text,
  UNIQUE(student_id, job_id)
);

ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

-- Notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message text NOT NULL,
  type text NOT NULL CHECK (type IN ('job', 'application', 'interview', 'offer', 'general')),
  read boolean DEFAULT false NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;