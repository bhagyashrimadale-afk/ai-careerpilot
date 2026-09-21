import React, { useState, useEffect } from 'react';
import { 
  Code2, CheckCircle2, Play, Award, Filter, RefreshCw, 
  Terminal, Sparkles, Layers, Cpu, Check, AlertCircle, ArrowRight
} from 'lucide-react';
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
        const fetched = res.data.problems || [];
        setProblems(fetched);
        if (fetched.length > 0 && (!selectedProblem || !fetched.find(p => p.id === selectedProblem.id))) {
          setSelectedProblem(fetched[0]);
          setCode(fetched[0].starter_code || '');
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

  if (loading) return (
    <div className="flex items-center justify-center min-h-[65vh]">
      <div className="flex flex-col items-center space-y-3 text-slate-400">
        <div className="w-8 h-8 border-3 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-sm font-medium">Loading DSA Algorithm Sandbox...</span>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Top Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-purple-950/60 via-slate-800 to-indigo-950/60 border border-slate-700/80 rounded-3xl p-6 md:p-8 shadow-2xl">
        <div className="absolute right-0 top-0 -mt-10 -mr-10 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold mb-2">
              <Terminal className="w-3.5 h-3.5" />
              <span>Interactive Code Sandbox 2.0</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">DSA Practice & Code Execution</h1>
            <p className="text-sm text-slate-300 mt-1 max-w-xl leading-relaxed">
              Solve placement algorithm questions, practice sliding window, dynamic programming, and binary trees with real-time Python code evaluation.
            </p>
          </div>

          {/* Quick Stats Header */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full md:w-auto text-xs shrink-0">
            <div className="bg-slate-900/80 p-3 px-4 rounded-2xl border border-slate-700 text-center">
              <span className="text-slate-400 font-medium block">Total Solved</span>
              <span className="text-xl font-extrabold text-white mt-0.5 block">{stats?.total_solved || 0} / {stats?.total_problems || 0}</span>
            </div>
            <div className="bg-slate-900/80 p-3 px-4 rounded-2xl border border-slate-700 text-center">
              <span className="text-emerald-400 font-bold block">Easy</span>
              <span className="text-xl font-extrabold text-emerald-400 mt-0.5 block">{stats?.easy_solved || 0}</span>
            </div>
            <div className="bg-slate-900/80 p-3 px-4 rounded-2xl border border-slate-700 text-center">
              <span className="text-amber-400 font-bold block">Medium</span>
              <span className="text-xl font-extrabold text-amber-400 mt-0.5 block">{stats?.medium_solved || 0}</span>
            </div>
            <div className="bg-slate-900/80 p-3 px-4 rounded-2xl border border-slate-700 text-center">
              <span className="text-red-400 font-bold block">Hard</span>
              <span className="text-xl font-extrabold text-red-400 mt-0.5 block">{stats?.hard_solved || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Sandbox Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Problem Bank List (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-slate-800/90 border border-slate-700/80 rounded-3xl p-4 flex items-center justify-between shadow-lg">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
              <Layers className="w-4 h-4 text-purple-400" />
              <span>Problem Bank</span>
            </span>

            <select
              value={difficultyFilter}
              onChange={e => setDifficultyFilter(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-xl py-1.5 px-3 text-xs text-slate-200 font-semibold focus:outline-none"
            >
              <option value="">All Difficulties</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>

          <div className="space-y-3 max-h-[620px] overflow-y-auto pr-1">
            {problems.map((prob) => {
              const isSelected = selectedProblem?.id === prob.id;

              return (
                <div
                  key={prob.id}
                  onClick={() => handleSelectProblem(prob)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all duration-200 ${
                    isSelected
                      ? 'bg-gradient-to-r from-purple-900/40 to-slate-800 border-purple-500 ring-2 ring-purple-500/30 text-white shadow-xl'
                      : 'bg-slate-800/80 border-slate-700/70 text-slate-300 hover:bg-slate-800 hover:border-slate-600'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <h4 className="font-bold text-sm text-white">{prob.title}</h4>
                    <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${
                      prob.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                      prob.difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'
                    }`}>
                      {prob.difficulty}
                    </span>
                  </div>
                  <p className="text-xs text-purple-400 font-semibold mt-1">{prob.topic}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Code Editor & Execution Sandbox (8 Cols) */}
        <div className="lg:col-span-8 bg-slate-800/90 border border-slate-700/90 rounded-3xl p-6 space-y-5 shadow-2xl flex flex-col justify-between">
          {selectedProblem ? (
            <>
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-700/80">
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-xl font-extrabold text-white">{selectedProblem.title}</h3>
                      <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                        selectedProblem.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                        selectedProblem.difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'
                      }`}>
                        {selectedProblem.difficulty}
                      </span>
                    </div>
                    <p className="text-xs text-purple-400 font-semibold mt-1">{selectedProblem.topic}</p>
                  </div>

                  <button
                    onClick={handleSubmitSolution}
                    disabled={submitting}
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold px-5 py-2.5 rounded-2xl transition flex items-center space-x-2 shadow-xl shadow-purple-600/30"
                  >
                    {submitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                    <span>{submitting ? 'Testing Code...' : 'Run & Execute Solution'}</span>
                  </button>
                </div>

                <div className="mt-4 text-xs text-slate-300 space-y-3 leading-relaxed">
                  <p className="text-slate-200">{selectedProblem.description}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                    {selectedProblem.example_input && (
                      <div className="bg-slate-900/90 p-3 rounded-2xl border border-slate-700/80 font-mono">
                        <span className="text-slate-400 font-bold block mb-1">Example Input:</span>
                        <code className="text-purple-300">{selectedProblem.example_input}</code>
                      </div>
                    )}
                    {selectedProblem.example_output && (
                      <div className="bg-slate-900/90 p-3 rounded-2xl border border-slate-700/80 font-mono">
                        <span className="text-slate-400 font-bold block mb-1">Expected Output:</span>
                        <code className="text-emerald-300">{selectedProblem.example_output}</code>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Python Code Editor Area */}
              <div className="space-y-2 pt-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
                    <Cpu className="w-4 h-4 text-purple-400" />
                    <span>Python Code Sandbox</span>
                  </label>
                  <span className="text-[11px] text-slate-500 font-mono">Python 3.10 Runtime</span>
                </div>

                <textarea
                  rows="11"
                  value={code}
                  onChange={e => setCode(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-2xl p-4 font-mono text-xs text-emerald-400 focus:outline-none focus:border-purple-500 leading-relaxed shadow-inner"
                />
              </div>

              {/* Execution Test Result Banner Console */}
              {result && (
                <div className={`p-5 rounded-2xl border text-xs font-mono space-y-2 animate-fadeIn ${
                  result.status === 'Solved'
                    ? 'bg-slate-950 border-emerald-500/50 text-emerald-400'
                    : 'bg-slate-950 border-amber-500/50 text-amber-400'
                }`}>
                  <div className="flex items-center justify-between font-sans border-b border-slate-800 pb-2">
                    <div className="flex items-center space-x-2 font-bold">
                      <CheckCircle2 className="w-5 h-5 shrink-0" />
                      <span>Status: {result.status} ({result.score}/100 Score)</span>
                    </div>
                    {result.execution_time_ms !== undefined && (
                      <span className="text-[11px] text-slate-400 font-mono">
                        Execution: {result.execution_time_ms}ms • {result.test_cases_passed}
                      </span>
                    )}
                  </div>
                  {result.output_preview && (
                    <div className="pt-1 text-[11px] text-slate-300">
                      <span className="text-slate-500 block text-[10px] uppercase font-sans">Execution Output Console:</span>
                      <code>{result.output_preview}</code>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="py-24 text-center text-slate-400 text-xs space-y-2">
              <Code2 className="w-10 h-10 mx-auto text-purple-400/60" />
              <p className="font-bold text-white text-sm">Select an Algorithm Problem</p>
              <p className="text-slate-400">Choose any problem from the left pane to open the Python sandbox editor.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
