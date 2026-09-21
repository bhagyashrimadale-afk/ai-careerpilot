import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/Login';
import Register from './pages/Register';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import ResumeAnalyzer from './pages/ResumeAnalyzer';
import JobMatcher from './pages/JobMatcher';
import DsaTracker from './pages/DsaTracker';
import AptitudeTests from './pages/AptitudeTests';
import MockInterview from './pages/MockInterview';
import CareerRoadmap from './pages/CareerRoadmap';
import ApplicationTracker from './pages/ApplicationTracker';

function Layout() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/landing" element={<Landing />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col text-slate-100">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6 overflow-y-auto">
          <Routes>
            <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute allowedRoles={['student']}><Profile /></ProtectedRoute>} />
            <Route path="/resume-analyzer" element={<ProtectedRoute allowedRoles={['student']}><ResumeAnalyzer /></ProtectedRoute>} />
            <Route path="/job-matcher" element={<ProtectedRoute><JobMatcher /></ProtectedRoute>} />
            <Route path="/dsa-practice" element={<ProtectedRoute allowedRoles={['student']}><DsaTracker /></ProtectedRoute>} />
            <Route path="/aptitude-tests" element={<ProtectedRoute allowedRoles={['student']}><AptitudeTests /></ProtectedRoute>} />
            <Route path="/mock-interview" element={<ProtectedRoute allowedRoles={['student']}><MockInterview /></ProtectedRoute>} />
            <Route path="/career-roadmap" element={<ProtectedRoute allowedRoles={['student']}><CareerRoadmap /></ProtectedRoute>} />
            <Route path="/application-tracker" element={<ProtectedRoute><ApplicationTracker /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout />
      </Router>
    </AuthProvider>
  );
}
