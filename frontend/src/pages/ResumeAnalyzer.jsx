import React, { useState, useEffect } from 'react';
import { FileSearch, Sparkles, AlertCircle, CheckCircle2, AlertTriangle, Lightbulb, RefreshCw } from 'lucide-react';
import api from '../api/client';

export default function ResumeAnalyzer() {
  const [resumeText, setResumeText] = useState('');
  const [targetRole, setTargetRole] = useState('Full Stack Developer');
  const [analysis, setAnalysis] = useState(null);
  const [atsScore, setAtsScore] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/resume/latest')
      .then(res => {
        if (res.data.analysis) {
          setAnalysis(res.data.analysis);
          setAtsScore(res.data.ats_score);
          setResumeText(res.data.resume_text || '');
          if (res.data.target_role) setTargetRole(res.data.target_role);
        }
      })
      .catch(err => console.error(err));
  }, []);

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!resumeText.strip && !resumeText.trim()) {
      setError('Please paste your resume text to analyze.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const res = await api.post('/resume/analyze', {
        resume_text: resumeText,
        target_role: targetRole
      });
      setAnalysis(res.data.analysis);
      setAtsScore(res.data.ats_score);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to analyze resume.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center space-x-2">
          <FileSearch className="w-6 h-6 text-emerald-400" />
          <span>AI Resume ATS Analyzer</span>
        </h1>
        <p className="text-sm text-slate-400">Evaluate ATS compatibility, identify missing keywords, and get actionable recommendations</p>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Form Input */}
        <form onSubmit={handleAnalyze} className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Target Role</label>
              <input
                type="text"
                value={targetRole}
                onChange={e => setTargetRole(e.target.value)}
                placeholder="Full Stack Developer, Data Scientist..."
                className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2 px-3 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Resume Content / Plain Text</label>
              <textarea
                rows="14"
                value={resumeText}
                onChange={e => setResumeText(e.target.value)}
                placeholder="Paste your full resume text here (Summary, Skills, Experience, Education, Projects)..."
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs font-mono text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3 rounded-xl transition flex items-center justify-center space-x-2 shadow-lg shadow-emerald-600/30"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            <span>{loading ? 'AI Analyzing Resume...' : 'Analyze Resume ATS Score'}</span>
          </button>
        </form>

        {/* Right Column: AI Analysis Result */}
        <div className="space-y-6">
          {/* ATS Gauge Card */}
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">ATS Score</span>
              <p className="text-sm text-slate-300 mt-1">Role: <span className="text-white font-bold">{targetRole}</span></p>
            </div>
            <div className="text-right">
              <span className={`text-5xl font-extrabold ${atsScore >= 80 ? 'text-emerald-400' : atsScore >= 60 ? 'text-amber-400' : 'text-red-400'}`}>
                {atsScore}
              </span>
              <span className="text-slate-400 text-sm font-bold">/100</span>
            </div>
          </div>

          {analysis ? (
            <div className="space-y-4">
              {/* Missing Skills */}
              <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5">
                <h3 className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Missing Domain Keywords / Skills</span>
                </h3>
                <div className="flex flex-wrap gap-2 mt-2">
                  {analysis.missing_skills?.map((skill, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-medium">
                      + {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Strengths */}
              <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5">
                <h3 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Resume Strengths</span>
                </h3>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {analysis.strengths?.map((s, idx) => (
                    <li key={idx} className="flex items-start space-x-2">
                      <span className="text-emerald-400 mt-0.5">•</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Actionable Suggestions */}
              <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5">
                <h3 className="text-xs font-semibold text-blue-400 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                  <Lightbulb className="w-4 h-4" />
                  <span>Actionable Improvement Suggestions</span>
                </h3>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {analysis.improvement_tips?.map((tip, idx) => (
                    <li key={idx} className="flex items-start space-x-2">
                      <span className="text-blue-400 mt-0.5">•</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-12 text-center text-slate-400 text-sm">
              Paste your resume on the left and click <strong>Analyze Resume ATS Score</strong> to view instant AI recommendations.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
