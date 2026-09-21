import React, { useState, useEffect } from 'react';
import { Code2, CheckCircle2, Play, Award, Filter, RefreshCw } from 'lucide-react';
import api from '../api/client';

export default function DsaTracker() {
  const [problems, setProblems] = useState([]);
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [code, setCode] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('');
  const [stats, setStats] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadData = () => {
    const params = difficultyFilter ? `?difficulty=${difficultyFilter}` : '';
    api.get(`/dsa/problems${params}`)
      .then(res => {
        setProblems(res.data.problems || []);
        if (res.data.problems?.length > 0 && !selectedProblem) {
          setSelectedProblem(res.data.problems[0]);
          setCode(res.data.problems[0].starter_code || '');
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));

    api.get('/dsa/user-stats')
      .then(res => setStats(res.data))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    loadData();
  }, [difficultyFilter]);

  const handleSelectProblem = (prob) => {
    setSelectedProblem(prob);
    setCode(prob.starter_code || '');
    setResult(null);
  };

  const handleSubmitSolution = async () => {
    if (!selectedProblem || !code) return;
    setSubmitting(true);
    setResult(null);

    try {
      const res = await api.post(`/dsa/submit/${selectedProblem.id}`, { code });
      setResult(res.data);
      loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="text-center py-12 text-slate-400">Loading DSA practice module...</div>;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center space-x-2">
          <Code2 className="w-6 h-6 text-purple-400" />
          <span>DSA Practice & Code Sandbox</span>
        </h1>
        <p className="text-sm text-slate-400">Solve placement algorithms, track attempts, and boost coding readiness</p>
      </div>

      {/* Stats Header */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4">
          <span className="text-xs font-semibold text-slate-400 uppercase">Total Solved</span>
          <p className="text-2xl font-extrabold text-white mt-1">{stats?.total_solved || 0} / {stats?.total_problems || 0}</p>
        </div>
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4">
          <span className="text-xs font-semibold text-emerald-400 uppercase">Easy</span>
          <p className="text-2xl font-extrabold text-emerald-400 mt-1">{stats?.easy_solved || 0}</p>
        </div>
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4">
          <span className="text-xs font-semibold text-amber-400 uppercase">Medium</span>
          <p className="text-2xl font-extrabold text-amber-400 mt-1">{stats?.medium_solved || 0}</p>
        </div>
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4">
          <span className="text-xs font-semibold text-red-400 uppercase">Hard</span>
          <p className="text-2xl font-extrabold text-red-400 mt-1">{stats?.hard_solved || 0}</p>
        </div>
      </div>

      {/* Main Sandbox Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Problem List (4 Cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Problem Bank</span>
            <select
              value={difficultyFilter}
              onChange={e => setDifficultyFilter(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-xl py-1 px-2.5 text-xs text-slate-300 focus:outline-none"
            >
              <option value="">All Difficulties</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>

          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {problems.map((prob) => (
              <div
                key={prob.id}
                onClick={() => handleSelectProblem(prob)}
                className={`p-3.5 rounded-xl border cursor-pointer transition ${
                  selectedProblem?.id === prob.id
                    ? 'bg-purple-600/20 border-purple-500 text-white'
                    : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div className="flex justify-between items-center">
                  <h4 className="font-semibold text-xs">{prob.title}</h4>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    prob.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-400' :
                    prob.difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-400' : 'bg-red-500/10 text-red-400'
                  }`}>
                    {prob.difficulty}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">{prob.topic}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Problem Detail & Code Editor (8 Cols) */}
        <div className="lg:col-span-8 bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 space-y-4 flex flex-col justify-between">
          {selectedProblem ? (
            <>
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-700">
                  <div>
                    <h3 className="text-lg font-bold text-white">{selectedProblem.title}</h3>
                    <p className="text-xs text-purple-400 font-semibold">{selectedProblem.topic} • {selectedProblem.difficulty}</p>
                  </div>
                  <button
                    onClick={handleSubmitSolution}
                    disabled={submitting}
                    className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold px-4 py-2 rounded-xl transition flex items-center space-x-1.5 shadow-lg shadow-purple-600/30"
                  >
                    {submitting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                    <span>{submitting ? 'Running Tests...' : 'Run & Submit Solution'}</span>
                  </button>
                </div>

                <div className="mt-3 text-xs text-slate-300 space-y-2">
                  <p>{selectedProblem.description}</p>
                  {selectedProblem.example_input && (
                    <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-700/80 font-mono">
                      <span className="text-slate-400 font-bold block mb-0.5">Example Input:</span>
                      <code>{selectedProblem.example_input}</code>
                    </div>
                  )}
                  {selectedProblem.example_output && (
                    <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-700/80 font-mono">
                      <span className="text-slate-400 font-bold block mb-0.5">Expected Output:</span>
                      <code>{selectedProblem.example_output}</code>
                    </div>
                  )}
                </div>
              </div>

              {/* Code Editor Area */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Python Solution Sandbox</label>
                <textarea
                  rows="10"
                  value={code}
                  onChange={e => setCode(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 font-mono text-xs text-emerald-300 focus:outline-none focus:border-purple-500 leading-relaxed"
                />
              </div>

              {/* Evaluation Result Banner */}
              {result && (
                <div className={`p-3.5 rounded-xl border text-xs font-semibold flex items-center justify-between ${
                  result.status === 'Solved'
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                }`}>
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Submission Status: {result.status} (Score: {result.score}/100)</span>
                  </div>
                  <span className="text-[11px] opacity-80">Check stats above to see updated score!</span>
                </div>
              )}
            </>
          ) : (
            <div className="py-20 text-center text-slate-400 text-xs">Select a problem from the left pane to start coding.</div>
          )}
        </div>
      </div>
    </div>
  );
}
