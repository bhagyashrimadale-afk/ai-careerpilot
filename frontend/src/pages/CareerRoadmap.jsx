import React, { useState, useEffect } from 'react';
import { Map, Sparkles, CheckCircle2, Clock, BookOpen, RefreshCw } from 'lucide-react';
import api from '../api/client';

export default function CareerRoadmap() {
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const loadRoadmap = () => {
    api.get('/roadmap/')
      .then(res => setRoadmap(res.data.roadmap))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadRoadmap();
  }, []);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const res = await api.post('/roadmap/generate', {});
      setRoadmap(res.data.roadmap);
    } catch (err) {
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  if (loading) return <div className="text-center py-12 text-slate-400">Loading AI career roadmap...</div>;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center space-x-2">
            <Map className="w-6 h-6 text-indigo-400" />
            <span>AI Placement & Career Roadmap</span>
          </h1>
          <p className="text-sm text-slate-400">Customized learning milestones tailored to your target role: <strong className="text-blue-400">{roadmap?.target_role || 'Full Stack Developer'}</strong></p>
        </div>

        <button
          onClick={handleGenerate}
          disabled={generating}
          className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition flex items-center space-x-1.5 shadow-lg shadow-indigo-600/30"
        >
          {generating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          <span>{generating ? 'Rebuilding AI Roadmap...' : 'Regenerate Roadmap'}</span>
        </button>
      </div>

      {/* Milestones Timeline List */}
      <div className="relative border-l-2 border-slate-700 pl-6 ml-4 space-y-8 py-2">
        {roadmap?.milestones?.map((step) => {
          const isCompleted = step.status === 'completed';
          return (
            <div key={step.step} className="relative">
              {/* Step Node Icon */}
              <div className={`absolute -left-[35px] top-0 w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-xs ${
                isCompleted
                  ? 'bg-emerald-500 border-emerald-400 text-slate-900 shadow-lg shadow-emerald-500/30'
                  : 'bg-slate-800 border-indigo-500 text-indigo-400'
              }`}>
                {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : step.step}
              </div>

              <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-base font-bold text-white">{step.title}</h3>
                    <p className="text-xs text-slate-300 mt-1">{step.description}</p>
                  </div>
                  <span className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-slate-900 text-slate-400 text-xs font-mono border border-slate-700">
                    <Clock className="w-3.5 h-3.5" />
                    <span>~{step.estimated_weeks} Weeks</span>
                  </span>
                </div>

                <div className="pt-2">
                  <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider block mb-1.5 flex items-center space-x-1">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Recommended Learning Modules</span>
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {step.recommended_topics?.map((topic, idx) => (
                      <span key={idx} className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 text-xs font-medium">
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
