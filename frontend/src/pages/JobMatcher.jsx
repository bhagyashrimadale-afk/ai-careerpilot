import React, { useState, useEffect } from 'react';
import { 
  Briefcase, Sparkles, CheckCircle2, MapPin, DollarSign, PlusCircle, 
  Search, Filter, ShieldCheck, Zap, AlertCircle, Building2, TrendingUp, Check, X, ArrowRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';

export default function JobMatcher() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);
  const [matchData, setMatchData] = useState(null);
  const [matching, setMatching] = useState(false);
  const [message, setMessage] = useState('');

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');

  // Recruiter form state
  const [showPostModal, setShowPostModal] = useState(false);
  const [newJob, setNewJob] = useState({
    title: '', company: '', location: 'Remote', type: 'Full-time',
    salary_range: '$80,000 - $110,000 / year', description: '', requirements: 'React, Python, SQL, Git'
  });

  const loadJobs = () => {
    api.get('/jobs/')
      .then(res => {
        const fetched = res.data.jobs || [];
        setJobs(fetched);
        setFilteredJobs(fetched);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadJobs();
  }, []);

  useEffect(() => {
    let result = jobs;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(j => 
        j.title.toLowerCase().includes(term) || 
        j.company.toLowerCase().includes(term) ||
        j.description.toLowerCase().includes(term) ||
        (j.requirements && j.requirements.toLowerCase().includes(term))
      );
    }
    if (typeFilter !== 'All') {
      result = result.filter(j => j.type.toLowerCase().includes(typeFilter.toLowerCase()));
    }
    setFilteredJobs(result);
  }, [searchTerm, typeFilter, jobs]);

  const handleAIMatch = async (job) => {
    setSelectedJob(job);
    setMatching(true);
    setMatchData(null);
    try {
      const res = await api.post(`/jobs/match/${job.id}`);
      setMatchData(res.data.match);
    } catch (err) {
      console.error(err);
    } finally {
      setMatching(false);
    }
  };

  const handleApply = async (jobId, status = 'Applied') => {
    try {
      await api.post(`/jobs/apply/${jobId}`, { status });
      setMessage(`✨ Successfully added position to ${status} applications!`);
      setTimeout(() => setMessage(''), 4000);
    } catch (err) {
      console.error(err);
    }
  };

  const handlePostJob = async (e) => {
    e.preventDefault();
    try {
      const reqsArray = newJob.requirements.split(',').map(r => r.trim());
      await api.post('/jobs/', { ...newJob, requirements: reqsArray });
      setShowPostModal(false);
      setNewJob({ title: '', company: '', location: 'Remote', type: 'Full-time', salary_range: '', description: '', requirements: '' });
      loadJobs();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[65vh]">
      <div className="flex flex-col items-center space-y-3 text-slate-400">
        <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-sm font-medium">Fetching Placement Drives & AI Match Data...</span>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Top Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-900/60 via-slate-800 to-indigo-900/60 border border-slate-700/80 rounded-3xl p-6 md:p-8 shadow-2xl">
        <div className="absolute right-0 top-0 -mt-10 -mr-10 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Placement Match Engine 2.0</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Placement Drives & AI Job Matcher</h1>
            <p className="text-sm text-slate-300 mt-1 max-w-xl leading-relaxed">
              Compare your resume and technical skills against verified campus drives. Get real-time qualification percentage and personalized missing skill alerts.
            </p>
          </div>

          {user?.role in { recruiter: 1, admin: 1 } && (
            <button
              onClick={() => setShowPostModal(true)}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-bold px-5 py-3 rounded-2xl transition shadow-xl shadow-blue-600/30 flex items-center space-x-2 shrink-0"
            >
              <PlusCircle className="w-5 h-5" />
              <span>Post New Campus Drive</span>
            </button>
          )}
        </div>

        {/* Quick Metrics Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-700/60 text-xs">
          <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-400 font-medium block">Total Drives</span>
            <span className="text-xl font-extrabold text-white mt-0.5 block">{jobs.length} Active Positions</span>
          </div>
          <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-400 font-medium block">Top Match Threshold</span>
            <span className="text-xl font-extrabold text-emerald-400 mt-0.5 block">85%+ Qualification</span>
          </div>
          <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-400 font-medium block">Remote Roles</span>
            <span className="text-xl font-extrabold text-indigo-400 mt-0.5 block">{jobs.filter(j => j.location.toLowerCase().includes('remote')).length} Available</span>
          </div>
          <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-400 font-medium block">Verified Recruiter Drives</span>
            <span className="text-xl font-extrabold text-amber-400 mt-0.5 block">100% Verified</span>
          </div>
        </div>
      </div>

      {message && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center space-x-2 animate-fadeIn">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* Filter and Search Toolbar */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by job title, company, or skills (e.g. React, Python)..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900/90 border border-slate-700 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
          />
        </div>

        <div className="flex items-center space-x-2 w-full md:w-auto justify-end text-xs">
          <span className="text-slate-400 font-semibold flex items-center space-x-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Type:</span>
          </span>
          {['All', 'Full-time', 'Internship', 'Remote'].map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-1.5 rounded-xl font-semibold transition ${
                typeFilter === t 
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30' 
                  : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-700/60'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Job Cards (Left 7 Cols) + AI Inspector (Right 5 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Jobs Feed */}
        <div className="lg:col-span-7 space-y-4">
          {filteredJobs.length === 0 ? (
            <div className="bg-slate-800/40 border border-slate-700/60 rounded-3xl p-12 text-center text-slate-400 space-y-2">
              <Briefcase className="w-10 h-10 mx-auto text-slate-600 mb-2" />
              <p className="text-sm font-semibold text-white">No Placement Drives Found</p>
              <p className="text-xs text-slate-400">Try adjusting your search keyword or job type filter.</p>
            </div>
          ) : (
            filteredJobs.map((job) => {
              const isSelected = selectedJob?.id === job.id;
              let requirementsList = [];
              try {
                requirementsList = typeof job.requirements === 'string' ? json.loads(job.requirements) : job.requirements;
                if (!Array.isArray(requirementsList)) requirementsList = [job.requirements];
              } catch {
                requirementsList = (job.requirements || '').split(',').map(s => s.trim());
              }

              return (
                <div
                  key={job.id}
                  className={`p-6 rounded-3xl border transition-all duration-300 relative bg-slate-800/90 shadow-xl ${
                    isSelected 
                      ? 'border-blue-500 ring-2 ring-blue-500/40 shadow-blue-900/20' 
                      : 'border-slate-700/80 hover:border-slate-600 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex items-start space-x-3.5">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600/30 to-indigo-600/30 border border-blue-500/30 flex items-center justify-center shrink-0">
                        <Building2 className="w-6 h-6 text-blue-400" />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-white text-base tracking-tight">{job.title}</h3>
                        <p className="text-xs font-semibold text-blue-400 mt-0.5">{job.company}</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-300 text-xs font-bold border border-blue-500/20">
                      {job.type}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 mt-4 leading-relaxed line-clamp-2">{job.description}</p>

                  {/* Requirements Badges */}
                  <div className="flex flex-wrap gap-1.5 mt-4">
                    {requirementsList.slice(0, 5).map((req, idx) => (
                      <span key={idx} className="px-2.5 py-1 rounded-lg bg-slate-900/90 border border-slate-700/80 text-[11px] font-medium text-slate-300 flex items-center space-x-1">
                        <span className="text-blue-400">✓</span>
                        <span>{req}</span>
                      </span>
                    ))}
                    {requirementsList.length > 5 && (
                      <span className="px-2 py-1 rounded-lg bg-slate-900 text-slate-400 text-[10px] font-medium">
                        +{requirementsList.length - 5} more
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-4 mt-5 pt-4 border-t border-slate-700/60 text-xs">
                    <div className="flex items-center space-x-4 text-slate-400">
                      <span className="flex items-center space-x-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-500" />
                        <span>{job.location}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400 font-bold">{job.salary_range}</span>
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleAIMatch(job)}
                        className="bg-gradient-to-r from-blue-600/20 to-indigo-600/20 hover:from-blue-600/40 hover:to-indigo-600/40 text-blue-300 border border-blue-500/40 font-bold px-3.5 py-2 rounded-xl transition flex items-center space-x-1.5 shadow-md"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                        <span>AI Match Analysis</span>
                      </button>

                      <button
                        onClick={() => handleApply(job.id, 'Saved')}
                        className="text-slate-400 hover:text-white px-3 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-700 transition border border-slate-700/60 font-semibold"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => handleApply(job.id, 'Applied')}
                        className="font-bold text-white bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-xl transition shadow-lg shadow-blue-600/20"
                      >
                        Apply Drive
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* AI Match Inspector Sidebar (Right 5 Cols) */}
        <div className="lg:col-span-5">
          {selectedJob ? (
            <div className="bg-slate-800/90 border border-slate-700/90 rounded-3xl p-6 space-y-5 sticky top-20 shadow-2xl backdrop-blur">
              <div className="pb-4 border-b border-slate-700/80 flex justify-between items-start">
                <div>
                  <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider block">Target Drive Selected</span>
                  <h3 className="font-extrabold text-white text-lg mt-0.5">{selectedJob.title}</h3>
                  <p className="text-xs text-slate-400 font-medium">{selectedJob.company} • {selectedJob.location}</p>
                </div>
                <button onClick={() => setSelectedJob(null)} className="text-slate-500 hover:text-white p-1">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {matching ? (
                <div className="py-14 text-center text-slate-400 text-xs flex flex-col items-center space-y-3">
                  <div className="w-10 h-10 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className="font-semibold text-slate-300">Comparing your resume & skills with drive requirements...</span>
                </div>
              ) : matchData ? (
                <div className="space-y-5">
                  {/* Gauge Card */}
                  <div className="relative overflow-hidden p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950 border border-slate-700 text-center space-y-2">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">AI Match Score</span>
                    
                    <div className="inline-flex items-baseline space-x-1">
                      <span className={`text-5xl font-black ${
                        matchData.match_percentage >= 80 ? 'text-emerald-400' : matchData.match_percentage >= 60 ? 'text-amber-400' : 'text-red-400'
                      }`}>
                        {matchData.match_percentage}%
                      </span>
                      <span className="text-slate-400 font-bold text-sm">/ 100</span>
                    </div>

                    <div className="w-full bg-slate-800 rounded-full h-2 mt-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-1000 ${
                          matchData.match_percentage >= 80 ? 'bg-emerald-400' : matchData.match_percentage >= 60 ? 'bg-amber-400' : 'bg-red-400'
                        }`} 
                        style={{ width: `${matchData.match_percentage}%` }}
                      ></div>
                    </div>

                    <p className="text-xs text-slate-300 font-medium pt-1">
                      {matchData.match_percentage >= 80 ? '🚀 Excellent Alignment - Top Eligible Candidate' : '⚡ Moderate Alignment - Review Missing Skills'}
                    </p>
                  </div>

                  {/* Matching Skills */}
                  <div>
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block mb-2 flex items-center space-x-1">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Matching Requirements</span>
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {matchData.matching_skills?.map((s, i) => (
                        <span key={i} className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
                          ✓ {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Missing Skills */}
                  <div>
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block mb-2 flex items-center space-x-1">
                      <AlertCircle className="w-4 h-4" />
                      <span>Missing / Recommended Skills</span>
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {matchData.missing_skills?.map((s, i) => (
                        <span key={i} className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
                          + Add {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* AI Recommendation */}
                  <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-200 leading-relaxed">
                    <span className="font-bold block text-blue-300 mb-1">AI Career Assessment:</span>
                    {matchData.recommendation}
                  </div>

                  <button
                    onClick={() => handleApply(selectedJob.id, 'Applied')}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-3 rounded-2xl transition shadow-xl shadow-blue-600/30 flex items-center justify-center space-x-2 text-xs"
                  >
                    <span>Proceed & Apply to {selectedJob.company}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="bg-slate-800/40 border border-slate-700/60 rounded-3xl p-10 text-center text-slate-400 space-y-3 sticky top-20">
              <Sparkles className="w-10 h-10 mx-auto text-blue-400/60" />
              <h4 className="font-bold text-white text-sm">AI Match Inspector</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Click <strong>AI Match Analysis</strong> on any job card to view your qualification score and missing skill gap insights.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Recruiter Job Posting Modal */}
      {showPostModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-slate-800 border border-slate-700 rounded-3xl p-6 md:p-8 w-full max-w-lg space-y-5 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-700 pb-3">
              <h2 className="text-xl font-extrabold text-white">Post Campus Placement Drive</h2>
              <button onClick={() => setShowPostModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePostJob} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Job Title</label>
                <input
                  type="text" required placeholder="e.g. Full Stack Engineer"
                  value={newJob.title} onChange={e => setNewJob({ ...newJob, title: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Company</label>
                  <input
                    type="text" required placeholder="e.g. TechCorp"
                    value={newJob.company} onChange={e => setNewJob({ ...newJob, company: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Location</label>
                  <input
                    type="text" placeholder="e.g. San Francisco / Remote"
                    value={newJob.location} onChange={e => setNewJob({ ...newJob, location: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Job Description</label>
                <textarea
                  required placeholder="Detailed job expectations..." rows="3"
                  value={newJob.description} onChange={e => setNewJob({ ...newJob, description: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Requirements (comma-separated)</label>
                <input
                  type="text" placeholder="React, Python, MySQL, Git"
                  value={newJob.requirements} onChange={e => setNewJob({ ...newJob, requirements: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-3">
                <button
                  type="button" onClick={() => setShowPostModal(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-700 text-slate-300 font-semibold hover:bg-slate-600 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-500 transition shadow-lg shadow-blue-600/30"
                >
                  Publish Placement Drive
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
