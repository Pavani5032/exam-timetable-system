import React, { useState, useEffect } from 'react';
import { examinationsApi, coursesApi } from '../api/endpoints';
import { Modal } from '../components/Modal';
import { Layers, Plus, Search, Trash2, Edit2, Clock, Users } from 'lucide-react';

export const ExaminationsPage = () => {
  const [examinations, setExaminations] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExam, setEditingExam] = useState(null);
  const [formData, setFormData] = useState({
    courseId: '',
    examCode: '',
    title: '',
    examType: 'END_SEMESTER',
    durationMinutes: 180,
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [eRes, cRes] = await Promise.all([examinationsApi.getAll(), coursesApi.getAll()]);
      setExaminations(eRes.data);
      setCourses(cRes.data);
    } catch (err) {
      alert('Error fetching examinations: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAdd = () => {
    setEditingExam(null);
    setFormData({
      courseId: courses[0]?.id || '',
      examCode: '',
      title: '',
      examType: 'END_SEMESTER',
      durationMinutes: 180,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (exam) => {
    setEditingExam(exam);
    setFormData({
      courseId: exam.course?.id || '',
      examCode: exam.examCode,
      title: exam.title,
      examType: exam.examType,
      durationMinutes: exam.durationMinutes,
    });
    setIsModalOpen(true);
  };

  const handleCourseChange = (courseId) => {
    const selectedCourse = courses.find((c) => c.id === parseInt(courseId));
    setFormData({
      ...formData,
      courseId,
      examCode: selectedCourse ? `EXAM-${selectedCourse.code}` : '',
      title: selectedCourse ? `${selectedCourse.title} - End Sem` : '',
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        course: { id: parseInt(formData.courseId) },
        examCode: formData.examCode,
        title: formData.title,
        examType: formData.examType,
        durationMinutes: parseInt(formData.durationMinutes),
      };

      if (editingExam) {
        await examinationsApi.update(editingExam.id, payload);
      } else {
        await examinationsApi.create(payload);
      }
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      alert('Error saving examination: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete examination?')) {
      try {
        await examinationsApi.delete(id);
        loadData();
      } catch (err) {
        alert('Delete failed: ' + err.message);
      }
    }
  };

  const filteredExams = examinations.filter((e) =>
    e.title.toLowerCase().includes(search.toLowerCase()) ||
    e.examCode.toLowerCase().includes(search.toLowerCase()) ||
    e.course?.code?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Examinations Management</h2>
          <p className="text-xs text-slate-500 mt-1">
            Define examination instances, durations, and examine registered student capacity
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Examination</span>
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex items-center justify-between">
        <div className="relative w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search examinations..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>
        <span className="text-xs font-semibold text-slate-500">
          Total Examinations: {examinations.length}
        </span>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3">Exam Code</th>
                <th className="px-5 py-3">Examination Title</th>
                <th className="px-5 py-3">Course Code</th>
                <th className="px-5 py-3">Type</th>
                <th className="px-5 py-3 text-center">Duration</th>
                <th className="px-5 py-3 text-center">Registered Candidates</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredExams.map((exam) => (
                <tr key={exam.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-5 py-3 font-mono font-bold text-blue-900">{exam.examCode}</td>
                  <td className="px-5 py-3 font-semibold text-slate-900">{exam.title}</td>
                  <td className="px-5 py-3">
                    <span className="font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                      {exam.course?.code}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                      {exam.examType.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-center text-slate-600 font-medium">
                    <div className="inline-flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{exam.durationMinutes} mins</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-center">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200">
                      <Users className="w-3 h-3 text-blue-600" />
                      <span>{exam.studentCount} Students</span>
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right space-x-2">
                    <button
                      onClick={() => handleOpenEdit(exam)}
                      className="p-1 text-slate-400 hover:text-blue-600 transition-colors"
                      title="Edit Exam"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(exam.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                      title="Delete Exam"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredExams.length === 0 && (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-slate-400">
                    No examinations found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingExam ? 'Edit Examination' : 'Create Examination Instance'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Associated Course</label>
            <select
              value={formData.courseId}
              onChange={(e) => handleCourseChange(e.target.value)}
              required
              disabled={!!editingExam}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
            >
              <option value="">-- Select Course --</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code} - {c.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Exam Code</label>
            <input
              type="text"
              required
              value={formData.examCode}
              onChange={(e) => setFormData({ ...formData, examCode: e.target.value })}
              placeholder="e.g. EXAM-CSA1016"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono uppercase"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Exam Title</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Software Engineering - End Sem"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Exam Type</label>
              <select
                value={formData.examType}
                onChange={(e) => setFormData({ ...formData, examType: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
              >
                <option value="END_SEMESTER">End Semester</option>
                <option value="MID_TERM">Mid Term</option>
                <option value="PRACTICAL">Practical Lab Exam</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Duration (Minutes)</label>
              <input
                type="number"
                min="30"
                max="360"
                step="30"
                required
                value={formData.durationMinutes}
                onChange={(e) => setFormData({ ...formData, durationMinutes: parseInt(e.target.value) || 180 })}
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
              Save Examination
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

