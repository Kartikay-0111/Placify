import { Link } from 'react-router-dom';
import { Briefcase, MapPin, Calendar, CheckCircle, XCircle } from 'lucide-react';
import { formatDistanceToNow, isPast } from 'date-fns';

export default function JobCard({ job, isEligible }) {
  const isDeadlinePassed = isPast(new Date(job.application_deadline));

  const renderEligibilityBadge = () => {
    if (isEligible === undefined) return null;
    return (
      <span
        className={`px-2 py-1 text-xs font-semibold rounded-md flex items-center gap-1 ${
          isEligible ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}
      >
        {isEligible ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
        {isEligible ? 'Eligible' : 'Not Eligible'}
      </span>
    );
  };

  return (
    <div className="border rounded-lg shadow-sm hover:shadow-md transition overflow-hidden">
      <div className="p-6">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-lg">{job.title}</h3>
          <span
            className={`px-2 py-1 text-xs font-semibold rounded-md ${
              job.status === 'closed'
                ? 'bg-gray-100 text-gray-700'
                : isDeadlinePassed
                ? 'bg-gray-100 text-gray-700'
                : 'bg-green-100 text-green-700'
            }`}
          >
            {job.status === 'closed' ? 'Closed' : isDeadlinePassed ? 'Deadline Passed' : 'Active'}
          </span>
        </div>

        <div className="text-sm text-gray-600 flex items-center gap-1">
          <Briefcase className="h-4 w-4" />
          <span>{job.company_name}</span>
        </div>

        <div className="text-sm text-gray-600 flex items-center gap-1 mt-1">
          <MapPin className="h-4 w-4" />
          <span>{job.location}</span>
        </div>

        <div className="my-4 flex flex-wrap gap-2">
          <span className="px-2 py-1 text-xs font-semibold rounded-md bg-gray-100 text-gray-700">
            {job.job_type}
          </span>
          <span className="px-2 py-1 text-xs font-semibold rounded-md bg-gray-100 text-gray-700">
            Min CGPA: {job.min_cgpa}
          </span>
          {renderEligibilityBadge()}
        </div>

        <div className="text-sm text-gray-600 flex items-start gap-1">
          <Calendar className="h-4 w-4 mt-0.5" />
          <span>
            Apply by {isDeadlinePassed ? (
              <span className="text-red-600">Deadline passed</span>
            ) : (
              formatDistanceToNow(new Date(job.application_deadline), { addSuffix: true })
            )}
          </span>
        </div>
      </div>
      <div className="bg-gray-100 px-6 py-3">
        <Link to={`/jobs/${job.id}`} className="block w-full">
          <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition">
            View Details
          </button>
        </Link>
      </div>
    </div>
  );
}
