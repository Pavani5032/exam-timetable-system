import React, { useState, useEffect } from 'react';
import { roomsApi } from '../api/endpoints';
import { Modal } from '../components/Modal';
import { Building, Plus, Search, Trash2, Edit2, Users, CheckCircle2, XCircle } from 'lucide-react';

export const RoomsPage = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [formData, setFormData] = useState({
    roomNumber: '',
    building: 'Academic Block A',
    capacity: 40,
    roomType: 'LECTURE_HALL',
    hasProjector: true,
    isActive: true,
  });

  const loadRooms = async () => {
    setLoading(true);
    try {
      const res = await roomsApi.getAll();
      setRooms(res.data);
    } catch (err) {
      alert('Error fetching rooms: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRooms();
  }, []);

  const handleOpenAdd = () => {
    setEditingRoom(null);
    setFormData({
      roomNumber: '',
      building: 'Academic Block A',
      capacity: 40,
      roomType: 'LECTURE_HALL',
      hasProjector: true,
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (room) => {
    setEditingRoom(room);
    setFormData({
      roomNumber: room.roomNumber,
      building: room.building,
      capacity: room.capacity,
      roomType: room.roomType,
      hasProjector: room.hasProjector,
      isActive: room.isActive,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingRoom) {
        await roomsApi.update(editingRoom.id, formData);
      } else {
        await roomsApi.create(formData);
      }
      setIsModalOpen(false);
      loadRooms();
    } catch (err) {
      alert('Error saving room: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete examination room?')) {
      try {
        await roomsApi.delete(id);
        loadRooms();
      } catch (err) {
        alert('Delete failed: ' + err.message);
      }
    }
  };

  const filteredRooms = rooms.filter((r) =>
    r.roomNumber.toLowerCase().includes(search.toLowerCase()) ||
    r.building.toLowerCase().includes(search.toLowerCase()) ||
    r.roomType.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Room & Seating Capacity Management</h2>
          <p className="text-xs text-slate-500 mt-1">
            Maintain examination halls, buildings, and seating capacities used for best-fit allocation
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Exam Room</span>
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex items-center justify-between">
        <div className="relative w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search rooms or buildings..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>
        <span className="text-xs font-semibold text-slate-500">
          Total Rooms: {rooms.length}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredRooms.map((room) => (
          <div key={room.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="px-2.5 py-1 font-mono font-bold text-xs bg-slate-100 text-slate-900 border border-slate-200 rounded-md">
                  {room.roomNumber}
                </span>
                <span
                  className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    room.isActive ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {room.isActive ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <XCircle className="w-3 h-3 text-slate-400" />}
                  <span>{room.isActive ? 'Active' : 'Inactive'}</span>
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-900">{room.building}</h3>
              <p className="text-xs text-slate-500 mt-0.5">Type: {room.roomType.replace('_', ' ')}</p>

              <div className="mt-4 flex items-center justify-between p-3 bg-blue-50/70 border border-blue-100 rounded-lg">
                <span className="text-xs text-blue-900 font-semibold">Seating Capacity:</span>
                <span className="text-sm font-bold text-blue-950 font-mono flex items-center gap-1">
                  <Users className="w-4 h-4 text-blue-700" />
                  {room.capacity} Seats
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
              <button
                onClick={() => handleOpenEdit(room)}
                className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                title="Edit Room"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(room.id)}
                className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                title="Delete Room"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingRoom ? 'Edit Examination Room' : 'Add New Examination Room'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Room Number / Code</label>
            <input
              type="text"
              required
              value={formData.roomNumber}
              onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value.toUpperCase() })}
              placeholder="e.g. EXAM-HALL-1 or LH-101"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono uppercase"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Building Location</label>
            <input
              type="text"
              required
              value={formData.building}
              onChange={(e) => setFormData({ ...formData, building: e.target.value })}
              placeholder="e.g. Main Academic Block"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Seating Capacity</label>
              <input
                type="number"
                min="10"
                max="500"
                required
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 30 })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Room Type</label>
              <select
                value={formData.roomType}
                onChange={(e) => setFormData({ ...formData, roomType: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
              >
                <option value="LECTURE_HALL">Lecture Hall</option>
                <option value="EXAM_HALL">Examination Hall</option>
                <option value="SEMINAR_HALL">Seminar Hall</option>
                <option value="COMPUTER_LAB">Computer Lab</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-6 pt-2">
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.hasProjector}
                onChange={(e) => setFormData({ ...formData, hasProjector: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded border-slate-300"
              />
              <span>Has Projector / AV</span>
            </label>
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded border-slate-300"
              />
              <span>Is Active for Scheduling</span>
            </label>
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
              Save Room
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

