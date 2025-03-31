import { useState, useRef ,useEffect} from 'react';
import { useForm } from 'react-hook-form';
import { supabase } from '@/lib/supabase';
// import { getTable } from '@/lib/supabase-helpers';
import {
  UserCircleIcon,
} from '@heroicons/react/24/outline';

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif'];
const ACCEPTED_RESUME_TYPES = ['application/pdf'];

export function ProfileForm({ initialData = {}, userId, onSuccess }) {

  const [isUploading, setIsUploading] = useState(false);
  const [resumeFile, setResumeFile] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [resumeUrl, setResumeUrl] = useState(initialData.resume_url || null);
  const [avatarUrl, setAvatarUrl] = useState(initialData.avatar_url || null);
  const [colleges, setColleges] = useState([]);
  const [filteredColleges, setFilteredColleges] = useState([]);
  const [selectedCollege, setSelectedCollege] = useState(initialData.college_id || '');
  const [collegeName, setCollegeName] = useState('');
  const avatarInputRef = useRef(null);
  // const collegename = initialData.college_name || '';
  
  const { register, handleSubmit, setValue, watch } = useForm({
    defaultValues: {
      full_name: initialData.full_name || '',
      roll_number: initialData.roll_number || '',
      cgpa: initialData.cgpa || '',
      branch: initialData.branch || '',
      year_of_graduation: initialData.year_of_graduation || new Date().getFullYear() + 1,
      skills: initialData.skills ? initialData.skills.join(', ') : '',
      about: initialData.about || '',
      college_id: initialData.college_id || '',
    },
  });

  useEffect(() => {
    const fetchColleges = async () => {
      const { data, error } = await supabase .from('colleges').select('id, name');
      if (!error) setColleges(data);
    };
    fetchColleges();
  }, []);
  
  useEffect(() => {
    if (colleges.length > 0 && selectedCollege) {
      const college_name = colleges.filter((college) => college.id === selectedCollege);
      setCollegeName(college_name[0]?.name || '');
    }
  }, [colleges, selectedCollege]);

  const handleCollegeSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setFilteredColleges(colleges.filter(college => college.name.toLowerCase().includes(query)));
    setCollegeName(query);
  };

  const handleCollegeSelect = (college) => {
    setValue('college', college.name);
    setSelectedCollege(college.id);
    setFilteredColleges([]);
  };

  const handleResumeChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_FILE_SIZE || !ACCEPTED_RESUME_TYPES.includes(file.type)) {
      alert('Invalid file. Max size 5MB, PDF only.');
      return;
    }
    setResumeFile(file);
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_FILE_SIZE || !ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      alert('Invalid file. Max size 5MB, JPEG/PNG/GIF only.');
      return;
    }
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      setAvatarUrl(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  const uploadFile = async (file, bucket, fileType) => {
    if (!file) return null;
    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-${fileType}-${Date.now()}.${fileExt}`;
      const filePath = `${userId}/${fileName}`;
      const { error } = await supabase.storage.from(bucket).upload(filePath, file);
      if (error) throw error;
      const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
      return data.publicUrl;
    } catch (error) {
      console.error(`Error uploading ${fileType}:`, error);
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const onSubmit = async (data) => {
    setIsUploading(true);
    try {
      const [uploadedResumeUrl, uploadedAvatarUrl] = await Promise.all([
        uploadFile(resumeFile, 'resumes', 'resume'),
        uploadFile(avatarFile, 'avatars', 'avatar')
      ]);

      const { college, ...restData } = data; // Exclude 'college' from data
      const profileData = {
        ...restData,
        skills: restData.skills.split(',').map(skill => skill.trim()),
        resume_url: resumeUrl,
        avatar_url: avatarUrl,
        cgpa: parseFloat(restData.cgpa),
        college_id: selectedCollege,
        updated_at: new Date().toISOString(),
      };

      const { data: existingProfile } = await getTable('student_profiles')
        .select('user_id')
        .eq('user_id', userId)
        .single();

      if (existingProfile) {
        await getTable('student_profiles')
          .update(profileData)
          .eq('user_id', userId);
      } else {
        await getTable('student_profiles')
          .insert({
            ...profileData,
            user_id: userId,
            created_at: new Date().toISOString(),
          });
      }

      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Profile update error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="card bg-base-100">
        <div className="card-body">
          <h2 className="card-title text-2xl mb-6">
            <UserCircleIcon className="h-8 w-8 mr-2 text-primary" />
            Edit Profile
          </h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Avatar Upload */}
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text">Profile Picture</span>
              </label>
              <div className="flex items-center space-x-4">
                <div className="avatar">
                  <div className="w-24 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                    <img
                      src={avatarUrl || '/default-avatar.png'}
                      alt="Profile"
                      className="object-cover"
                    />
                  </div>
                </div>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/gif"
                  ref={avatarInputRef}
                  onChange={handleAvatarChange}
                  className="file-input file-input-bordered file-input-primary w-full max-w-xs"
                />
              </div>
            </div>

            {/* Personal Information Section */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Full Name</span>
                </label>
                <input
                  {...register('full_name')}
                  placeholder="Full Name"
                  className="input input-bordered w-full"
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">College</span>
                </label>
                <input
                  value={collegeName}
                  {...register('college_id')}
                  placeholder="Search College"
                  className="input input-bordered w-full"
                  onChange={handleCollegeSearch}
                />
                {filteredColleges.length > 0 && (
                  <ul className="dropdown-menu w-full bg-base-200 shadow-md mt-2 rounded-md">
                    {filteredColleges.map(college => (
                      <li
                        key={college.id}
                        className="p-2 cursor-pointer hover:bg-base-300"
                        onClick={() => handleCollegeSelect(college)}
                      >
                        {college.name}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Roll Number</span>
                </label>
                <input
                  {...register('roll_number')}
                  placeholder="Roll Number"
                  className="input input-bordered w-full"
                />
              </div>
            </div>

            {/* Academic Information */}
            <div className="grid md:grid-cols-3 gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">CGPA</span>
                </label>
                <input
                  {...register('cgpa')}
                  type="number"
                  step="0.01"
                  placeholder="CGPA"
                  className="input input-bordered w-full"
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Branch</span>
                </label>
                <input
                  {...register('branch')}
                  placeholder="Branch"
                  className="input input-bordered w-full"
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Graduation Year</span>
                </label>
                <input
                  {...register('year_of_graduation')}
                  type="number"
                  placeholder="Year of Graduation"
                  className="input input-bordered w-full"
                />
              </div>
            </div>

            {/* Professional Information */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Skills</span>
              </label>
              <input
                {...register('skills')}
                placeholder="Skills (comma separated)"
                className="input input-bordered w-full"
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">About</span>
              </label>
              <textarea
                {...register('about')}
                placeholder="Tell us about yourself"
                className="textarea textarea-bordered h-24"
              />
            </div>

            {/* Resume Upload */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Resume (PDF)</span>
              </label>
              <input
                type="file"
                accept=".pdf"
                onChange={handleResumeChange}
                className="file-input file-input-bordered file-input-primary w-full"
              />
              {resumeUrl && (
                <a
                  href={resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link link-primary mt-2"
                >
                  View Current Resume
                </a>
              )}
            </div>

            {/* Submit Button */}
            <div className="form-control mt-6">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isUploading}
              >
                {isUploading ? (
                  <span className="loading loading-spinner"></span>
                ) : (
                  'Save Profile'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}