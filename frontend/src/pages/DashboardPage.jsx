import React, { useEffect, useState } from 'react';
import { dashboardApi } from '../api/endpoints';
import { StatCard } from '../components/StatCard';
import {
  Users,
  BookOpen,
  Layers,
  Building,
  GraduationCap,
  CalendarCheck,
  AlertTriangle,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Activity,
  FileText,
} from 'lucide-react';

export const DashboardPage = ({ onNavigate }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await dashboardApi.getStats();
      setStats(res.data);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to fetch dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-medium text-slate-600">Loading university examination statistics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-sm">
          {error}
        </div>
      </div>
    );
  }

  const latestSchedule = stats?.latestSchedule;
  const hardConflicts = stats?.hardConflicts || 0;
  const isHealthy = hardConflicts === 0 && latestSchedule?.status !== 'CONFLICT_DETECTED';

  return (
    <div className="p-8 space-y-8">
      {/* Page Title & System Status Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">University Examination Dashboard</h2>
          <p className="text-xs text-slate-500 mt-1">
            Real-time constraint tracking, resource utilization, and graph coloring status
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${
              isHealthy
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                : 'bg-rose-100 text-rose-800 border border-rose-200 animate-pulse'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>{isHealthy ? 'System Status: Optimal' : `Attention: ${hardConflicts} Hard Conflicts`}</span>
          </span>

          <button
            onClick={() => onNavigate('generator')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Generate Schedule (DSATUR)</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Registered Students"
          value={stats?.totalStudents || 0}
          subtitle="Enrolled across IT & CSE"
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Active Courses"
          value={stats?.totalCourses || 0}
          subtitle="UG Degree Curriculum"
          icon={BookOpen}
          color="indigo"
        />
        <StatCard
          title="Examinations"
          value={stats?.totalExaminations || 0}
          subtitle="Courses requiring slots"
          icon={Layers}
          color="purple"
        />
        <StatCard
          title="Active Exam Halls"
          value={`${stats?.activeRooms || 0} / ${stats?.totalRooms || 0}`}
          subtitle="Total Seating Capacity"
          icon={Building}
          color="emerald"
        />
      </div>

      {/* Secondary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Faculty Invigilators"
          value={stats?.totalFaculty || 0}
          subtitle="Available teaching staff"
          icon={GraduationCap}
          color="blue"
        />
        <StatCard
          title="Available Time Slots"
          value={stats?.totalTimeSlots || 0}
          subtitle="Forenoon & Afternoon"
          icon={Clock}
          color="indigo"
        />
        <StatCard
          title="Active Conflicts"
          value={stats?.activeConflicts || 0}
          subtitle={`${hardConflicts} Hard / ${stats?.softConflicts || 0} Soft`}
          icon={AlertTriangle}
          color={hardConflicts > 0 ? 'rose' : 'emerald'}
        />
        <StatCard
          title="Timetable Status"
          value={latestSchedule?.status || 'NOT_GENERATED'}
          subtitle={`Published: ${stats?.publishedSchedules || 0} schedules`}
          icon={CalendarCheck}
          color={latestSchedule?.status === 'PUBLISHED' ? 'emerald' : 'amber'}
        />
      </div>

      {/* Middle Row: Latest Schedule Overview & Conflict Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Latest Schedule Card */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Current Examination Schedule</h3>
              <p className="text-xs text-slate-500">
                {latestSchedule ? latestSchedule.title : 'No timetable schedule generated yet'}
              </p>
            </div>
            {latestSchedule && (
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold ${
                  latestSchedule.status === 'PUBLISHED'
                    ? 'bg-emerald-100 text-emerald-800'
                    : latestSchedule.status === 'FEASIBLE'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-rose-100 text-rose-800'
                }`}
              >
                {latestSchedule.status}
              </span>
            )}
          </div>

          {latestSchedule ? (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-500 font-medium">Total Exams</p>
                  <p className="text-xl font-bold text-slate-900 mt-1">{latestSchedule.totalExams}</p>
                </div>
                <div className="p-3 bg-emerald-50 rounded-lg">
                  <p className="text-xs text-emerald-700 font-medium">Scheduled Successfully</p>
                  <p className="text-xl font-bold text-emerald-700 mt-1">{latestSchedule.scheduledExams}</p>
                </div>
                <div className="p-3 bg-rose-50 rounded-lg">
                  <p className="text-xs text-rose-700 font-medium">Detected Conflicts</p>
                  <p className="text-xl font-bold text-rose-700 mt-1">{latestSchedule.conflictCount}</p>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-700">
                <p className="font-semibold text-slate-900 mb-1">Algorithm Summary:</p>
                <p>{latestSchedule.summary || 'DSATUR graph-colouring executed with constraint verification.'}</p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => onNavigate('timetable')}
                  className="flex-1 py-2 px-3 bg-blue-700 hover:bg-blue-800 text-white font-medium rounded-lg text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <span>View Timetable Calendar</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onNavigate('conflicts')}
                  className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium rounded-lg text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  <span>Audit Conflicts ({latestSchedule.conflictCount})</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center space-y-3">
              <p className="text-sm text-slate-500">No schedule generated yet.</p>
              <button
                onClick={() => onNavigate('generator')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold"
              >
                Generate First Schedule Now
              </button>
            </div>
          )}
        </div>

        {/* Room Capacity Tiers & Department Breakdown */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-3">Room Capacity Tiers</h3>
            <div className="space-y-2.5">
              {Object.entries(stats?.roomCapacityTiers || {}).map(([tier, count]) => (
                <div key={tier} className="flex items-center justify-between text-xs">
                  <span className="text-slate-600 font-medium">{tier}</span>
                  <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                    {count} Rooms
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 mb-3">Department Enrollments</h3>
            <div className="space-y-2.5">
              {Object.entries(stats?.studentsByDept || {}).map(([dept, count]) => (
                <div key={dept} className="flex items-center justify-between text-xs">
                  <span className="text-slate-600 font-medium truncate max-w-[160px]">{dept}</span>
                  <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                    {count} Students
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent System Audit Feed */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-700" />
            <h3 className="text-sm font-bold text-slate-900">Recent System Audit Log</h3>
          </div>
          <span className="text-xs text-slate-400">Live backend event trail</span>
        </div>

        <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto">
          {(stats?.recentAuditLogs || []).map((log) => (
            <div key={log.id} className="py-2.5 flex items-start justify-between text-xs">
              <div className="space-y-0.5">
                <span className="font-semibold text-slate-800 font-mono text-[11px] bg-slate-100 px-1.5 py-0.5 rounded">
                  {log.action}
                </span>
                <p className="text-slate-600 mt-1">{log.details}</p>
              </div>
              <div className="text-right text-[10px] text-slate-400 shrink-0 ml-4">
                <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                <p className="text-slate-500 font-medium">{log.performedBy}</p>
              </div>
            </div>
          ))}
          {(!stats?.recentAuditLogs || stats.recentAuditLogs.length === 0) && (
            <p className="text-xs text-slate-400 py-3 text-center">No recent activity recorded.</p>
          )}
        </div>
      </div>
    </div>
  );
};

