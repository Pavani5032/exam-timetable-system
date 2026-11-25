import React from 'react';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Calendar,
  Layers,
  GraduationCap,
  Sliders,
  Cpu,
  CalendarDays,
  AlertTriangle,
  UploadCloud,
  CheckCircle2,
} from 'lucide-react';

export const Sidebar = ({ activeTab, onSelectTab, conflictCount = 0 }) => {
  const menuSections = [
    {
      title: 'OVERVIEW',
      items: [
        { id: 'dashboard', label: 'Admin Dashboard', icon: LayoutDashboard },
      ],
    },
    {
      title: 'MODULE 1: DATA MANAGEMENT',
      items: [
        { id: 'students', label: 'Students & Enrollment', icon: Users },
        { id: 'courses', label: 'Courses Management', icon: BookOpen },
        { id: 'examinations', label: 'Examinations', icon: Layers },
        { id: 'rooms', label: 'Rooms & Seating', icon: Layers },
        { id: 'faculty', label: 'Faculty & Availability', icon: GraduationCap },
        { id: 'constraints', label: 'Scheduling Constraints', icon: Sliders },
      ],
    },
    {
      title: 'MODULE 2: AUTOMATION',
      items: [
        { id: 'generator', label: 'Timetable Generator (DSATUR)', icon: Cpu, badge: 'AI/Graph' },
      ],
    },
    {
      title: 'MODULE 3: TIMETABLE & REPORTS',
      items: [
        { id: 'timetable', label: 'Timetable Calendar & Editor', icon: CalendarDays },
        {
          id: 'conflicts',
          label: 'Conflict Audit & Reports',
          icon: AlertTriangle,
          badgeCount: conflictCount > 0 ? conflictCount : null,
          badgeColor: 'bg-rose-500',
        },
        { id: 'publish', label: 'Publish & Export (PDF/CSV)', icon: UploadCloud },
      ],
    },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 border-r border-slate-800 min-h-screen">
      {/* College Capstone Header */}
      <div className="p-4 border-b border-slate-800">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-md bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow">
            SE
          </div>
          <div>
            <h2 className="text-xs font-bold text-white uppercase tracking-wider">SIMATS Examination</h2>
            <p className="text-[10px] text-blue-400 font-medium">B.Tech IT Capstone 2026</p>
          </div>
        </div>
      </div>

      {/* Menu links */}
      <div className="flex-1 py-4 px-3 space-y-6 overflow-y-auto">
        {menuSections.map((section, idx) => (
          <div key={idx} className="space-y-1">
            <h3 className="px-3 text-[10px] font-bold text-slate-400 tracking-wider uppercase">
              {section.title}
            </h3>
            <div className="space-y-0.5 pt-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onSelectTab(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-blue-600 text-white font-semibold shadow-sm'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5 truncate">
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                      <span className="truncate">{item.label}</span>
                    </div>

                    {item.badge && (
                      <span className="text-[9px] px-1.5 py-0.5 font-bold rounded bg-blue-900 text-blue-200">
                        {item.badge}
                      </span>
                    )}

                    {item.badgeCount && (
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full text-white ${
                          item.badgeColor || 'bg-blue-600'
                        }`}
                      >
                        {item.badgeCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Team footer */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/60 text-[11px] text-slate-400">
        <p className="font-semibold text-slate-300">Capstone Project Team:</p>
        <p className="text-[10px] text-slate-400 truncate">M. Thanuja • Sai Pavani • Varshini</p>
        <p className="text-[9px] text-slate-400 mt-0.5">Guide: Dr. Charlyn Pusha Latha</p>
      </div>
    </aside>
  );
};

