import React, { useState, useEffect } from 'react';
import { Kanban, Sparkles, CheckCircle2, XCircle, Clock, FileText } from 'lucide-react';
import api from '../api/client';

const STAGES = [
  { key: 'Saved', title: 'Saved', color: 'border-slate-600 bg-slate-800/40 text-slate-300' },
  { key: 'Applied', title: 'Applied', color: 'border-blue-500/40 bg-blue-500/5 text-blue-400' },
  { key: 'Interview', title: 'Interviewing', color: 'border-amber-500/40 bg-amber-500/5 text-amber-400' },
  { key: 'Selected', title: 'Selected / Offer', color: 'border-emerald-500/40 bg-emerald-500/5 text-emerald-400' },
  { key: 'Rejected', title: 'Rejected', color: 'border-red-500/40 bg-red-500/5 text-red-400' }
];

export default function ApplicationTracker() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadApplications = () => {
    api.get('/jobs/applications')
      .then(res => setApplications(res.data.applications || []))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadApplications();
  }, []);

  const handleUpdateStatus = async (appId, newStatus) => {
    try {
      await api.put(`/jobs/application/${appId}/status`, { status: newStatus });
      loadApplications();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="text-center py-12 text-slate-400">Loading placement application tracker...</div>;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center space-x-2">
          <Kanban className="w-6 h-6 text-blue-400" />
          <span>Job Application Tracker</span>
        </h1>
        <p className="text-sm text-slate-400">Track placement drive progress across Saved, Applied, Interview, Selected, and Rejected pipeline</p>
      </div>

      {/* Kanban Board Grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 overflow-x-auto pb-4">
        {STAGES.map((stage) => {
          const stageApps = applications.filter(a => a.status === stage.key);

          return (
            <div key={stage.key} className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-4 flex flex-col justify-between min-h-[500px]">
              <div>
                <div className={`p-2.5 rounded-xl border mb-3 flex items-center justify-between font-bold text-xs ${stage.color}`}>
                  <span>{stage.title}</span>
                  <span className="w-5 h-5 rounded-full bg-slate-900 flex items-center justify-center text-[10px]">
                    {stageApps.length}
                  </span>
                </div>

                <div className="space-y-3">
                  {stageApps.map((app) => (
                    <div key={app.id} className="p-3.5 rounded-xl bg-slate-900 border border-slate-700 space-y-2 text-xs">
                      <div>
                        <h4 className="font-bold text-white text-xs">{app.job_title}</h4>
                        <p className="text-[11px] text-blue-400 font-semibold">{app.company}</p>
                      </div>

                      {app.ai_match_percentage > 0 && (
                        <div className="flex items-center space-x-1 font-bold text-emerald-400 text-[10px]">
                          <Sparkles className="w-3 h-3" />
                          <span>{app.ai_match_percentage}% AI Match</span>
                        </div>
                      )}

                      {app.notes && (
                        <p className="text-[11px] text-slate-400 line-clamp-2 bg-slate-950 p-1.5 rounded border border-slate-800">
                          {app.notes}
                        </p>
                      )}

                      {/* Quick Move Status Selector */}
                      <div className="pt-2 border-t border-slate-800">
                        <select
                          value={app.status}
                          onChange={(e) => handleUpdateStatus(app.id, e.target.value)}
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg py-1 px-1.5 text-[10px] text-slate-300 focus:outline-none"
                        >
                          <option value="Saved">Move to Saved</option>
                          <option value="Applied">Move to Applied</option>
                          <option value="Interview">Move to Interview</option>
                          <option value="Selected">Move to Selected</option>
                          <option value="Rejected">Move to Rejected</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
