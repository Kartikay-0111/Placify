import { useState, useEffect } from 'react';
import { User, FileText, Loader } from 'lucide-react';
import AppNavbar from '@/components/AppNavbar';
import { ProfileForm } from '@/components/ProfileForm';
import { useAuth } from '@/contexts/AuthContext';
import { getTable } from '@/lib/supabase-helpers';
import { supabase } from '@/lib/supabase';

export default function Profile() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;

      try {
        setLoading(true);

        const { data, error } = await supabase .from('student_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching profile:', error.message);
        }

        setProfile(data || null);
      } catch (error) {
        console.error('Error in fetchProfile:', error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const refreshProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await getTable('student_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error refreshing profile:', error);
        return;
      }

      setProfile(data || null);
    } catch (error) {
      console.error('Error in refreshProfile:', error);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <AppNavbar />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-500">Please log in to view your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <AppNavbar />

      <main className="flex-1 pt-6 pb-12 px-4 md:px-8 lg:px-12">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-1">Your Profile</h1>
            <p className="text-gray-600">Manage your personal and professional information</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-300 shadow-md">
            <div className="border-b border-gray-300 px-4">
              <div className="flex space-x-4 h-14">
                <button
                  className={`flex items-center gap-2 px-4 py-3 rounded-t-lg ${activeTab === 'profile' ? 'bg-gray-100 font-medium' : 'text-gray-500'}`}
                  onClick={() => setActiveTab('profile')}
                >
                  <User className="h-4 w-4" />
                  <span>Profile Information</span>
                </button> 
                <button
                  className={`flex items-center gap-2 px-4 py-3 rounded-t-lg ${activeTab === 'resume' ? 'bg-gray-100 font-medium' : 'text-gray-500'}`}
                  onClick={() => setActiveTab('resume')}
                >
                  <FileText className="h-4 w-4" />
                  <span>Resume</span>
                </button>
              </div>
            </div>

            <div className="p-6">
              {activeTab === 'profile' && (
                loading ? (
                  <div className="flex justify-center py-12">
                    <Loader className="h-8 w-8 animate-spin text-blue-500 mb-4" />
                    <p className="text-gray-500">Loading profile...</p>
                  </div>
                ) : (
                  <ProfileForm
                    initialData={profile || undefined}
                    userId={user.id}
                    onSuccess={refreshProfile}
                  />
                )
              )}

              {activeTab === 'resume' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium">Resume</h3>
                    <p className="text-sm text-gray-500">Upload and manage your resume</p>
                  </div>

                  {loading ? (
                    <div className="flex justify-center py-12">
                      <Loader className="h-8 w-8 animate-spin text-blue-500 mb-4" />
                      <p className="text-gray-500">Loading resume...</p>
                    </div>
                  ) : profile?.resume_url ? (
                    <div className="bg-gray-50 p-6 rounded-lg border border-gray-300">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <FileText className="h-10 w-10 text-blue-500 mr-4" />
                          <div>
                            <p className="font-medium mb-1">Your Resume</p>
                            <p className="text-sm text-gray-500">
                              Last updated on {new Date(profile.updated_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <a
                          href={profile.resume_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          View Resume
                        </a>
                      </div>
                      <p className="mt-6 text-sm text-gray-500">
                        To update your resume, go to the Profile Information tab and use the resume upload section.
                      </p>
                    </div>
                  ) : (
                    <div className="bg-gray-50 p-6 rounded-lg border border-gray-300 text-center">
                      <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="font-medium mb-2">No Resume Uploaded</p>
                      <p className="text-sm text-gray-500 mb-6">
                        You haven't uploaded a resume yet. Upload one to apply for jobs.
                      </p>
                      <p className="text-sm text-gray-500">
                        To upload your resume, go to the Profile Information tab and use the resume upload section.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
