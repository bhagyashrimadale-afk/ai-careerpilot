import React, { useState, useEffect } from 'react';
import { User, Briefcase, GraduationCap, Code, Award, Plus, Trash2, Save, ExternalLink } from 'lucide-react';
import api from '../api/client';

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  // Form States for Modal/Inline add
  const [newSkill, setNewSkill] = useState({ name: '', level: 'Intermediate', category: 'Technical' });
  const [newEdu, setNewEdu] = useState({ institution: '', degree: 'B.Tech', field_of_study: 'Computer Science', start_year: '2022', end_year: '2026', grade: '' });
  const [newProj, setNewProj] = useState({ title: '', description: '', tech_stack: '', repo_url: '', live_url: '' });

  const loadProfile = () => {
    api.get('/profile/')
      .then(res => setProfile(res.data.profile))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleUpdateBasic = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/profile/', profile);
      setMessage('Profile updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleAddSkill = async (e) => {
    e.preventDefault();
    if (!newSkill.name) return;
    await api.post('/profile/skill', newSkill);
    setNewSkill({ name: '', level: 'Intermediate', category: 'Technical' });
    loadProfile();
  };

  const handleDeleteSkill = async (id) => {
    await api.delete(`/profile/skill/${id}`);
    loadProfile();
  };

  const handleAddEdu = async (e) => {
    e.preventDefault();
    if (!newEdu.institution) return;
    await api.post('/profile/education', newEdu);
    setNewEdu({ institution: '', degree: 'B.Tech', field_of_study: 'Computer Science', start_year: '2022', end_year: '2026', grade: '' });
    loadProfile();
  };

  const handleDeleteEdu = async (id) => {
    await api.delete(`/profile/education/${id}`);
    loadProfile();
  };

  const handleAddProj = async (e) => {
    e.preventDefault();
    if (!newProj.title) return;
    await api.post('/profile/project', newProj);
    setNewProj({ title: '', description: '', tech_stack: '', repo_url: '', live_url: '' });
    loadProfile();
  };

  const handleDeleteProj = async (id) => {
    await api.delete(`/profile/project/${id}`);
    loadProfile();
  };

  if (loading) {
    return <div className="text-center py-12 text-slate-400">Loading student profile...</div>;
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Student Placement Profile</h1>
          <p className="text-sm text-slate-400">Manage skills, education, projects, and target role</p>
        </div>
        {message && (
          <span className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            {message}
          </span>
        )}
      </div>

      {/* Basic Bio & Role Form */}
      <form onSubmit={handleUpdateBasic} className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center space-x-2 border-b border-slate-700 pb-3">
          <User className="w-5 h-5 text-blue-400" />
          <span>Basic Overview</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Headline</label>
            <input
              type="text"
              value={profile?.headline || ''}
              onChange={e => setProfile({ ...profile, headline: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2 px-3 text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Target Job Role</label>
            <input
              type="text"
              value={profile?.target_role || ''}
              onChange={e => setProfile({ ...profile, target_role: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2 px-3 text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">GitHub URL</label>
            <input
              type="url"
              value={profile?.github_url || ''}
              onChange={e => setProfile({ ...profile, github_url: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2 px-3 text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">LinkedIn URL</label>
            <input
              type="url"
              value={profile?.linkedin_url || ''}
              onChange={e => setProfile({ ...profile, linkedin_url: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2 px-3 text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Bio Summary</label>
          <textarea
            rows="3"
            value={profile?.bio || ''}
            onChange={e => setProfile({ ...profile, bio: e.target.value })}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2 px-3 text-sm text-white focus:outline-none focus:border-blue-500"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm px-5 py-2 rounded-xl transition flex items-center space-x-2"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving...' : 'Save Overview'}</span>
        </button>
      </form>

      {/* Skills Section */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center space-x-2 border-b border-slate-700 pb-3">
          <Code className="w-5 h-5 text-purple-400" />
          <span>Skills & Competencies</span>
        </h2>

        <div className="flex flex-wrap gap-2">
          {profile?.skills?.map((skill) => (
            <span
              key={skill.id}
              className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-medium text-slate-200"
            >
              <span>{skill.name}</span>
              <span className="text-blue-400 font-semibold text-[10px]">({skill.level})</span>
              <button onClick={() => handleDeleteSkill(skill.id)} className="text-slate-500 hover:text-red-400">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </span>
          ))}
        </div>

        <form onSubmit={handleAddSkill} className="flex items-center space-x-3 pt-2">
          <input
            type="text"
            placeholder="Skill Name (e.g. React, Python)"
            value={newSkill.name}
            onChange={e => setNewSkill({ ...newSkill, name: e.target.value })}
            className="bg-slate-900 border border-slate-700 rounded-xl py-2 px-3 text-sm text-white focus:outline-none focus:border-blue-500 flex-1"
          />
          <select
            value={newSkill.level}
            onChange={e => setNewSkill({ ...newSkill, level: e.target.value })}
            className="bg-slate-900 border border-slate-700 rounded-xl py-2 px-3 text-sm text-white focus:outline-none"
          >
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>
          <button
            type="submit"
            className="bg-slate-700 hover:bg-slate-600 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition flex items-center space-x-1"
          >
            <Plus className="w-4 h-4" />
            <span>Add</span>
          </button>
        </form>
      </div>

      {/* Projects Section */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center space-x-2 border-b border-slate-700 pb-3">
          <Briefcase className="w-5 h-5 text-emerald-400" />
          <span>Key Projects</span>
        </h2>

        <div className="space-y-3">
          {profile?.projects?.map((proj) => (
            <div key={proj.id} className="p-4 rounded-xl bg-slate-900/60 border border-slate-700/60 flex items-start justify-between">
              <div>
                <h3 className="font-bold text-white text-sm">{proj.title}</h3>
                <p className="text-xs text-slate-300 mt-1">{proj.description}</p>
                <p className="text-xs text-blue-400 mt-1 font-mono">Tech Stack: {proj.tech_stack}</p>
              </div>
              <button onClick={() => handleDeleteProj(proj.id)} className="text-slate-500 hover:text-red-400 p-1">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        <form onSubmit={handleAddProj} className="space-y-3 pt-2">
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Project Title"
              value={newProj.title}
              onChange={e => setNewProj({ ...newProj, title: e.target.value })}
              className="bg-slate-900 border border-slate-700 rounded-xl py-2 px-3 text-sm text-white focus:outline-none"
            />
            <input
              type="text"
              placeholder="Tech Stack (e.g. React, Flask, MySQL)"
              value={newProj.tech_stack}
              onChange={e => setNewProj({ ...newProj, tech_stack: e.target.value })}
              className="bg-slate-900 border border-slate-700 rounded-xl py-2 px-3 text-sm text-white focus:outline-none"
            />
          </div>
          <textarea
            placeholder="Project Description"
            rows="2"
            value={newProj.description}
            onChange={e => setNewProj({ ...newProj, description: e.target.value })}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2 px-3 text-sm text-white focus:outline-none"
          />
          <button
            type="submit"
            className="bg-slate-700 hover:bg-slate-600 text-white font-semibold text-xs px-4 py-2 rounded-xl transition flex items-center space-x-1"
          >
            <Plus className="w-4 h-4" />
            <span>Add Project</span>
          </button>
        </form>
      </div>
    </div>
  );
}
