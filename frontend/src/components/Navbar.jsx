import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Bell, LogOut, User, Sparkles, CheckCircle2 } from 'lucide-react';
import api from '../api/client';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [showNotifs, setShowNotifs] = useState(false);

  useEffect(() => {
    if (user) {
      api.get('/notifications/')
        .then(res => setNotifications(res.data.notifications || []))
        .catch(err => console.error(err));
    }
  }, [user]);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const markAsRead = (id) => {
    api.put(`/notifications/${id}/read`).then(() => {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    });
  };

  return (
    <header className="h-16 bg-slate-800/80 backdrop-blur border-b border-slate-700/60 sticky top-0 z-30 px-6 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <span className="font-bold text-lg text-white tracking-tight">
          AI Career<span className="text-blue-400">Pilot</span>
        </span>
      </div>

      <div className="flex items-center space-x-4">
        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifs(!showNotifs)}
            className="p-2 rounded-lg bg-slate-700/50 hover:bg-slate-700 text-slate-300 hover:text-white transition relative"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifs && (
            <div className="absolute right-0 mt-2 w-80 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-50 p-3">
              <div className="flex justify-between items-center pb-2 border-b border-slate-700">
                <span className="font-semibold text-sm text-slate-200">Notifications</span>
                <span className="text-xs text-slate-400">{notifications.length} total</span>
              </div>
              <div className="max-h-64 overflow-y-auto space-y-2 mt-2">
                {notifications.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-4">No notifications yet.</p>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => markAsRead(n.id)}
                      className={`p-2.5 rounded-lg border text-xs cursor-pointer transition ${
                        n.is_read ? 'bg-slate-900/40 border-slate-800 text-slate-400' : 'bg-slate-700/40 border-blue-500/40 text-slate-200 font-medium'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-blue-400">{n.title}</span>
                        {!n.is_read && <span className="w-2 h-2 rounded-full bg-blue-500"></span>}
                      </div>
                      <p className="mt-1 text-slate-300">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Info */}
        {user && (
          <div className="flex items-center space-x-3 border-l border-slate-700/60 pl-4">
            <div className="text-right">
              <p className="text-sm font-semibold text-white leading-tight">{user.name}</p>
              <p className="text-xs text-blue-400 capitalize font-medium">{user.role}</p>
            </div>
            <button
              onClick={logout}
              title="Logout"
              className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
