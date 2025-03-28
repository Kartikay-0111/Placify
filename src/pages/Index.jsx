import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export default function Index() {
  const { user } = useAuth();
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
    <div className="min-h-screen flex flex-col">
      <nav className="bg-gray-900 text-white p-4 flex justify-between items-center">
        <h1 className="text-xl font-semibold">Placement Cell</h1>
        <div className="space-x-4">
          <Link to="/" className="hover:text-gray-300">Home</Link>
          <Link to="/jobs" className="hover:text-gray-300">Jobs</Link>
          <Link to="/login" className="hover:text-gray-300">Login</Link>
          <Link to="/register" className="hover:text-gray-300">Register</Link>
        </div>
      </nav>
      <section className="pt-28 pb-16 px-4 text-center">
        <h1 className="text-4xl font-bold">Connecting Students with <span className="text-blue-500">Opportunities</span></h1>
        <p className="text-lg text-gray-600 mt-4">Find internships, placements, and full-time positions tailored for you.</p>
        <div className="mt-6 flex justify-center space-x-4">
          <Link to={user ? (user.role === 'admin' ? '/admin' : '/dashboard') : '/login'}>
            <button className="bg-blue-600 text-white px-6 py-2 rounded-lg">{user ? 'Go to Dashboard' : 'Get Started'}</button>
          </Link>
          <Link to="/jobs">
            <button className="border border-blue-600 text-blue-600 px-6 py-2 rounded-lg">Browse Jobs</button>
          </Link>
        </div>
      </section>
      <section className="py-12 px-4 bg-gray-100 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
        {[{ title: "Partner Companies", value: stats.companies }, { title: "Available Positions", value: stats.jobs }, { title: "Placement Rate", value: stats.placements }].map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-3xl font-bold">{stat.value}+</h3>
            <p className="text-gray-600">{stat.title}</p>
          </div>
        ))}
      </section>
      <section className="py-20 px-4 text-center">
        <h2 className="text-3xl font-bold mb-6">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {["Create Your Profile", "Discover Opportunities", "Apply With One Click"].map((feature, idx) => (
            <div key={idx} className="bg-white p-6 rounded-lg shadow border hover:shadow-lg">
              <h3 className="text-xl font-semibold mb-3">{feature}</h3>
              <p className="text-gray-600">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
            </div>
          ))}
        </div>
        <div className="mt-6">
          <Link to="/register">
            <button className="bg-blue-600 text-white px-6 py-2 rounded-lg">Create an Account</button>
          </Link>
        </div>
      </section>
      <footer className="bg-gray-900 text-white py-6 text-center mt-auto">
        <p>&copy; {new Date().getFullYear()} Placement Cell. All rights reserved.</p>
      </footer>
    </div>
  );
}
