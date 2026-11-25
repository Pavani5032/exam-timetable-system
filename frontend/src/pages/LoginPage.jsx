import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, Lock, User, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const LoginPage = () => {
  const { login, loading } = useAuth();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const result = await login(username, password);
    if (!result.success) {
      setError(result.error || 'Authentication failed. Please verify credentials.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Banner */}
        <div className="bg-gradient-to-r from-blue-900 to-indigo-900 p-8 text-white text-center relative">
          <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl mx-auto flex items-center justify-center shadow-inner mb-4">
            <GraduationCap className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-xl font-bold tracking-tight">SIMATS ENGINEERING</h2>
          <p className="text-xs text-blue-200 mt-1">Saveetha Institute of Medical and Technical Sciences</p>
          <div className="inline-block mt-3 px-3 py-1 bg-blue-800/80 rounded-full text-[11px] font-semibold text-blue-100 border border-blue-700">
            Capstone Project Examination Portal
          </div>
        </div>

        {/* Form Body */}
        <div className="p-8">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-slate-900">Administrator Sign In</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Constraint-Based Timetable & Conflict-Free Resource Allocation
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Username
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  placeholder="Enter username"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter password"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div className="p-3 bg-blue-50/80 rounded-lg border border-blue-100 text-[11px] text-blue-900">
              <span className="font-bold">Default Demo Credentials:</span>
              <div className="flex justify-between mt-1 text-slate-600">
                <span>Username: <strong className="text-blue-950 font-mono">admin</strong></span>
                <span>Password: <strong className="text-blue-950 font-mono">admin123</strong></span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-2.5 px-4 bg-blue-700 hover:bg-blue-800 text-white font-semibold rounded-lg text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In to Dashboard'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-100 text-center text-[11px] text-slate-400">
            Department of Information Technology • Chennai – 602105
          </div>
        </div>
      </div>
    </div>
  );
};

