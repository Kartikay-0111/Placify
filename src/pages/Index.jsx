import React from "react"
import {
  Users,
  Briefcase,
  CheckCircle,
  ArrowRight,
  Building,
  GraduationCap,
  FileCheck,
  Calendar,
  Award,
  ChevronDown,
  ChevronUp,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
} from "lucide-react"
import {Link} from 'react-router-dom'
import AppNavbar from "@/components/AppNavbar"
// import img from "next/img"

export default function LandingPage() {
  const [activeTab, setActiveTab] = React.useState(1)
  const [activeFaq, setActiveFaq] = React.useState(null)

  const toggleFaq = (index) => {
    if (activeFaq === index) {
      setActiveFaq(null)
    } else {
      setActiveFaq(index)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <header className="sticky top-0 z-50 bg-white shadow-sm">
        <div className="container mx-auto">
            <AppNavbar />
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-white to-primary/5 py-16 md:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6" >
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                  Unlock Your <span className="text-primary">Career Potential</span>
                </h1>
                <p className="text-lg md:text-xl text-gray-600 max-w-lg">
                  Empowering students with transformative career opportunities, strategic networking, and professional
                  development resources.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    to="/register"
                    className="inline-flex justify-center items-center px-6 py-3 text-base font-medium text-white bg-primary border border-transparent rounded-md shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Get Started
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                  <Link
                    to="/jobs"
                    className="inline-flex justify-center items-center px-6 py-3 text-base font-medium text-primary bg-white border border-primary rounded-md hover:bg-primary/5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Browse Jobs
                  </Link>
                </div>
              </div>
              <div className="flex justify-center">
                <img
                  src="undraw_career-progress.png"
                  alt="Career Growth Illustration"
                  width={500}
                  height={400}
                  className="rounded-lg shadow-lg hover:scale-110 transition-transform duration-300"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Statistics Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-primary/5 rounded-lg p-8 text-center shadow-sm hover:shadow-md transition-shadow duration-300">
                <div className="flex justify-center mb-4">
                  <Building className="h-12 w-12 text-primary" />
                </div>
                <h3 className="text-4xl font-bold text-gray-900 mb-2">50+</h3>
                <p className="text-lg text-gray-600">Partner Companies</p>
              </div>
              <div className="bg-primary/5 rounded-lg p-8 text-center shadow-sm hover:shadow-md transition-shadow duration-300">
                <div className="flex justify-center mb-4">
                  <Briefcase className="h-12 w-12 text-primary" />
                </div>
                <h3 className="text-4xl font-bold text-gray-900 mb-2">120+</h3>
                <p className="text-lg text-gray-600">Available Positions</p>
              </div>
              <div className="bg-primary/5 rounded-lg p-8 text-center shadow-sm hover:shadow-md transition-shadow duration-300">
                <div className="flex justify-center mb-4">
                  <Award className="h-12 w-12 text-primary" />
                </div>
                <h3 className="text-4xl font-bold text-gray-900 mb-2">85%</h3>
                <p className="text-lg text-gray-600">Placement Rate</p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-16 bg-primary/5">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">How Placify Works</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Our streamlined process connects students, colleges, and companies for a seamless placement experience.
              </p>
            </div>

            <div className="flex justify-center mb-8">
              <div className="inline-flex rounded-md shadow-sm" role="group">
                <button
                  type="button"
                  className={`px-4 py-2 text-sm font-medium rounded-l-lg ${
                    activeTab === 1 ? "bg-primary text-white" : "bg-white text-gray-700 hover:bg-primary/5"
                  }`}
                  onClick={() => setActiveTab(1)}
                >
                  For Students
                </button>
                <button
                  type="button"
                  className={`px-4 py-2 text-sm font-medium ${
                    activeTab === 2 ? "bg-primary text-white" : "bg-white text-gray-700 hover:bg-primary/5"
                  }`}
                  onClick={() => setActiveTab(2)}
                >
                  For Companies
                </button>
                <button
                  type="button"
                  className={`px-4 py-2 text-sm font-medium rounded-r-lg ${
                    activeTab === 3 ? "bg-primary text-white" : "bg-white text-gray-700 hover:bg-primary/5"
                  }`}
                  onClick={() => setActiveTab(3)}
                >
                  For Placement Cells
                </button>
              </div>
            </div>

            {activeTab === 1 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="flex items-center mb-4">
                    <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/10 text-primary mr-4">
                      1
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">Sign Up & Complete Profile</h3>
                  </div>
                  <p className="text-gray-600">
                    Create your account and build a comprehensive profile showcasing your skills and achievements.
                  </p>
                </div>
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="flex items-center mb-4">
                    <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/10 text-primary mr-4">
                      2
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">Apply for Jobs</h3>
                  </div>
                  <p className="text-gray-600">
                    Browse and apply for positions that match your skills and career aspirations.
                  </p>
                </div>
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="flex items-center mb-4">
                    <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/10 text-primary mr-4">
                      3
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">Get Hired</h3>
                  </div>
                  <p className="text-gray-600">
                    Participate in interviews, receive and accept offers, and launch your career.
                  </p>
                </div>
              </div>
            )}

            {activeTab === 2 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="flex items-center mb-4">
                    <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/10 text-primary mr-4">
                      1
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">Register Your Company</h3>
                  </div>
                  <p className="text-gray-600">Create a company profile and get verified to access our talent pool.</p>
                </div>
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="flex items-center mb-4">
                    <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/10 text-primary mr-4">
                      2
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">Post Job Opportunities</h3>
                  </div>
                  <p className="text-gray-600">
                    List your open positions with detailed requirements and select eligible colleges.
                  </p>
                </div>
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="flex items-center mb-4">
                    <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/10 text-primary mr-4">
                      3
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">Hire Top Talent</h3>
                  </div>
                  <p className="text-gray-600">
                    Review applications, conduct interviews, and onboard the best candidates.
                  </p>
                </div>
              </div>
            )}

            {activeTab === 3 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="flex items-center mb-4">
                    <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/10 text-primary mr-4">
                      1
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">Manage Student Profiles</h3>
                  </div>
                  <p className="text-gray-600">
                    Verify and approve student profiles to ensure quality and authenticity.
                  </p>
                </div>
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="flex items-center mb-4">
                    <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/10 text-primary mr-4">
                      2
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">Review Job Listings</h3>
                  </div>
                  <p className="text-gray-600">
                    Approve job postings from companies to ensure they meet your institution's standards.
                  </p>
                </div>
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="flex items-center mb-4">
                    <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/10 text-primary mr-4">
                      3
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">Track Placement Progress</h3>
                  </div>
                  <p className="text-gray-600">
                    Monitor application statuses, interview schedules, and placement statistics.
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Key Features</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Discover how Placify streamlines the entire placement process for all stakeholders.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
                <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 text-primary mb-4">
                  <Users className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Multi-Role Authentication</h3>
                <p className="text-gray-600">
                  Secure login and signup for students, companies, and placement cell administrators with role-based
                  access.
                </p>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
                <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 text-primary mb-4">
                  <GraduationCap className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Student Profile Management</h3>
                <p className="text-gray-600">
                  Comprehensive profiles with academic records, skills, projects, and achievements for better matching.
                </p>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
                <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 text-primary mb-4">
                  <Building className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Company Dashboard</h3>
                <p className="text-gray-600">
                  Intuitive interface for posting jobs, reviewing applications, and managing the hiring process.
                </p>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
                <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 text-primary mb-4">
                  <FileCheck className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Application Tracking</h3>
                <p className="text-gray-600">
                  Real-time status updates for applications as they move through the recruitment pipeline.
                </p>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
                <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 text-primary mb-4">
                  <Calendar className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Interview Scheduling</h3>
                <p className="text-gray-600">
                  Automated scheduling tools to coordinate interviews between students and companies.
                </p>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
                <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 text-primary mb-4">
                  <CheckCircle className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Offer Management</h3>
                <p className="text-gray-600">
                  Digital offer letters with acceptance tracking and placement confirmation.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-16 bg-primary/5">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">What Our Users Say</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Hear from students, companies, and placement cells who have transformed their recruitment process with
                Placify.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white rounded-lg p-8 shadow-sm">
                <div className="flex items-center mb-4">
                  <div className="h-12 w-12 rounded-full bg-gray-200 mr-4 overflow-hidden">
                    <img src="female-avatar.png" alt="Student Avatar" width={48} height={48} />
                  </div>
                  <div>
                    <h4 className="text-lg font-medium text-gray-900">Priya Sharma</h4>
                    <p className="text-sm text-gray-600">Computer Science Student</p>
                  </div>
                </div>
                <p className="text-gray-600 italic">
                  "Placify made my job search incredibly easy. I could track all my applications in one place and landed
                  my dream job at a top tech company!"
                </p>
                <div className="flex mt-4 text-yellow-400">
                  <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                  </svg>
                  <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                  </svg>
                  <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                  </svg>
                  <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                  </svg>
                  <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                  </svg>
                </div>
              </div>

              <div className="bg-white rounded-lg p-8 shadow-sm">
                <div className="flex items-center mb-4">
                  <div className="h-12 w-12 rounded-full bg-gray-200 mr-4 overflow-hidden">
                    <img src="young-man-avatar.png" alt="Company Avatar" width={48} height={48} />
                  </div>
                  <div>
                    <h4 className="text-lg font-medium text-gray-900">Rajesh Mehta</h4>
                    <p className="text-sm text-gray-600">HR Manager, TechSolutions</p>
                  </div>
                </div>
                <p className="text-gray-600 italic">
                  "Placify has revolutionized our campus recruitment process. We've reduced our hiring time by 40% and
                  found exceptional talent across multiple colleges."
                </p>
                <div className="flex mt-4 text-yellow-400">
                  <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                  </svg>
                  <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                  </svg>
                  <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                  </svg>
                  <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                  </svg>
                  <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                  </svg>
                </div>
              </div>

              <div className="bg-white rounded-lg p-8 shadow-sm">
                <div className="flex items-center mb-4">
                  <div className="h-12 w-12 rounded-full bg-gray-200 mr-4 overflow-hidden">
                    <img src="male-avatar.png" alt="College Avatar" width={48} height={48} />
                  </div>
                  <div>
                    <h4 className="text-lg font-medium text-gray-900">Dr. Anand Kumar</h4>
                    <p className="text-sm text-gray-600">Placement Officer, Engineering College</p>
                  </div>
                </div>
                <p className="text-gray-600 italic">
                  "Managing placements for 1000+ students was a nightmare before Placify. Now we have a streamlined
                  process that has increased our placement rate significantly."
                </p>
                <div className="flex mt-4 text-yellow-400">
                  <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                  </svg>
                  <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                  </svg>
                  <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                  </svg>
                  <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                  </svg>
                  <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Find answers to common questions about Placify and how it can help you.
              </p>
            </div>

            <div className="max-w-3xl mx-auto">
              <div className="space-y-4">
                {[
                  {
                    question: "How do I sign up for Placify?",
                    answer:
                      "Signing up is easy! Click on the 'Sign Up' button, select your role (Student, Company, or Placement Cell), and follow the registration process. Students will need to verify their college email address.",
                  },
                  {
                    question: "Is Placify free for students?",
                    answer:
                      "Yes, Placify is completely free for students. We believe in empowering students with the best tools to launch their careers without any financial barriers.",
                  },
                  {
                    question: "How does the verification process work?",
                    answer:
                      "After students create their profiles, the college placement cell reviews and verifies their information. Companies are verified by our admin team to ensure authenticity.",
                  },
                  {
                    question: "Can companies target specific colleges?",
                    answer:
                      "When posting a job, companies can select specific colleges they want to target, ensuring they reach the right talent pool.",
                  },
                  {
                    question: "How does Placify ensure data privacy?",
                    answer:
                      "We take data privacy seriously. All personal information is encrypted and stored securely. We never share your data with third parties without your explicit consent.",
                  },
                  {
                    question: "Can placement cells track student performance?",
                    answer:
                      "Yes, placement cells have access to comprehensive analytics dashboards that show application statistics, interview performance, and placement rates.",
                  },
                ].map((faq, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                    <button
                      className="flex justify-between items-center w-full px-6 py-4 text-left bg-white hover:bg-primary/5 focus:outline-none"
                      onClick={() => toggleFaq(index)}
                    >
                      <span className="text-lg font-medium text-gray-900">{faq.question}</span>
                      {activeFaq === index ? (
                        <ChevronUp className="h-5 w-5 text-primary" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-primary" />
                      )}
                    </button>
                    {activeFaq === index && (
                      <div className="px-6 py-4 bg-primary/5">
                        <p className="text-gray-600">{faq.answer}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-primary">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                Ready to Transform Your Placement Process?
              </h2>
              <p className="text-xl text-primary/90 mb-8">
                Join thousands of students, companies, and colleges already using Placify.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link
                  to="/register"
                  className="inline-flex justify-center items-center px-6 py-3 text-base font-medium text-primary bg-white border border-transparent rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Get Started for Free
                </Link>
                <Link
                  to="/contact"
                  className="inline-flex justify-center items-center px-6 py-3 text-base font-medium text-white bg-transparent border border-white rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Contact Sales
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <Link to="/" className="flex items-center">
                <span className="text-2xl font-bold text-primary/80">Placify</span>
              </Link>
              <p className="text-gray-400">Streamlining the placement process for students, companies, and colleges.</p>
              <div className="flex space-x-4">
                <Link to="#" className="text-gray-400 hover:text-white">
                  <Facebook className="h-5 w-5" />
                </Link>
                <Link to="#" className="text-gray-400 hover:text-white">
                  <Twitter className="h-5 w-5" />
                </Link>
                <Link to="#" className="text-gray-400 hover:text-white">
                  <Instagram className="h-5 w-5" />
                </Link>
                <Link to="#" className="text-gray-400 hover:text-white">
                  <Linkedin className="h-5 w-5" />
                </Link>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/" className="text-gray-400 hover:text-white">
                    Home
                  </Link>
                </li>
                <li>
                  <Link to="/about" className="text-gray-400 hover:text-white">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link to="/jobs" className="text-gray-400 hover:text-white">
                    Browse Jobs
                  </Link>
                </li>
                <li>
                  <Link to="/companies" className="text-gray-400 hover:text-white">
                    Companies
                  </Link>
                </li>
                <li>
                  <Link to="/colleges" className="text-gray-400 hover:text-white">
                    Colleges
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">For Users</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/students" className="text-gray-400 hover:text-white">
                    Students
                  </Link>
                </li>
                <li>
                  <Link to="/companies" className="text-gray-400 hover:text-white">
                    Companies
                  </Link>
                </li>
                <li>
                  <Link to="/placement-cells" className="text-gray-400 hover:text-white">
                    Placement Cells
                  </Link>
                </li>
                <li>
                  <Link to="/blog" className="text-gray-400 hover:text-white">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link to="/resources" className="text-gray-400 hover:text-white">
                    Resources
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <MapPin className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                  <span className="text-gray-400">123 Placement Avenue, Education District, 560001</span>
                </li>
                <li className="flex items-center">
                  <Mail className="h-5 w-5 text-gray-400 mr-2" />
                  <Link to="mailto:info@placify.com" className="text-gray-400 hover:text-white">
                    info@placify.com
                  </Link>
                </li>
                <li className="flex items-center">
                  <Phone className="h-5 w-5 text-gray-400 mr-2" />
                  <Link to="tel:+919876543210" className="text-gray-400 hover:text-white">
                    +91 9876 543 210
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">&copy; {new Date().getFullYear()} Placify. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link to="/privacy" className="text-gray-400 hover:text-white text-sm">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-gray-400 hover:text-white text-sm">
                Terms of Service
              </Link>
              <Link to="/cookies" className="text-gray-400 hover:text-white text-sm">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

