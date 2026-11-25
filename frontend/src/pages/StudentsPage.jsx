import React, { useState, useEffect } from 'react';
import { studentsApi, coursesApi } from '../api/endpoints';
import { Modal } from '../components/Modal';
import { Users, Plus, Search, Trash2, Edit2, BookOpen, Check, X, ShieldAlert } from 'lucide-react';

export const StudentsPage = () => {
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('ALL');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [formData, setFormData] = useState({
    rollNumber: '',
    name: '',
    email: '',
    department: 'Information Technology',
    semester: 5,
    academicYear: '2026-2027',
  });

  // Registrations modal state
  const [regModalOpen, setRegModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentRegistrations, setStudentRegistrations] = useState([]);
  const [selectedCourseToRegister, setSelectedCourseToRegister] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [sRes, cRes] = await Promise.all([studentsApi.getAll(), coursesApi.getAll()]);
      setStudents(sRes.data);
      setCourses(cRes.data);
    } catch (err) {
      alert('Error fetching data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAdd = () => {
    setEditingStudent(null);
    setFormData({
      rollNumber: '',
      name: '',
      email: '',
      department: 'Information Technology',
      semester: 5,
      academicYear: '2026-2027',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (student) => {
    setEditingStudent(student);
    setFormData({
      rollNumber: student.rollNumber,
      name: student.name,
      email: student.email,
      department: student.department,
      semester: student.semester,
      academicYear: student.academicYear || '2026-2027',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingStudent) {
        await studentsApi.update(editingStudent.id, formData);
      } else {
        await studentsApi.create(formData);
      }
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      alert('Error saving student: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete student and associated registrations?')) {
      try {
        await studentsApi.delete(id);
        loadData();
      } catch (err) {
        alert('Delete failed: ' + err.message);
      }
    }
  };

  // Open Registrations
  const handleOpenRegistrations = async (student) => {
    setSelectedStudent(student);
    try {
      const res = await studentsApi.getRegistrations(student.id);
      setStudentRegistrations(res.data);
      setRegModalOpen(true);
    } catch (err) {
      alert('Error loading registrations: ' + err.message);
    }
  };

  const handleAddRegistration = async () => {
    if (!selectedCourseToRegister) return;
    try {
      await studentsApi.addRegistration({
        studentId: selectedStudent.id,
        courseId: selectedCourseToRegister,
        academicYear: selectedStudent.academicYear || '2026-2027',
      });
      // reload
      const res = await studentsApi.getRegistrations(selectedStudent.id);
      setStudentRegistrations(res.data);
      setSelectedCourseToRegister('');
    } catch (err) {
      alert('Registration error: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleDeleteRegistration = async (regId) => {
    try {
      await studentsApi.deleteRegistration(regId);
      const res = await studentsApi.getRegistrations(selectedStudent.id);
      setStudentRegistrations(res.data);
    } catch (err) {
      alert('Failed to remove course registration: ' + err.message);
    }
  };

  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.rollNumber.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase());
    const matchesDept = deptFilter === 'ALL' || s.department === deptFilter;
    return matchesSearch && matchesDept;
  });

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Student & Registration Management</h2>
          <p className="text-xs text-slate-500 mt-1">
            Maintain student records and course enrollments that define examination conflict edges
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Student</span>
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or roll number..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <label className="text-xs font-medium text-slate-600">Department:</label>
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="py-1.5 px-3 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            <option value="ALL">All Departments</option>
            <option value="Information Technology">Information Technology</option>
            <option value="Computer Science & Engineering">Computer Science & Engineering</option>
          </select>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3">Roll Number</th>
                <th className="px-5 py-3">Student Name</th>
                <th className="px-5 py-3">Department</th>
                <th className="px-5 py-3 text-center">Semester</th>
                <th className="px-5 py-3">Email Address</th>
                <th className="px-5 py-3 text-center">Registrations</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-5 py-3 font-mono font-bold text-blue-900">{s.rollNumber}</td>
                  <td className="px-5 py-3 font-semibold text-slate-900">{s.name}</td>
                  <td className="px-5 py-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-800 border border-blue-200">
                      {s.department}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-center font-bold text-slate-700">Sem {s.semester}</td>
                  <td className="px-5 py-3 text-slate-500">{s.email}</td>
                  <td className="px-5 py-3 text-center">
                    <button
                      onClick={() => handleOpenRegistrations(s)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded text-[11px] border border-slate-300 transition-colors"
                    >
                      <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                      <span>Manage Courses</span>
                    </button>
                  </td>
                  <td className="px-5 py-3 text-right space-x-2">
                    <button
                      onClick={() => handleOpenEdit(s)}
                      className="p-1 text-slate-400 hover:text-blue-600 transition-colors"
                      title="Edit Student"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(s.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                      title="Delete Student"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredStudents.length === 0 && (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-slate-400">
                    No students found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Student Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingStudent ? 'Edit Student Details' : 'Register New Student'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Roll Number</label>
            <input
              type="text"
              required
              value={formData.rollNumber}
              onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
              placeholder="e.g. 192425356"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Full Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. M. Thanuja"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Email Address</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="e.g. thanuja@saveetha.ac.in"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Department</label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="Information Technology">Information Technology</option>
                <option value="Computer Science & Engineering">Computer Science & Engineering</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Semester</label>
              <input
                type="number"
                min="1"
                max="8"
                required
                value={formData.semester}
                onChange={(e) => setFormData({ ...formData, semester: parseInt(e.target.value) || 1 })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-700 text-white rounded-lg text-xs font-semibold hover:bg-blue-800"
            >
              Save Student
            </button>
          </div>
        </form>
      </Modal>

      {/* Manage Course Registrations Modal */}
      <Modal
        isOpen={regModalOpen}
        onClose={() => setRegModalOpen(false)}
        title={`Course Registrations: ${selectedStudent?.name} (${selectedStudent?.rollNumber})`}
        maxWidth="max-w-2xl"
      >
        <div className="space-y-5">
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-900">
            Enrolled courses determine shared-student conflict edges in the examination conflict graph. Two examinations sharing enrolled students cannot be scheduled at the same time.
          </div>

          {/* Add Course Form */}
          <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
            <select
              value={selectedCourseToRegister}
              onChange={(e) => setSelectedCourseToRegister(e.target.value)}
              className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800"
            >
              <option value="">-- Select Course to Enroll --</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code} - {c.title} ({c.department})
                </option>
              ))}
            </select>
            <button
              onClick={handleAddRegistration}
              disabled={!selectedCourseToRegister}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold disabled:opacity-50"
            >
              Enroll Course
            </button>
          </div>

          {/* List of Enrolled Courses */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase text-slate-600 tracking-wider">
              Enrolled Courses ({studentRegistrations.length})
            </h4>
            <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden">
              {studentRegistrations.map((reg) => (
                <div key={reg.id} className="p-3 flex items-center justify-between hover:bg-slate-50 text-xs">
                  <div>
                    <span className="font-bold text-blue-900 font-mono mr-2">{reg.course.code}</span>
                    <span className="font-semibold text-slate-800">{reg.course.title}</span>
                    <span className="text-slate-400 text-[10px] ml-2">({reg.course.department} • Sem {reg.course.semester})</span>
                  </div>
                  <button
                    onClick={() => handleDeleteRegistration(reg.id)}
                    className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                    title="Remove Enrollment"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {studentRegistrations.length === 0 && (
                <div className="p-4 text-center text-slate-400 text-xs">
                  No courses enrolled yet for this student.
                </div>
              )}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

