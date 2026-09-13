import React, { useState, useEffect } from 'react';
import { Briefcase, Sparkles, CheckCircle2, MapPin, DollarSign, PlusCircle, ExternalLink } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';

export default function JobMatcher() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);
  const [matchData, setMatchData] = useState(null);
  const [matching, setMatching] = useState(false);
  const [message, setMessage] = useState('');

  // Recruiter form state
  const [showPostModal, setShowPostModal] = useState(false);
  const [newJob, setNewJob] = useState({
    title: '', company: '', location: 'Remote', type: 'Full-time',
    salary_range: '$80,000 - $110,000 / year', description: '', requirements: 'React, Python, SQL, Git'
  });

  const loadJobs = () => {
    api.get('/jobs/')
      .then(res => setJobs(res.data.jobs || []))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadJobs();
  }, []);

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
      setMessage(`Successfully added job to ${status} applications!`);
      setTimeout(() => setMessage(''), 3000);
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

  if (loading) return <div className="text-center py-12 text-slate-400">Loading placement jobs...</div>;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center space-x-2">
            <Briefcase className="w-6 h-6 text-blue-400" />
            <span>Placement Jobs & AI Matcher</span>
          </h1>
          <p className="text-sm text-slate-400">Compare your skills against active campus drives and calculate match %</p>
        </div>

        {user?.role in { recruiter: 1, admin: 1 } && (
          <button
            onClick={() => setShowPostModal(true)}
            className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition flex items-center space-x-2 shadow-lg shadow-blue-600/30"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Post Placement Drive</span>
          </button>
        )}
      </div>

      {message && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
          {message}
        </div>
      )}

      {/* Main Grid: Jobs list + AI Match Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Jobs Feed */}
        <div className="lg:col-span-2 space-y-4">
          {jobs.map((job) => (
            <div
              key={job.id}
              className={`p-5 rounded-2xl border transition bg-slate-800/80 ${
                selectedJob?.id === job.id ? 'border-blue-500 ring-1 ring-blue-500/50' : 'border-slate-700/80 hover:border-slate-600'
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-white text-base">{job.title}</h3>
                  <p className="text-xs text-blue-400 font-semibold mt-0.5">{job.company}</p>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-300 text-xs font-medium border border-blue-500/20">
                  {job.type}
                </span>
              </div>

              <p className="text-xs text-slate-300 mt-3 line-clamp-2">{job.description}</p>

              <div className="flex flex-wrap items-center gap-4 mt-4 text-xs text-slate-400">
                <span className="flex items-center space-x-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  <span>{job.location}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-slate-300 font-medium">{job.salary_range}</span>
                </span>
              </div>

              <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-700/60">
                <button
                  onClick={() => handleAIMatch(job)}
                  className="bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-xs font-semibold px-3 py-1.5 rounded-xl transition flex items-center space-x-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                  <span>Calculate AI Match</span>
                </button>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleApply(job.id, 'Saved')}
                    className="text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-lg bg-slate-700/40 hover:bg-slate-700 transition"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => handleApply(job.id, 'Applied')}
                    className="text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 px-3 py-1.5 rounded-lg transition"
                  >
                    Apply Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* AI Match Inspector Panel */}
        <div>
          {selectedJob ? (
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 space-y-4 sticky top-20">
              <div className="pb-3 border-b border-slate-700">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Target Position</span>
                <h3 className="font-bold text-white text-base mt-0.5">{selectedJob.title}</h3>
                <p className="text-xs text-slate-400">{selectedJob.company}</p>
              </div>

              {matching ? (
                <div className="py-12 text-center text-slate-400 text-xs flex flex-col items-center space-y-2">
                  <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  <span>Comparing skills with requirements...</span>
                </div>
              ) : matchData ? (
                <div className="space-y-4">
                  <div className="text-center p-4 rounded-xl bg-slate-900/80 border border-slate-700">
                    <span className="text-xs text-slate-400 font-medium">AI Qualification Match</span>
                    <p className="text-4xl font-extrabold text-blue-400 mt-1">{matchData.match_percentage}%</p>
                  </div>

                  <div>
                    <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider block mb-1.5">Matching Skills</span>
                    <div className="flex flex-wrap gap-1.5">
                      {matchData.matching_skills?.map((s, i) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs">
                          ✓ {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider block mb-1.5">Missing Requirements</span>
                    <div className="flex flex-wrap gap-1.5">
                      {matchData.missing_skills?.map((s, i) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs">
                          ! {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-700 text-xs text-slate-300">
                    <span className="font-bold text-blue-400">AI Assessment: </span>
                    {matchData.recommendation}
                  </div>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-8 text-center text-slate-400 text-xs">
              Click <strong>Calculate AI Match</strong> on any job posting to view your detailed qualification percentage.
            </div>
          )}
        </div>
      </div>

      {/* Recruiter Modal */}
      {showPostModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 w-full max-w-lg space-y-4">
            <h2 className="text-lg font-bold text-white">Post Placement Job Drive</h2>
            <form onSubmit={handlePostJob} className="space-y-3 text-xs">
              <input
                type="text" required placeholder="Job Title"
                value={newJob.title} onChange={e => setNewJob({ ...newJob, title: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white"
              />
              <input
                type="text" required placeholder="Company Name"
                value={newJob.company} onChange={e => setNewJob({ ...newJob, company: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white"
              />
              <input
                type="text" placeholder="Location"
                value={newJob.location} onChange={e => setNewJob({ ...newJob, location: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white"
              />
              <textarea
                required placeholder="Job Description" rows="3"
                value={newJob.description} onChange={e => setNewJob({ ...newJob, description: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white"
              />
              <input
                type="text" placeholder="Requirements (comma separated)"
                value={newJob.requirements} onChange={e => setNewJob({ ...newJob, requirements: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white"
              />
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button" onClick={() => setShowPostModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-700 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold"
                >
                  Publish Job
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
