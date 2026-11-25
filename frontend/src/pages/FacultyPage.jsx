import React, { useState, useEffect } from 'react';
import { facultyApi, timeSlotsApi } from '../api/endpoints';
import { Modal } from '../components/Modal';
import { GraduationCap, Plus, Search, Trash2, Edit2, CalendarX, AlertCircle, CheckCircle } from 'lucide-react';

export const FacultyPage = () => {
  const [facultyList, setFacultyList] = useState([]);
  const [unavailabilities, setUnavailabilities] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('ROSTER'); // 'ROSTER' | 'UNAVAILABILITY'

  // Faculty modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState(null);
  const [formData, setFormData] = useState({
    facultyCode: '',
    name: '',
    department: 'Information Technology',
    designation: 'Professor',
    email: '',
    phone: '',
    maxInvigilationPerDay: 2,
  });

  // Leave / Unavailability modal
  const [leaveModalOpen, setLeaveModalOpen] = useState(false);
  const [leaveFormData, setLeaveFormData] = useState({
    facultyId: '',
    unavailableDate: '2026-11-25',
    timeSlotId: '',
    reason: '',
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [fRes, uRes, tRes] = await Promise.all([
        facultyApi.getAll(),
        facultyApi.getUnavailabilities(),
        timeSlotsApi.getAll(),
      ]);
      setFacultyList(fRes.data);
      setUnavailabilities(uRes.data);
      setTimeSlots(tRes.data);
    } catch (err) {
      alert('Error fetching faculty records: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAddFaculty = () => {
    setEditingFaculty(null);
    setFormData({
      facultyCode: '',
      name: '',
      department: 'Information Technology',
      designation: 'Professor',
      email: '',
      phone: '',
      maxInvigilationPerDay: 2,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditFaculty = (fac) => {
    setEditingFaculty(fac);
    setFormData({
      facultyCode: fac.facultyCode,
      name: fac.name,
      department: fac.department,
      designation: fac.designation,
      email: fac.email,
      phone: fac.phone || '',
      maxInvigilationPerDay: fac.maxInvigilationPerDay,
    });
    setIsModalOpen(true);
  };

  const handleFacultySubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingFaculty) {
        await facultyApi.update(editingFaculty.id, formData);
      } else {
        await facultyApi.create(formData);
      }
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      alert('Error saving faculty: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleDeleteFaculty = async (id) => {
    if (window.confirm('Delete faculty member and their availability records?')) {
      try {
        await facultyApi.delete(id);
        loadData();
      } catch (err) {
        alert('Delete failed: ' + err.message);
      }
    }
  };

  const handleLeaveSubmit = async (e) => {
    e.preventDefault();
    try {
      await facultyApi.addUnavailability({
        facultyId: leaveFormData.facultyId,
        unavailableDate: leaveFormData.unavailableDate,
        timeSlotId: leaveFormData.timeSlotId ? leaveFormData.timeSlotId : null,
        reason: leaveFormData.reason,
      });
      setLeaveModalOpen(false);
      loadData();
    } catch (err) {
      alert('Error adding unavailability record: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleDeleteUnavailability = async (id) => {
    if (window.confirm('Remove this unavailability record?')) {
      try {
        await facultyApi.deleteUnavailability(id);
        loadData();
      } catch (err) {
        alert('Failed to remove record: ' + err.message);
      }
    }
  };

  const filteredFaculty = facultyList.filter((f) =>
    f.name.toLowerCase().includes(search.toLowerCase()) ||
    f.facultyCode.toLowerCase().includes(search.toLowerCase()) ||
    f.department.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Faculty & Invigilation Management</h2>
          <p className="text-xs text-slate-500 mt-1">
            Maintain teaching staff, invigilator workloads, and official leave/unavailability schedules
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setLeaveFormData({
                facultyId: facultyList[0]?.id || '',
                unavailableDate: '2026-11-25',
                timeSlotId: '',
                reason: '',
              });
              setLeaveModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 rounded-lg text-xs font-semibold shadow-sm transition-colors"
          >
            <CalendarX className="w-4 h-4 text-amber-600" />
            <span>Record Leave / Block Slot</span>
          </button>
          <button
            onClick={handleOpenAddFaculty}
            className="flex items-center gap-2 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Faculty</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-6 text-xs font-bold">
        <button
          onClick={() => setActiveTab('ROSTER')}
          className={`pb-3 transition-colors ${
            activeTab === 'ROSTER'
              ? 'text-blue-700 border-b-2 border-blue-700'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Faculty Roster ({facultyList.length})
        </button>
        <button
          onClick={() => setActiveTab('UNAVAILABILITY')}
          className={`pb-3 flex items-center gap-1.5 transition-colors ${
            activeTab === 'UNAVAILABILITY'
              ? 'text-blue-700 border-b-2 border-blue-700'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <span>Leave & Unavailabilities</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-amber-100 text-amber-800 font-bold">
            {unavailabilities.length}
          </span>
        </button>
      </div>

      {activeTab === 'ROSTER' ? (
        <>
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex items-center justify-between">
            <div className="relative w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search faculty name or code..."
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
            <span className="text-xs font-semibold text-slate-500">
              Total Faculty: {facultyList.length}
            </span>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="px-5 py-3">Faculty Code</th>
                    <th className="px-5 py-3">Full Name</th>
                    <th className="px-5 py-3">Designation</th>
                    <th className="px-5 py-3">Department</th>
                    <th className="px-5 py-3">Email</th>
                    <th className="px-5 py-3 text-center">Daily Limit</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredFaculty.map((f) => (
                    <tr key={f.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-5 py-3 font-mono font-bold text-blue-900">{f.facultyCode}</td>
                      <td className="px-5 py-3 font-semibold text-slate-900">{f.name}</td>
                      <td className="px-5 py-3 text-slate-600 font-medium">{f.designation}</td>
                      <td className="px-5 py-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-800 border border-blue-200">
                          {f.department}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-slate-500">{f.email}</td>
                      <td className="px-5 py-3 text-center">
                        <span className="font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                          {f.maxInvigilationPerDay} per day
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right space-x-2">
                        <button
                          onClick={() => handleOpenEditFaculty(f)}
                          className="p-1 text-slate-400 hover:text-blue-600 transition-colors"
                          title="Edit Faculty"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteFaculty(f.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                          title="Delete Faculty"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredFaculty.length === 0 && (
                    <tr>
                      <td colSpan="7" className="text-center py-8 text-slate-400">
                        No faculty records found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        /* Unavailabilities Table */
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 bg-amber-50/60 border-b border-amber-100 flex items-center gap-2 text-xs text-amber-900 font-medium">
            <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
            <span>
              Recorded unavailability prevents the DSATUR engine and constraint validator from assigning faculty to overlapping time slots.
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3">Faculty Member</th>
                  <th className="px-5 py-3">Department</th>
                  <th className="px-5 py-3">Unavailable Date</th>
                  <th className="px-5 py-3">Blocked Slot</th>
                  <th className="px-5 py-3">Reason</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {unavailabilities.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-3 font-semibold text-slate-900">
                      {u.faculty?.name}
                      <span className="block text-[10px] font-mono text-slate-400">{u.faculty?.facultyCode}</span>
                    </td>
                    <td className="px-5 py-3 text-slate-600">{u.faculty?.department}</td>
                    <td className="px-5 py-3 font-mono font-bold text-slate-700">{u.unavailableDate}</td>
                    <td className="px-5 py-3">
                      <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-800">
                        {u.timeSlot ? u.timeSlot.slotName : 'ALL DAY (Full Shift)'}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-slate-600 italic">
                      {u.reason || 'Leave / University Duty'}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button
                        onClick={() => handleDeleteUnavailability(u.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                        title="Remove Unavailability"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {unavailabilities.length === 0 && (
                  <tr>
                    <td colSpan="6" className="text-center py-8 text-slate-400">
                      No leave or unavailability records registered. All faculty members are fully available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Faculty Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingFaculty ? 'Edit Faculty Details' : 'Add Faculty Member'}
      >
        <form onSubmit={handleFacultySubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Faculty Code</label>
            <input
              type="text"
              required
              value={formData.facultyCode}
              onChange={(e) => setFormData({ ...formData, facultyCode: e.target.value.toUpperCase() })}
              placeholder="e.g. FAC-IT-01"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono uppercase"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Full Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Dr. Charlyn Pusha Latha"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Department</label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
              >
                <option value="Information Technology">Information Technology</option>
                <option value="Computer Science & Engineering">Computer Science & Engineering</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Designation</label>
              <select
                value={formData.designation}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
              >
                <option value="Professor">Professor</option>
                <option value="Associate Professor">Associate Professor</option>
                <option value="Assistant Professor">Assistant Professor</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Email Address</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="e.g. charlyn@saveetha.ac.in"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Contact Phone</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="e.g. 9840123456"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Max Daily Duties</label>
              <input
                type="number"
                min="1"
                max="3"
                required
                value={formData.maxInvigilationPerDay}
                onChange={(e) => setFormData({ ...formData, maxInvigilationPerDay: parseInt(e.target.value) || 1 })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-700 text-white rounded-lg text-xs font-semibold hover:bg-blue-800"
            >
              Save Faculty
            </button>
          </div>
        </form>
      </Modal>

      {/* Record Leave Modal */}
      <Modal
        isOpen={leaveModalOpen}
        onClose={() => setLeaveModalOpen(false)}
        title="Record Faculty Leave / Unavailability"
      >
        <form onSubmit={handleLeaveSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Faculty Member</label>
            <select
              value={leaveFormData.facultyId}
              onChange={(e) => setLeaveFormData({ ...leaveFormData, facultyId: e.target.value })}
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
            >
              <option value="">-- Select Faculty --</option>
              {facultyList.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name} ({f.facultyCode} • {f.department})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Unavailable Date</label>
              <input
                type="date"
                required
                value={leaveFormData.unavailableDate}
                onChange={(e) => setLeaveFormData({ ...leaveFormData, unavailableDate: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Time Slot (Optional)</label>
              <select
                value={leaveFormData.timeSlotId}
                onChange={(e) => setLeaveFormData({ ...leaveFormData, timeSlotId: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
              >
                <option value="">-- All Day (Full Shift) --</option>
                {timeSlots.map((ts) => (
                  <option key={ts.id} value={ts.id}>
                    {ts.slotName} ({ts.examDate})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Reason / Notes</label>
            <input
              type="text"
              required
              value={leaveFormData.reason}
              onChange={(e) => setLeaveFormData({ ...leaveFormData, reason: e.target.value })}
              placeholder="e.g. Attending Doctoral Committee Meeting"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setLeaveModalOpen(false)}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-amber-700 text-white rounded-lg text-xs font-semibold hover:bg-amber-800"
            >
              Record Leave
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

