import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Trophy, TrendingUp, CheckCircle, Clock, Award, 
  Briefcase, Code2, BrainCircuit, Mic, ArrowRight, PlusCircle, Users 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import ReadinessRadarChart from '../components/ReadinessRadarChart';

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const roleEndpoint = user?.role === 'recruiter' 
      ? '/dashboard/recruiter' 
      : user?.role === 'admin' 
        ? '/dashboard/admin' 
        : '/dashboard/student';

    api.get(roleEndpoint)
      .then(res => setData(res.data))
      .catch(err => console.error('Dashboard load error:', err))
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex items-center space-x-3 text-slate-400">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span>Loading Dashboard Metrics...</span>
        </div>
      </div>
    );
  }

  // --- RECRUITER DASHBOARD VIEW ---
  if (user?.role === 'recruiter') {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white">Recruiter Dashboard</h1>
            <p className="text-sm text-slate-400">Manage placement drives and candidate applications</p>
          </div>
          <Link
            to="/job-matcher"
            className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition flex items-center space-x-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Post New Placement Job</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5">
            <p className="text-xs font-semibold text-slate-400 uppercase">Jobs Posted</p>
            <p className="text-3xl font-extrabold text-white mt-1">{data?.total_jobs_posted || 0}</p>
          </div>
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5">
            <p className="text-xs font-semibold text-slate-400 uppercase">Total Applicants</p>
            <p className="text-3xl font-extrabold text-blue-400 mt-1">{data?.total_applicants || 0}</p>
          </div>
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5">
            <p className="text-xs font-semibold text-slate-400 uppercase">Shortlisted Candidates</p>
            <p className="text-3xl font-extrabold text-emerald-400 mt-1">{data?.shortlisted_applicants || 0}</p>
          </div>
        </div>

        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white mb-4">Active Placement Drives</h2>
          <div className="space-y-3">
            {data?.posted_jobs?.map((job) => (
              <div key={job.id} className="p-4 rounded-xl bg-slate-900/60 border border-slate-700/60 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-white">{job.title}</h3>
                  <p className="text-xs text-slate-400">{job.company} • {job.location} • {job.type}</p>
                </div>
                <Link to="/application-tracker" className="text-xs text-blue-400 font-semibold hover:underline">
                  View Applicants →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // --- ADMIN DASHBOARD VIEW ---
  if (user?.role === 'admin') {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">System Admin Overview</h1>
          <p className="text-sm text-slate-400">Platform analytics and system health metrics</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5">
            <p className="text-xs font-semibold text-slate-400 uppercase">Total Users</p>
            <p className="text-3xl font-extrabold text-white mt-1">{data?.total_users || 0}</p>
          </div>
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5">
            <p className="text-xs font-semibold text-slate-400 uppercase">Students Enrolled</p>
            <p className="text-3xl font-extrabold text-blue-400 mt-1">{data?.total_students || 0}</p>
          </div>
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5">
            <p className="text-xs font-semibold text-slate-400 uppercase">Recruiters</p>
            <p className="text-3xl font-extrabold text-indigo-400 mt-1">{data?.total_recruiters || 0}</p>
          </div>
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5">
            <p className="text-xs font-semibold text-slate-400 uppercase">Active Jobs</p>
            <p className="text-3xl font-extrabold text-emerald-400 mt-1">{data?.total_jobs || 0}</p>
          </div>
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5">
            <p className="text-xs font-semibold text-slate-400 uppercase">DSA Problem Bank</p>
            <p className="text-3xl font-extrabold text-purple-400 mt-1">{data?.total_dsa_problems || 0}</p>
          </div>
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5">
            <p className="text-xs font-semibold text-slate-400 uppercase">Job Applications</p>
            <p className="text-3xl font-extrabold text-amber-400 mt-1">{data?.total_applications || 0}</p>
          </div>
        </div>
      </div>
    );
  }

  // --- STUDENT DASHBOARD VIEW ---
  const readiness = data?.readiness || {};
  const overallScore = readiness.overall_score || 0;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-900/60 via-slate-800 to-indigo-900/60 border border-slate-700/80 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Welcome back, {user?.name}! 👋</h1>
          <p className="text-sm text-slate-300 mt-1">
            Target Role: <span className="text-blue-400 font-semibold">{data?.profile_summary?.target_role || 'Full Stack Developer'}</span>
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center space-x-3 bg-slate-900/80 border border-slate-700/80 px-4 py-2.5 rounded-xl">
          <Trophy className="w-6 h-6 text-amber-400" />
          <div>
            <span className="text-xs text-slate-400 block font-medium uppercase">Placement Tier</span>
            <span className="text-sm font-bold text-amber-300">{readiness.status_tier || 'Needs Preparation'}</span>
          </div>
        </div>
      </div>

      {/* Main Readiness Metric Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Score & Radar Chart */}
        <div className="lg:col-span-2 bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-blue-400" />
                <span>Placement Readiness Score</span>
              </h2>
              <p className="text-xs text-slate-400">Multi-factor evaluation breakdown</p>
            </div>
            <div className="text-right">
              <span className="text-4xl font-extrabold text-blue-400">{overallScore}</span>
              <span className="text-slate-400 text-sm font-bold">/100</span>
            </div>
          </div>

          <ReadinessRadarChart data={readiness.radar_data} />

          <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20 mt-2 text-xs text-blue-200">
            <span className="font-bold">AI Guidance: </span>
            {readiness.recommendation}
          </div>
        </div>

        {/* Metric Quick Cards */}
        <div className="space-y-4">
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Score Components</h3>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-300">Profile Completeness</span>
                <span className="font-bold text-white">{readiness.breakdown?.profile || 0}%</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-1.5">
                <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${readiness.breakdown?.profile || 0}%` }}></div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-300">Resume ATS Score</span>
                <span className="font-bold text-emerald-400">{readiness.breakdown?.ats || 0}%</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-1.5">
                <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${readiness.breakdown?.ats || 0}%` }}></div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-300">DSA Practice Solved</span>
                <span className="font-bold text-purple-400">{readiness.breakdown?.dsa || 0}%</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-1.5">
                <div className="bg-purple-500 h-1.5 rounded-full" style={{ width: `${readiness.breakdown?.dsa || 0}%` }}></div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-300">Aptitude Test Average</span>
                <span className="font-bold text-amber-400">{readiness.breakdown?.aptitude || 0}%</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-1.5">
                <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: `${readiness.breakdown?.aptitude || 0}%` }}></div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-300">Mock Interview Score</span>
                <span className="font-bold text-sky-400">{readiness.breakdown?.interview || 0}%</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-1.5">
                <div className="bg-sky-500 h-1.5 rounded-full" style={{ width: `${readiness.breakdown?.interview || 0}%` }}></div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-3 text-center">
              <p className="text-xs text-slate-400 font-medium">Applied</p>
              <p className="text-xl font-bold text-white mt-1">{data?.application_counts?.applied || 0}</p>
            </div>
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-3 text-center">
              <p className="text-xs text-slate-400 font-medium">Interview</p>
              <p className="text-xl font-bold text-amber-400 mt-1">{data?.application_counts?.interview || 0}</p>
            </div>
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-3 text-center">
              <p className="text-xs text-slate-400 font-medium">Offers</p>
              <p className="text-xl font-bold text-emerald-400 mt-1">{data?.application_counts?.selected || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Action Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link to="/resume-analyzer" className="p-4 bg-slate-800/80 hover:bg-slate-700/60 border border-slate-700/80 rounded-2xl transition group">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-3 group-hover:scale-110 transition">
            <Award className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-white text-sm">AI Resume Analyzer</h3>
          <p className="text-xs text-slate-400 mt-0.5">Check ATS score & missing keywords</p>
        </Link>

        <Link to="/dsa-practice" className="p-4 bg-slate-800/80 hover:bg-slate-700/60 border border-slate-700/80 rounded-2xl transition group">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-3 group-hover:scale-110 transition">
            <Code2 className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-white text-sm">DSA Practice</h3>
          <p className="text-xs text-slate-400 mt-0.5">Solve curated algorithm questions</p>
        </Link>

        <Link to="/aptitude-tests" className="p-4 bg-slate-800/80 hover:bg-slate-700/60 border border-slate-700/80 rounded-2xl transition group">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-3 group-hover:scale-110 transition">
            <BrainCircuit className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-white text-sm">Aptitude Quizzes</h3>
          <p className="text-xs text-slate-400 mt-0.5">Timed tests & weak topic analysis</p>
        </Link>

        <Link to="/mock-interview" className="p-4 bg-slate-800/80 hover:bg-slate-700/60 border border-slate-700/80 rounded-2xl transition group">
          <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center mb-3 group-hover:scale-110 transition">
            <Mic className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-white text-sm">AI Mock Interview</h3>
          <p className="text-xs text-slate-400 mt-0.5">Real-time technical & HR feedback</p>
        </Link>
      </div>
    </div>
  );
}
