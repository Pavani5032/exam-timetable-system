import React, { useState, useEffect } from 'react';
import { schedulesApi } from '../api/endpoints';
import {
  AlertTriangle,
  FileSpreadsheet,
  CheckCircle2,
  Users,
  Building,
  GraduationCap,
  ArrowRight,
  ShieldAlert,
  HelpCircle,
} from 'lucide-react';

export const ConflictsPage = ({ onNavigate }) => {
  const [schedules, setSchedules] = useState([]);
  const [selectedScheduleId, setSelectedScheduleId] = useState('');
  const [conflicts, setConflicts] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadSchedules = async () => {
    setLoading(true);
    try {
      const res = await schedulesApi.getAll();
      setSchedules(res.data);
      if (res.data.length > 0) {
        const firstId = res.data[0].id;
        setSelectedScheduleId(firstId);
        await loadConflicts(firstId);
      }
    } catch (err) {
      alert('Error fetching schedules: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadConflicts = async (scheduleId) => {
    try {
      const res = await schedulesApi.getConflicts(scheduleId);
      setConflicts(res.data);
    } catch (err) {
      console.error('Error fetching conflicts', err);
    }
  };

  useEffect(() => {
    loadSchedules();
  }, []);

  const handleScheduleChange = async (e) => {
    const id = e.target.value;
    setSelectedScheduleId(id);
    await loadConflicts(id);
  };

  const hardConflicts = conflicts.filter((c) => 'HARD'.equalsIgnoreCase(c.severity));
  const softConflicts = conflicts.filter((c) => 'SOFT'.equalsIgnoreCase(c.severity));

  const getConflictIcon = (type) => {
    switch (type) {
      case 'STUDENT_OVERLAP':
        return <Users className="w-5 h-5 text-rose-600" />;
      case 'ROOM_CAPACITY_EXCEEDED':
      case 'ROOM_DOUBLE_BOOKING':
        return <Building className="w-5 h-5 text-amber-600" />;
      case 'FACULTY_UNAVAILABLE':
      case 'FACULTY_OVERLAP':
        return <GraduationCap className="w-5 h-5 text-indigo-600" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-rose-600" />;
    }
  };

  const downloadConflictsCsv = () => {
    if (!selectedScheduleId) return;
    window.open(`http://localhost:8080/api/schedules/export/${selectedScheduleId}/conflicts-csv`, '_blank');
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Conflict Detection & Audit Reports</h2>
          <p className="text-xs text-slate-500 mt-1">
            Systematic audit of student clashes, room capacity violations, and faculty unavailabilities
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedScheduleId}
            onChange={handleScheduleChange}
            className="py-1.5 px-3 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 shadow-sm"
          >
            {schedules.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title} ({s.status})
              </option>
            ))}
          </select>

          <button
            onClick={downloadConflictsCsv}
            disabled={conflicts.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold shadow-sm transition-colors disabled:opacity-40"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
            <span>Export Conflicts CSV</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase">Total Detected Conflicts</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{conflicts.length}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Checked across all 5 hard constraints</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <p className="text-xs font-bold text-rose-600 uppercase">Hard Constraints Violations</p>
          <p className="text-2xl font-bold text-rose-700 mt-1">{hardConflicts.length}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Must be resolved prior to publishing</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <p className="text-xs font-bold text-amber-600 uppercase">Soft Constraints Advisory</p>
          <p className="text-2xl font-bold text-amber-700 mt-1">{softConflicts.length}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Recommendations for workload spacing</p>
        </div>
      </div>

      {/* Conflict Cards List */}
      <div className="space-y-4">
        {conflicts.map((conflict) => (
          <div
            key={conflict.id}
            className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-slate-50 rounded-lg border border-slate-200 shrink-0 mt-0.5">
                  {getConflictIcon(conflict.conflictType)}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase ${
                        'HARD'.equalsIgnoreCase(conflict.severity)
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {conflict.severity} CONFLICT
                    </span>
                    <span className="font-mono text-[11px] font-semibold text-slate-700">
                      {conflict.conflictType}
                    </span>
                    {conflict.timeSlot && (
                      <span className="text-[11px] text-slate-500">
                        • {conflict.timeSlot.slotName} ({conflict.timeSlot.examDate})
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">{conflict.description}</h4>
                </div>
              </div>
            </div>

            {/* Suggested Resolution Box */}
            {conflict.suggestedResolution && (
              <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-lg text-xs text-blue-950 flex items-start gap-2">
                <HelpCircle className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">System Recommended Action: </span>
                  <span>{conflict.suggestedResolution}</span>
                </div>
              </div>
            )}
          </div>
        ))}

        {conflicts.length === 0 && (
          <div className="bg-white rounded-xl border border-emerald-200 p-12 text-center shadow-sm space-y-3">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Zero Conflicts Detected!</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              All hard and soft scheduling constraints have been satisfied. The timetable is 100% conflict-free and ready for publication.
            </p>
            <button
              onClick={() => onNavigate('publish')}
              className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 bg-blue-700 text-white rounded-lg text-xs font-semibold shadow hover:bg-blue-800"
            >
              <span>Proceed to Publish Timetable</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

