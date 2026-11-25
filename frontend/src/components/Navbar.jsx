import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, RotateCcw, AlertTriangle, ShieldCheck, GraduationCap, CheckCircle } from 'lucide-react';
import { demoApi } from '../api/endpoints';

export const Navbar = ({ onResetData, activeConflicts = 0 }) => {
  const { user, logout } = useAuth();
  const [resetting, setResetting] = useState(false);
  const [message, setMessage] = useState(null);

  const handleReset = async () => {
    if (window.confirm('Reset all records and reseed realistic demo data for SIMATS Engineering?')) {
      setResetting(true);
      try {
        await demoApi.reset();
        setMessage('Database reset and seeded with realistic demo data!');
        setTimeout(() => setMessage(null), 3000);
        if (onResetData) onResetData();
      } catch (err) {
        alert('Failed to reset demo data: ' + err.message);
      } finally {
        setResetting(false);
      }
    }
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
      <div className="px-6 py-3.5 flex items-center justify-between">
        {/* Left branding */}
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-700 to-indigo-900 rounded-lg flex items-center justify-center text-white shadow-md">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span>SIMATS ENGINEERING</span>
              <span className="text-xs px-2 py-0.5 font-semibold bg-blue-100 text-blue-800 rounded-full">Saveetha</span>
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Constraint-Based Examination Timetable & Resource Allocation System
            </p>
          </div>
        </div>

        {/* Center message if any */}
        {message && (
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-md animate-pulse">
            <CheckCircle className="w-4 h-4" />
            {message}
          </div>
        )}

        {/* Right controls */}
        <div className="flex items-center space-x-4">
          {activeConflicts > 0 && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium rounded-md animate-pulse">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{activeConflicts} Conflicts Detected</span>
            </div>
          )}

          <button
            onClick={handleReset}
            disabled={resetting}
            title="Reset database to realistic SIMATS sample data"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition-colors"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${resetting ? 'animate-spin' : ''}`} />
            <span>{resetting ? 'Resetting...' : 'Reset Demo Data'}</span>
          </button>

          <div className="h-5 w-px bg-slate-200" />

          {/* User profile */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-blue-700 text-white flex items-center justify-center font-bold text-xs shadow-sm">
              {user?.fullName?.charAt(0) || 'A'}
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-xs font-semibold text-slate-800 leading-tight">{user?.fullName || 'Administrator'}</p>
              <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">{user?.role?.replace('ROLE_', '') || 'ADMIN'}</p>
            </div>
            <button
              onClick={logout}
              title="Logout"
              className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

