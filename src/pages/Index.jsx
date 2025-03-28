import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/AppNavbar';
import {
  Users,
  Briefcase,
  Award,
  CheckCircle,
  MessageCircle,
  MapPin,
  Mail,
  Phone
} from 'lucide-react';

// Dummy Testimonial Data
const testimonials = [
  {
    name: "John Doe",
    role: "Software Engineer at Google",
    image: "/api/placeholder/100/100",
    quote: "The placement cell was instrumental in helping me secure my dream job. Their support and guidance were exceptional."
  },
  {
    name: "Jane Smith",
    role: "Product Manager at Microsoft",
    image: "/api/placeholder/100/100",
    quote: "I'm grateful for the comprehensive support and networking opportunities provided by the placement cell."
  },
  {
    name: "Mike Johnson",
    role: "Data Scientist at Amazon",
    image: "/api/placeholder/100/100",
    quote: "The placement resources and workshops were key to my successful career launch."
  }
];

export default function PlacementCellLandingPage() {
  const [stats, setStats] = useState({ companies: 0, jobs: 0, placements: 0 });

  useEffect(() => {
    const targetStats = { companies: 50, jobs: 120, placements: 85 };
    const duration = 2000;
    const frameRate = 20;
    const totalFrames = duration / frameRate;
    let frame = 0;

    const timer = setInterval(() => {
      frame++;
      const progress = frame / totalFrames;
      if (frame <= totalFrames) {
        setStats({
          companies: Math.floor(targetStats.companies * progress),
          jobs: Math.floor(targetStats.jobs * progress),
          placements: Math.floor(targetStats.placements * progress),
        });
      } else {
        clearInterval(timer);
      }
    }, frameRate);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-base-100">
      {/* Navbar */}
      <Navbar />
      <div className="hero min-h-[70vh] bg-base-200">
        <div className="hero-content flex-col lg:flex-row-reverse">
          <img
            src="./image.png"
            alt="Placement Success"
            className="max-w-sm w-5/12 rounded-lg shadow-2xl transform transition hover:scale-105"
          />
          <div className='w-7/12'>
            <h1 className="text-5xl font-bold">Unlock Your Career Potential</h1>
            <p className="py-6 text-lg">
              Empowering students with transformative career opportunities,
              strategic networking, and professional development resources.
            </p>
            <div className="space-x-4">
              <Link to="/register" className="btn btn-primary">Get Started</Link>
              <Link to="/jobs" className="btn btn-outline btn-secondary">Browse Jobs</Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="stats shadow w-full bg-base-100 py-10 px-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
        {[
          { icon: <Users />, title: "Partner Companies", value: stats.companies },
          { icon: <Briefcase />, title: "Available Positions", value: stats.jobs },
          { icon: <Award />, title: "Placement Rate", value: stats.placements }
        ].map((stat, idx) => (
          <div key={idx} className="stat bg-base-200 rounded-lg p-6 hover:shadow-xl transition">
            <div className="stat-figure text-primary">{stat.icon}</div>
            <div className="stat-value text-4xl">{stat.value}+</div>
            <div className="stat-title">{stat.title}</div>
          </div>
        ))}
      </div>

      {/* Features Section */}
      <div id="features" className="py-16 bg-base-200">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <CheckCircle className="mx-auto mb-4 text-primary" size={48} />,
                title: "Create Profile",
                description: "Build a comprehensive professional profile showcasing your skills and achievements."
              },
              {
                icon: <Briefcase className="mx-auto mb-4 text-primary" size={48} />,
                title: "Discover Opportunities",
                description: "Access a curated database of internships, jobs, and placement openings."
              },
              {
                icon: <Award className="mx-auto mb-4 text-primary" size={48} />,
                title: "Apply & Succeed",
                description: "Leverage our resources and network to land your dream career opportunity."
              }
            ].map((feature, idx) => (
              <div
                key={idx}
                className="card bg-base-100 shadow-xl hover:shadow-2xl transition transform hover:-translate-y-2"
              >
                <div className="card-body items-center text-center">
                  {feature.icon}
                  <h3 className="card-title">{feature.title}</h3>
                  <p>{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div id="testimonials" className="py-16 bg-base-100">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold mb-12">Success Stories</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, idx) => (
              <div
                key={idx}
                className="card bg-base-200 shadow-xl hover:shadow-2xl transition transform hover:-translate-y-2"
              >
                <div className="card-body">
                  <div className="flex items-center mb-4">
                    <img
                      src={testimonial.image}
                      alt={testimonial.name}
                      className="w-16 h-16 rounded-full mr-4"
                    />
                    <div>
                      <h3 className="font-bold">{testimonial.name}</h3>
                      <p className="text-sm text-gray-600">{testimonial.role}</p>
                    </div>
                  </div>
                  <p className="italic">"{testimonial.quote}"</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div id="contact" className="py-16 bg-base-200">
        <div className="container mx-auto">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title text-4xl mb-8 text-center">Contact Us</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <div className="form-control mb-4">
                    <label className="label">
                      <span className="label-text">Name</span>
                    </label>
                    <input type="text" placeholder="Your Name" className="input input-bordered" />
                  </div>
                  <div className="form-control mb-4">
                    <label className="label">
                      <span className="label-text">Email</span>
                    </label>
                    <input type="email" placeholder="Your Email" className="input input-bordered" />
                  </div>
                  <div className="form-control mb-4">
                    <label className="label">
                      <span className="label-text">Message</span>
                    </label>
                    <textarea className="textarea textarea-bordered h-24" placeholder="Your Message"></textarea>
                  </div>
                  <button className="btn btn-primary w-full">Send Message</button>
                </div>
                <div className="bg-base-200 p-6 rounded-lg">
                  <h3 className="text-2xl font-bold mb-4">Contact Information</h3>
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <MapPin className="mr-4 text-primary" />
                      <p>123 Career Street, Education City</p>
                    </div>
                    <div className="flex items-center">
                      <Phone className="mr-4 text-primary" />
                      <p>+1 (555) 123-4567</p>
                    </div>
                    <div className="flex items-center">
                      <Mail className="mr-4 text-primary" />
                      <p>placement@college.edu</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="footer p-10 bg-base-300 text-base-content">
        <div>
          <span className="footer-title">Quick Links</span>
          <a className="link link-hover">About us</a>
          <a className="link link-hover">Jobs</a>
          <a className="link link-hover">Workshops</a>
        </div>
        <div>
          <span className="footer-title">Company</span>
          <a className="link link-hover">Privacy Policy</a>
          <a className="link link-hover">Terms of Service</a>
          <a className="link link-hover">Contact</a>
        </div>
        <div>
          <span className="footer-title">Social</span>
          <div className="grid grid-flow-col gap-4">
            <a><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" className="fill-current"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"></path></svg></a>
            <a><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" className="fill-current"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"></path></svg></a>
            <a><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" className="fill-current"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"></path></svg></a>
          </div>
        </div>
      </footer>
    </div>
  );
}