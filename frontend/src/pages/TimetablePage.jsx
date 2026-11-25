import React, { useState, useEffect } from 'react';
import { schedulesApi, timeSlotsApi, roomsApi, facultyApi } from '../api/endpoints';
import { Modal } from '../components/Modal';
import {
  CalendarDays,
  Edit2,
  AlertTriangle,
  CheckCircle,
  Building,
  GraduationCap,
  Users,
  Clock,
  RotateCw,
  FileDown,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

export const TimetablePage = ({ onNavigate }) => {
  const [schedules, setSchedules] = useState([]);
  const [selectedScheduleId, setSelectedScheduleId] = useState('');
  const [scheduleData, setScheduleData] = useState(null);
  const [items, setItems] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [facultyList, setFacultyList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [revalidating, setRevalidating] = useState(false);
  const [revalidationMessage, setRevalidationMessage] = useState(null);

  // Edit modal
  const [editingItem, setEditingItem] = useState(null);
  const [editFormData, setEditFormData] = useState({
    timeSlotId: '',
    roomId: '',
    facultyId: '',
  });

  // Filter view: 'GRID' | 'LIST'
  const [viewMode, setViewMode] = useState('GRID');

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [schedRes, slotsRes, roomsRes, facRes] = await Promise.all([
        schedulesApi.getAll(),
        timeSlotsApi.getAll(),
        roomsApi.getAll(),
        facultyApi.getAll(),
      ]);

      setSchedules(schedRes.data);
      setTimeSlots(slotsRes.data);
      setRooms(roomsRes.data);
      setFacultyList(facRes.data);

      if (schedRes.data.length > 0) {
        const firstId = schedRes.data[0].id;
        setSelectedScheduleId(firstId);
        await loadScheduleDetails(firstId);
      }
    } catch (err) {
      alert('Error loading timetable data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadScheduleDetails = async (scheduleId) => {
    try {
      const [sRes, itemsRes] = await Promise.all([
        schedulesApi.getById(scheduleId),
        schedulesApi.getItems(scheduleId),
      ]);
      setScheduleData(sRes.data);
      setItems(itemsRes.data);
    } catch (err) {
      console.error('Error fetching schedule details', err);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const handleScheduleChange = async (e) => {
    const id = e.target.value;
    setSelectedScheduleId(id);
    await loadScheduleDetails(id);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setEditFormData({
      timeSlotId: item.timeSlot?.id || '',
      roomId: item.room?.id || '',
      facultyId: item.faculty?.id || '',
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      setRevalidating(true);
      const res = await schedulesApi.editItem(selectedScheduleId, editingItem.id, {
        timeSlotId: editFormData.timeSlotId ? parseInt(editFormData.timeSlotId) : null,
        roomId: editFormData.roomId ? parseInt(editFormData.roomId) : null,
        facultyId: editFormData.facultyId ? parseInt(editFormData.facultyId) : null,
      });

      setEditingItem(null);
      await loadScheduleDetails(selectedScheduleId);

      const report = res.data.validationReport;
      if (report?.hardConflictCount > 0) {
        setRevalidationMessage({
          type: 'warning',
          text: `Manual change saved! Revalidation detected ${report.hardConflictCount} hard conflict(s). Please review!`,
        });
      } else {
        setRevalidationMessage({
          type: 'success',
          text: 'Manual change applied and revalidated successfully with 0 hard conflicts!',
        });
      }
      setTimeout(() => setRevalidationMessage(null), 5000);
    } catch (err) {
      alert('Error updating schedule item: ' + (err.response?.data?.error || err.message));
    } finally {
      setRevalidating(false);
    }
  };

  const handleRevalidate = async () => {
    if (!selectedScheduleId) return;
    setRevalidating(true);
    try {
      const res = await schedulesApi.revalidate(selectedScheduleId);
      await loadScheduleDetails(selectedScheduleId);
      const report = res.data.validationReport;
      setRevalidationMessage({
        type: report?.hardConflictCount === 0 ? 'success' : 'warning',
        text: `Schedule revalidated: ${report?.hardConflictCount || 0} hard conflicts, ${report?.softConflictCount || 0} soft conflicts.`,
      });
      setTimeout(() => setRevalidationMessage(null), 5000);
    } catch (err) {
      alert('Revalidation failed: ' + err.message);
    } finally {
      setRevalidating(false);
    }
  };

  // Group items by time slot for Grid View
  const slotMap = {};
  timeSlots.forEach((slot) => {
    slotMap[slot.id] = [];
  });
  items.forEach((item) => {
    if (item.timeSlot && slotMap[item.timeSlot.id]) {
      slotMap[item.timeSlot.id].push(item);
    }
  });

  return (
    <div className="p-8 space-y-6">
      {/* Title & Top Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Interactive Timetable Calendar & Editor</h2>
          <p className="text-xs text-slate-500 mt-1">
            Review allocations, edit slots/rooms/faculty, and automatically revalidate scheduling constraints
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Select schedule */}
          <select
            value={selectedScheduleId}
            onChange={handleScheduleChange}
            className="py-1.5 px-3 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-sm"
          >
            {schedules.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title} ({s.status})
              </option>
            ))}
          </select>

          <button
            onClick={handleRevalidate}
            disabled={revalidating}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold shadow-sm transition-colors"
          >
            <RotateCw className={`w-3.5 h-3.5 ${revalidating ? 'animate-spin' : ''}`} />
            <span>Revalidate Constraints</span>
          </button>

          <button
            onClick={() => onNavigate('publish')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span>Export / Publish</span>
          </button>
        </div>
      </div>

      {/* Revalidation Toast */}
      {revalidationMessage && (
        <div
          className={`p-3 rounded-lg border text-xs font-semibold flex items-center justify-between ${
            revalidationMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-amber-50 text-amber-800 border-amber-200 animate-pulse'
          }`}
        >
          <div className="flex items-center gap-2">
            {revalidationMessage.type === 'success' ? (
              <CheckCircle className="w-4 h-4 text-emerald-600" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-amber-600" />
            )}
            <span>{revalidationMessage.text}</span>
          </div>
          {revalidationMessage.type === 'warning' && (
            <button
              onClick={() => onNavigate('conflicts')}
              className="text-xs underline font-bold text-amber-900"
            >
              Inspect Conflict Report
            </button>
          )}
        </div>
      )}

      {/* Schedule Info Header */}
      {scheduleData && (
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Timetable</span>
              <h3 className="text-base font-bold text-slate-900">{scheduleData.title}</h3>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold ${
                scheduleData.status === 'PUBLISHED'
                  ? 'bg-emerald-100 text-emerald-800'
                  : scheduleData.status === 'FEASIBLE'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-rose-100 text-rose-800'
              }`}
            >
              {scheduleData.status}
            </span>
          </div>

          <div className="flex items-center gap-6 text-xs text-slate-600">
            <span>Academic Year: <strong className="text-slate-900">{scheduleData.academicYear}</strong></span>
            <span>Total Exams: <strong className="text-slate-900">{items.length}</strong></span>
            <span>
              Conflicts:{' '}
              <strong className={scheduleData.conflictCount > 0 ? 'text-rose-600' : 'text-emerald-600'}>
                {scheduleData.conflictCount}
              </strong>
            </span>
          </div>
        </div>
      )}

      {/* View Switcher: Grid vs List */}
      <div className="flex justify-end gap-2 text-xs">
        <button
          onClick={() => setViewMode('GRID')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
            viewMode === 'GRID' ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Calendar Grid View
        </button>
        <button
          onClick={() => setViewMode('LIST')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
            viewMode === 'LIST' ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Tabular List View
        </button>
      </div>

      {/* GRID VIEW */}
      {viewMode === 'GRID' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {timeSlots.map((slot) => {
            const slotItems = slotMap[slot.id] || [];
            return (
              <div
                key={slot.id}
                className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col"
              >
                {/* Slot Header */}
                <div className="bg-slate-800 text-white p-3.5 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold">{slot.slotName}</h4>
                    <p className="text-[11px] text-slate-300 flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3 text-blue-400" />
                      <span>{slot.examDate} ({slot.startTime} - {slot.endTime})</span>
                    </p>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-900 text-blue-200 border border-blue-700">
                    {slot.sessionType}
                  </span>
                </div>

                {/* Exams inside this Slot */}
                <div className="p-3.5 space-y-3 flex-1 bg-slate-50/50">
                  {slotItems.map((item) => {
                    const isConflict = item.status === 'CONFLICT';
                    return (
                      <div
                        key={item.id}
                        className={`p-3 rounded-lg border bg-white shadow-xs transition-all hover:shadow-md ${
                          isConflict ? 'border-rose-300 bg-rose-50/30 ring-1 ring-rose-400/30' : 'border-slate-200'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="font-mono font-bold text-xs text-blue-900 mr-1.5">
                              {item.examination.course?.code}
                            </span>
                            <span className="text-xs font-bold text-slate-900 block mt-0.5">
                              {item.examination.title}
                            </span>
                          </div>

                          <button
                            onClick={() => handleOpenEdit(item)}
                            className="p-1 text-slate-400 hover:text-blue-600 transition-colors"
                            title="Edit Assignment"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Room & Faculty details */}
                        <div className="mt-3 space-y-1.5 text-[11px] text-slate-600 pt-2 border-t border-slate-100">
                          <div className="flex items-center justify-between">
                            <span className="flex items-center gap-1 text-slate-500">
                              <Building className="w-3 h-3 text-slate-400" />
                              <span>Hall:</span>
                            </span>
                            <span className="font-semibold text-slate-900">
                              {item.room ? `${item.room.roomNumber} (Cap: ${item.room.capacity})` : 'UNASSIGNED'}
                            </span>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="flex items-center gap-1 text-slate-500">
                              <GraduationCap className="w-3 h-3 text-slate-400" />
                              <span>Invigilator:</span>
                            </span>
                            <span className="font-semibold text-slate-900 truncate max-w-[150px]">
                              {item.faculty ? item.faculty.name : 'UNASSIGNED'}
                            </span>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="flex items-center gap-1 text-slate-500">
                              <Users className="w-3 h-3 text-slate-400" />
                              <span>Registered:</span>
                            </span>
                            <span className="font-bold text-blue-800">
                              {item.studentCount} Students
                            </span>
                          </div>
                        </div>

                        {/* Conflict or alternative suggestion */}
                        {isConflict && item.conflictReason && (
                          <div className="mt-2.5 p-2 bg-rose-50 border border-rose-200 rounded text-[10px] text-rose-700">
                            <strong>Conflict:</strong> {item.conflictReason}
                            {item.alternativeSuggestion && (
                              <p className="mt-1 text-slate-600">
                                <strong>Suggested:</strong> {item.alternativeSuggestion}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {slotItems.length === 0 && (
                    <div className="py-8 text-center text-slate-400 text-xs">
                      No examinations assigned to this time slot.
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABULAR LIST VIEW */
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3">Exam Code</th>
                  <th className="px-5 py-3">Course Title</th>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Time Slot</th>
                  <th className="px-5 py-3">Assigned Room</th>
                  <th className="px-5 py-3 text-center">Strength</th>
                  <th className="px-5 py-3">Invigilator</th>
                  <th className="px-5 py-3 text-center">Status</th>
                  <th className="px-5 py-3 text-right">Edit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-3 font-mono font-bold text-blue-900">{item.examination.examCode}</td>
                    <td className="px-5 py-3 font-semibold text-slate-900">{item.examination.title}</td>
                    <td className="px-5 py-3 font-medium text-slate-700">
                      {item.timeSlot ? item.timeSlot.examDate : '-'}
                    </td>
                    <td className="px-5 py-3 text-slate-600">
                      {item.timeSlot ? item.timeSlot.slotName : 'UNASSIGNED'}
                    </td>
                    <td className="px-5 py-3 font-medium text-slate-800">
                      {item.room ? `${item.room.roomNumber} (Cap: ${item.room.capacity})` : '-'}
                    </td>
                    <td className="px-5 py-3 text-center font-bold text-blue-800">
                      {item.studentCount}
                    </td>
                    <td className="px-5 py-3 text-slate-700">
                      {item.faculty ? item.faculty.name : '-'}
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          item.status === 'SCHEDULED'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button
                        onClick={() => handleOpenEdit(item)}
                        className="p-1 text-slate-400 hover:text-blue-600 transition-colors"
                        title="Edit Item"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Manual Edit Assignment Modal */}
      <Modal
        isOpen={!!editingItem}
        onClose={() => setEditingItem(null)}
        title={`Edit Assignment: ${editingItem?.examination?.title}`}
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900">
            <strong>Instant Constraint Revalidation:</strong> Any changes made to time slot, room, or faculty will immediately trigger full validation checks for student overlaps, double-bookings, and room capacity violations.
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Time Slot</label>
            <select
              value={editFormData.timeSlotId}
              onChange={(e) => setEditFormData({ ...editFormData, timeSlotId: e.target.value })}
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
            >
              <option value="">-- Select Time Slot --</option>
              {timeSlots.map((ts) => (
                <option key={ts.id} value={ts.id}>
                  {ts.slotName} ({ts.examDate} • {ts.sessionType})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Examination Room</label>
            <select
              value={editFormData.roomId}
              onChange={(e) => setEditFormData({ ...editFormData, roomId: e.target.value })}
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
            >
              <option value="">-- Select Room --</option>
              {rooms.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.roomNumber} - {r.building} (Capacity: {r.capacity})
                </option>
              ))}
            </select>
            <p className="text-[10px] text-slate-500 mt-1">
              Required capacity for this examination: <strong>{editingItem?.studentCount || 0} seats</strong>
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Faculty Invigilator</label>
            <select
              value={editFormData.facultyId}
              onChange={(e) => setEditFormData({ ...editFormData, facultyId: e.target.value })}
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
            >
              <option value="">-- Select Faculty --</option>
              {facultyList.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name} ({f.department} • {f.facultyCode})
                </option>
              ))}
            </select>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setEditingItem(null)}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={revalidating}
              className="px-4 py-2 bg-blue-700 text-white rounded-lg text-xs font-semibold hover:bg-blue-800 disabled:opacity-50"
            >
              {revalidating ? 'Revalidating...' : 'Apply & Revalidate'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

