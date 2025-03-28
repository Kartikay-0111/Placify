import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import AppNavbar from '@/components/AppNavbar';
import { toast } from '@/hooks/use-toast';

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
  const { signUp } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { register, handleSubmit, formState: { errors }, setError } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: { email: '', password: '', confirmPassword: '', role: 'student' },
  });

  const onSubmit = async (values) => {
    try {
      setIsSubmitting(true);
      const { error } = await signUp(values.email, values.password, values.role);
      
      if (error) {
        setError('root', { message: error.message || 'Registration failed.' });
        toast.error(error.message || 'Registration failed');
      } else {
        toast.success('Registration successful! You can now sign in.');
      }
    } catch (error) {
      toast.error('An unexpected error occurred.');
      setError('root', { message: 'Registration failed. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <AppNavbar />
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-lg">
          <h1 className="text-2xl font-bold text-center">Create an account</h1>
          <p className="text-gray-500 text-center mb-4">Enter your details to register</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block font-medium">Email</label>
              <input {...register('email')} type="email" className="w-full p-2 border rounded" placeholder="Enter your email" />
              <p className="text-red-500 text-sm">{errors.email?.message}</p>
            </div>

            <div>
              <label className="block font-medium">Password</label>
              <input {...register('password')} type="password" className="w-full p-2 border rounded" placeholder="Create a password" />
              <p className="text-red-500 text-sm">{errors.password?.message}</p>
            </div>

            <div>
              <label className="block font-medium">Confirm Password</label>
              <input {...register('confirmPassword')} type="password" className="w-full p-2 border rounded" placeholder="Confirm your password" />
              <p className="text-red-500 text-sm">{errors.confirmPassword?.message}</p>
            </div>

            <div>
              <label className="block font-medium">Account Type</label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input {...register('role')} type="radio" value="student" className="mr-2" /> Student
                </label>
                <label className="flex items-center">
                  <input {...register('role')} type="radio" value="admin" className="mr-2" /> Admin
                </label>
                <label className="flex items-center">
                  <input {...register('role')} type="radio" value="company" className="mr-2" /> Company
                </label>
              </div>
              <p className="text-red-500 text-sm">{errors.role?.message}</p>
            </div>

            {errors.root && <p className="text-red-500 text-sm">{errors.root.message}</p>}

            <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:bg-gray-400" disabled={isSubmitting}>
              {isSubmitting ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm mt-4">
            Already have an account? <Link to="/login" className="text-blue-600 hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}