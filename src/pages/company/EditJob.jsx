import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import AppNavbar from '@/components/AppNavbar';
import JobPostingForm from '@/components/JobPostingForm';

export default function EditJob() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [job, setJob] = useState(null);

  useEffect(() => {
    const fetchJob = async () => {
      if (!id || !user) return;

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('jobs')
          .select('*')
          .eq('id', id)
          .eq('company_id', user.id)
          .single();

        if (error || !data) {
          toast({
            title: "Job not found",
            description: "This job doesn't exist or you don't have permission to edit it",
            variant: "destructive",
          });
          navigate('/company/jobs');
          return;
        }

        setJob(data);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load job details",
          variant: "destructive",
        });
        navigate('/company/jobs');
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [id, user, navigate]);

  const handleSuccess = () => {
    toast({ title: "Job updated", description: "Your job posting has been updated successfully" });
    navigate('/company/jobs');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <AppNavbar />
      
      <main className="flex-1 pt-6 pb-12 px-4 md:px-8 lg:px-12">
        <div className="max-w-4xl mx-auto bg-white p-6 shadow-md rounded-lg">
          <h1 className="text-2xl font-bold mb-2">Edit Job</h1>
          <p className="text-gray-600 mb-4">Update your job posting details.</p>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-500"></div>
                <p className="mt-4 text-gray-500">Loading job details...</p>
              </div>
            </div>
          ) : (
            <div className="border-t">
              <JobPostingForm initialFormData={job} onSuccess={handleSuccess} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
