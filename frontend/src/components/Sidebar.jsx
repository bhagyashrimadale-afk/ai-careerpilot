import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, User, FileSearch, Briefcase, 
  Code2, BrainCircuit, Mic, Map, Kanban, Sparkles 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar() {
  const { user } = useAuth();
  const isStudent = user?.role === 'student';

  const links = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/profile', label: 'My Profile', icon: User, studentOnly: true },
    { to: '/resume-analyzer', label: 'AI Resume Analyzer', icon: FileSearch, studentOnly: true },
    { to: '/job-matcher', label: 'Jobs & AI Matcher', icon: Briefcase },
    { to: '/dsa-practice', label: 'DSA Practice', icon: Code2, studentOnly: true },
    { to: '/aptitude-tests', label: 'Aptitude Tests', icon: BrainCircuit, studentOnly: true },
    { to: '/mock-interview', label: 'AI Mock Interview', icon: Mic, studentOnly: true },
    { to: '/career-roadmap', label: 'AI Career Roadmap', icon: Map, studentOnly: true },
    { to: '/application-tracker', label: 'Application Tracker', icon: Kanban },
  ];

  return (
    <aside className="w-64 bg-slate-800/50 border-r border-slate-700/60 min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between">
      <div className="space-y-1">
        <p className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
          Core Navigation
        </p>
        {links.map((link) => {
          if (link.studentOnly && !isStudent) return null;
          const Icon = link.icon;

          return (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-3 py-2.5 rounded-xl font-medium text-sm transition ${
                  isActive
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/40'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              <span>{link.label}</span>
            </NavLink>
          );
        })}
      </div>

      {/* Placement Tip Banner */}
      <div className="bg-gradient-to-br from-blue-900/40 to-indigo-900/40 border border-blue-500/20 rounded-xl p-3 text-xs text-blue-200">
        <div className="flex items-center space-x-1.5 font-bold mb-1 text-blue-300">
          <Sparkles className="w-4 h-4" />
          <span>Placement Tip</span>
        </div>
        <p className="leading-snug text-slate-300">
          Solve 1 Medium DSA problem daily to boost your placement readiness tier!
        </p>
      </div>
    </aside>
  );
}
