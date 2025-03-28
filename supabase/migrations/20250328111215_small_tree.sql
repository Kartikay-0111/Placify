/*
  # Seed Data

  1. Test Data
    - Admin user
    - Sample students
    - Sample companies
    - Job listings
    - Applications
*/

-- Insert test users (passwords will be managed through Supabase Auth UI)
INSERT INTO public.users (id, email, role) VALUES
  ('d7bed82f-5cb3-4d24-b7aa-6431c5c9a1e4', 'admin@example.com', 'admin'),
  ('e9be4f47-9d1c-4e51-a3c6-c52fb0010a8d', 'student1@example.com', 'student'),
  ('f6d8a56e-2c93-4a7d-a26f-c12e3c91a2e9', 'student2@example.com', 'student'),
  ('c4b8d23a-1f5e-4c19-8b56-a9f8d2e9c1b7', 'company1@example.com', 'company'),
  ('b3a7c12d-4e8f-4b2a-9c5d-8e7f6a9b1c2d', 'company2@example.com', 'company')
ON CONFLICT (id) DO NOTHING;

-- Insert student profiles
INSERT INTO public.student_profiles (user_id, full_name, roll_number, branch, year_of_graduation, skills, cgpa, about) VALUES
  ('e9be4f47-9d1c-4e51-a3c6-c52fb0010a8d', 'John Doe', 'CS2021001', 'Computer Science', 2024, ARRAY['JavaScript', 'React', 'Node.js'], 8.5, 'Passionate about web development'),
  ('f6d8a56e-2c93-4a7d-a26f-c12e3c91a2e9', 'Jane Smith', 'CS2021002', 'Computer Science', 2024, ARRAY['Python', 'Machine Learning', 'Data Science'], 9.0, 'AI/ML enthusiast')
ON CONFLICT (user_id) DO NOTHING;

-- Insert company profiles
INSERT INTO public.company_profiles (user_id, company_name, industry, location, website, description) VALUES
  ('c4b8d23a-1f5e-4c19-8b56-a9f8d2e9c1b7', 'Tech Corp', 'Technology', 'New York', 'https://techcorp.example.com', 'Leading technology company'),
  ('b3a7c12d-4e8f-4b2a-9c5d-8e7f6a9b1c2d', 'Data Systems', 'Technology', 'San Francisco', 'https://datasystems.example.com', 'Data analytics company')
ON CONFLICT (user_id) DO NOTHING;

-- Insert jobs
INSERT INTO public.jobs (
  title, company_name, company_id, position, location, job_type,
  description, requirements, min_cgpa, stipend, eligibility_criteria,
  application_deadline, status
) VALUES
  (
    'Frontend Developer',
    'Tech Corp',
    'c4b8d23a-1f5e-4c19-8b56-a9f8d2e9c1b7',
    'Software Engineer',
    'New York',
    'Full-time',
    'Looking for a frontend developer with React experience',
    ARRAY['React', 'JavaScript', 'HTML/CSS'],
    7.5,
    '$5000/month',
    'Computer Science students only',
    NOW() + INTERVAL '30 days',
    'published'
  ),
  (
    'Data Scientist',
    'Data Systems',
    'b3a7c12d-4e8f-4b2a-9c5d-8e7f6a9b1c2d',
    'Data Scientist',
    'San Francisco',
    'Full-time',
    'Looking for a data scientist with ML experience',
    ARRAY['Python', 'Machine Learning', 'SQL'],
    8.0,
    '$6000/month',
    'Must have ML experience',
    NOW() + INTERVAL '45 days',
    'published'
  )
ON CONFLICT DO NOTHING;

-- Insert sample applications
INSERT INTO public.applications (
  student_id, job_id, status, placement_cell_notes, company_notes
) 
SELECT 
  'e9be4f47-9d1c-4e51-a3c6-c52fb0010a8d',
  id,
  'pending',
  'Good candidate',
  NULL
FROM public.jobs 
WHERE company_name = 'Tech Corp'
ON CONFLICT DO NOTHING;

INSERT INTO public.applications (
  student_id, job_id, status, placement_cell_notes, company_notes
)
SELECT 
  'f6d8a56e-2c93-4a7d-a26f-c12e3c91a2e9',
  id,
  'pending',
  'Excellent profile',
  NULL
FROM public.jobs 
WHERE company_name = 'Data Systems'
ON CONFLICT DO NOTHING;

-- Insert notifications
INSERT INTO public.notifications (user_id, message, type) VALUES
  ('e9be4f47-9d1c-4e51-a3c6-c52fb0010a8d', 'New job posting from Tech Corp', 'job'),
  ('f6d8a56e-2c93-4a7d-a26f-c12e3c91a2e9', 'New job posting from Data Systems', 'job')
ON CONFLICT DO NOTHING;