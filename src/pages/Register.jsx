import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const formSchema = z
  .object({
    email: z.string().email({ message: 'Please enter a valid email address.' }),
    password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
    confirmPassword: z.string(),
    role: z.enum(['student', 'admin', 'company'], { required_error: 'Please select a role' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  });

export default function Register() {
  const { register, handleSubmit, formState: { errors }, setError } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: { email: '', password: '', confirmPassword: '', role: 'student' },
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const onSubmit = async (values) => {
    try {
      setIsSubmitting(true);
      console.log('Registering:', values.email, 'Role:', values.role);
      
      // Simulated API call
      const error = null; // Replace with actual API response error handling
      
      if (error) {
        setError('root', { message: 'Registration failed. Please try again.' });
      } else {
        alert('Registration successful!'); // Replace with toast notification
        navigate('/login');
      }
    } catch (error) {
      setError('root', { message: 'An unexpected error occurred. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center mb-4">Create an Account</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block font-medium">Email</label>
            <input {...register('email')} type="email" className="w-full border p-2 rounded" />
            <p className="text-red-500 text-sm">{errors.email?.message}</p>
          </div>
          
          <div>
            <label className="block font-medium">Password</label>
            <input {...register('password')} type="password" className="w-full border p-2 rounded" />
            <p className="text-red-500 text-sm">{errors.password?.message}</p>
          </div>
          
          <div>
            <label className="block font-medium">Confirm Password</label>
            <input {...register('confirmPassword')} type="password" className="w-full border p-2 rounded" />
            <p className="text-red-500 text-sm">{errors.confirmPassword?.message}</p>
          </div>
          
          <div>
            <label className="block font-medium">Account Type</label>
            <select {...register('role')} className="w-full border p-2 rounded">
              <option value="student">Student</option>
              <option value="admin">Placement Cell</option>
              <option value="company">Company</option>
            </select>
            <p className="text-red-500 text-sm">{errors.role?.message}</p>
          </div>
          
          {errors.root && <p className="text-red-500 text-sm">{errors.root.message}</p>}
          
          <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded disabled:opacity-50" disabled={isSubmitting}>
            {isSubmitting ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
        <p className="text-center text-sm mt-4">
          Already have an account? <Link to="/login" className="text-blue-500">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
