import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Landing() {
  const navigate = useNavigate();

  const features = [
    ['📄', 'Resume Analyzer', 'AI-powered resume and ATS analysis.'],
    ['💼', 'Job Matcher', 'Find jobs based on your skills.'],
    ['💻', 'DSA Practice', 'Practice and track coding progress.'],
    ['🎤', 'Mock Interview', 'Prepare with AI-powered interviews.'],
    ['📝', 'Aptitude Tests', 'Practice and improve weak topics.'],
    ['🗺️', 'Career Roadmap', 'Follow your personalized career path.']
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">

      {/* Navbar */}
      <nav className="border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold">
              AI <span className="text-blue-400">CareerPilot</span>
            </h1>
            <p className="text-xs text-slate-400">Smart Placement Platform</p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => navigate('/login')}
              className="px-5 py-2 rounded-lg hover:bg-slate-800"
            >
              Login
            </button>

            <button
              onClick={() => navigate('/register')}
              className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 py-20 grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <p className="text-blue-400 mb-4">✨ AI-powered career preparation</p>

          <h2 className="text-4xl md:text-6xl font-bold leading-tight">
            Build Your Career.
            <br />
            <span className="text-blue-400">Prepare Smarter.</span>
          </h2>

          <p className="mt-6 text-slate-400 text-lg leading-7">
            AI CareerPilot helps students prepare for placements through
            resume analysis, job matching, DSA, aptitude, mock interviews
            and career guidance.
          </p>

          <button
            onClick={() => navigate('/register')}
            className="mt-8 px-7 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 font-semibold"
          >
            Start Your Journey →
          </button>
        </div>

        {/* Dashboard Preview */}
        <div className="rounded-2xl border border-slate-700 bg-slate-900 p-6">
          <p className="text-sm text-slate-400">AI CareerPilot Dashboard</p>
          <h3 className="text-2xl font-bold mt-2">
            Your Placement Journey
          </h3>

          <div className="grid grid-cols-2 gap-4 mt-6">
            {features.slice(0, 4).map(([icon, title, text]) => (
              <div key={title} className="p-4 rounded-xl bg-slate-800">
                <div className="text-2xl">{icon}</div>
                <h4 className="font-semibold mt-2">{title}</h4>
                <p className="text-xs text-slate-400 mt-1">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <h3 className="text-3xl font-bold text-center">
            Everything You Need for Placement
          </h3>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 mt-10">
            {features.map(([icon, title, text]) => (
              <div
                key={title}
                className="p-5 rounded-xl bg-slate-900 border border-slate-800"
              >
                <span className="text-2xl">{icon}</span>
                <h4 className="text-lg font-semibold mt-3">{title}</h4>
                <p className="text-sm text-slate-400 mt-2">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-6 py-16 text-center">
        <h3 className="text-3xl font-bold">
          Ready to Prepare for Your Dream Career?
        </h3>

        <p className="text-slate-400 mt-4">
          Start your placement preparation with AI CareerPilot.
        </p>

        <button
          onClick={() => navigate('/register')}
          className="mt-7 px-7 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 font-semibold"
        >
          Get Started →
        </button>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-6 text-center text-sm text-slate-500">
        © 2026 AI CareerPilot • Smart Placement & Career Platform
      </footer>

    </div>
  );
}