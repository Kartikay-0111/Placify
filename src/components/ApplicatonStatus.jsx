export default function ApplicationStatus({ status, className }) {
    const statusClasses = {
      pending: "bg-yellow-50 text-yellow-700 border border-yellow-200",
      cell_approved: "bg-blue-50 text-blue-700 border border-blue-200",
      cell_rejected: "bg-red-50 text-red-700 border border-red-200",
      company_approved: "bg-green-50 text-green-700 border border-green-200",
      company_rejected: "bg-gray-50 text-gray-700 border border-gray-200",
      default: "bg-gray-100 text-gray-700 border border-gray-300",
    };
  
    return (
      <span className={`px-2 py-1 text-sm font-medium rounded ${statusClasses[status] || statusClasses.default} ${className}`}>
        {status.replace('_', ' ')}
      </span>
    );
  }
  