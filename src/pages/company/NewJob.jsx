import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import AppNavbar from '@/components/AppNavbar';
import JobPostingForm from '@/components/JobPostingForm';

export default function NewJob() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSuccess = () => {
    toast({ title: "Job created", description: "Your job posting has been created successfully" });
    navigate('/company/jobs');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <AppNavbar />
      <main className="flex-1 pt-6 pb-12 px-4 md:px-8 lg:px-12">
        <div className="max-w-4xl mx-auto bg-white p-6 shadow-md rounded-lg">
          <h1 className="text-2xl font-bold mb-2">Post a New Job</h1>
          <p className="text-gray-600 mb-4">Create a new job opportunity for students.</p>

          <div className="border-t">
            <JobPostingForm onSuccess={handleSuccess} />
          </div>
        </div>
      </main>
    </div>
  );
}
