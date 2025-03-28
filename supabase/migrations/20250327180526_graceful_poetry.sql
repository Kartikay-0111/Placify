/*
  # Fix Users Table RLS Policies

  1. Changes
    - Drop existing policies causing recursion
    - Add new, simplified RLS policies for users table
    
  2. Security
    - Enable RLS on users table
    - Add policy for users to read their own data
    - Add policy for admins to read all users
*/

-- First, drop any existing policies on the users table
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Users can view their own data" ON public.users;

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Add new, simplified policies
CREATE POLICY "Users can read own row"
  ON public.users
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Admins can read all users"
  ON public.users
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );

-- Add policy for users to update their own data
CREATE POLICY "Users can update own row"
  ON public.users
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);