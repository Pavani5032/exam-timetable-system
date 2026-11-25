import React, { useState, useEffect } from 'react';
import { schedulesApi } from '../api/endpoints';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import {
  UploadCloud,
  FileDown,
  CheckCircle2,
  AlertTriangle,
  Building,
  GraduationCap,
  Calendar,
  ShieldCheck,
  FileText,
  Printer,
} from 'lucide-react';

export const PublishPage = () => {
  const [schedules, setSchedules] = useState([]);
  const [selectedScheduleId, setSelectedScheduleId] = useState('');
  const [scheduleData, setScheduleData] = useState(null);
  const [items, setItems] = useState([]);
  const [conflicts, setConflicts] = useState([]);
  const [publishing, setPublishing] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  const loadData = async () => {
    try {
      const res = await schedulesApi.getAll();
      setSchedules(res.data);
      if (res.data.length > 0) {
        const firstId = res.data[0].id;
        setSelectedScheduleId(firstId);
        await loadScheduleDetails(firstId);
      }
    } catch (err) {
      alert('Error fetching schedules: ' + err.message);
    }
  };

  const loadScheduleDetails = async (id) => {
    try {
      const [sRes, itemsRes, confRes] = await Promise.all([
        schedulesApi.getById(id),
        schedulesApi.getItems(id),
        schedulesApi.getConflicts(id),
      ]);
      setScheduleData(sRes.data);
      setItems(itemsRes.data);
      setConflicts(confRes.data);
    } catch (err) {
      console.error('Error fetching details', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleScheduleChange = async (e) => {
    const id = e.target.value;
    setSelectedScheduleId(id);
    await loadScheduleDetails(id);
  };

  const handlePublish = async () => {
    setPublishing(true);
    setStatusMessage(null);
    try {
      const res = await schedulesApi.publish(selectedScheduleId);
      setScheduleData(res.data);
      setStatusMessage({
        type: 'success',
        text: 'Examination timetable successfully validated and published officially!',
      });
      loadData();
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: err.response?.data?.error || err.message,
      });
    } finally {
      setPublishing(false);
    }
  };

  const handleUnpublish = async () => {
    try {
      const res = await schedulesApi.unpublish(selectedScheduleId);
      setScheduleData(res.data);
      setStatusMessage({
        type: 'info',
        text: 'Timetable unpublished back to draft/validated status.',
      });
      loadData();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const downloadServerPdf = () => {
    if (!selectedScheduleId) return;
    window.open(`http://localhost:8080/api/schedules/export/${selectedScheduleId}/pdf`, '_blank');
  };

  const downloadServerCsv = () => {
    if (!selectedScheduleId) return;
    window.open(`http://localhost:8080/api/schedules/export/${selectedScheduleId}/csv`, '_blank');
  };

  // Client-side jsPDF generator fallback
  const generateClientPdf = () => {
    const doc = new jsPDF('landscape');

    // Title Header
    doc.setFontSize(16);
    doc.setTextColor(30, 58, 138);
    doc.text('SIMATS ENGINEERING', 148, 15, { align: 'center' });

    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text('Saveetha Institute of Medical and Technical Sciences, Chennai', 148, 22, { align: 'center' });
    doc.text('Constraint-Based Examination Timetable & Conflict-Free Resource Allocation System', 148, 28, { align: 'center' });

    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.text(`${scheduleData?.title || 'Examination Schedule'} (${scheduleData?.academicYear})`, 148, 36, { align: 'center' });

    const tableRows = items.map((item) => [
      item.examination?.examCode || '-',
      item.examination?.title || '-',
      item.timeSlot?.examDate || '-',
      item.timeSlot?.slotName || '-',
      item.room?.roomNumber || '-',
      item.room?.capacity || '-',
      item.studentCount || 0,
      item.faculty?.name || '-',
      item.status || '-',
    ]);

    doc.autoTable({
      head: [['Exam Code', 'Course Title', 'Date', 'Time Slot', 'Room', 'Cap.', 'Candidates', 'Invigilator', 'Status']],
      body: tableRows,
      startY: 42,
      styles: { fontSize: 8, cellPadding: 3 },
      headStyles: { fillColor: [30, 58, 138], textColor: 255, halign: 'center' },
    });

    doc.save(`SIMATS_Timetable_${selectedScheduleId}.pdf`);
  };

  const hardConflictsCount = conflicts.filter((c) => 'HARD'.equalsIgnoreCase(c.severity)).length;
  const canPublish = hardConflictsCount === 0;

  return (
    <div className="p-8 space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Timetable Publishing & Official Exports</h2>
          <p className="text-xs text-slate-500 mt-1">
            Validate institutional compliance, officially publish schedules, and download university reports
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
        </div>
      </div>

      {/* Status Alert Banner */}
      {statusMessage && (
        <div
          className={`p-4 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : statusMessage.type === 'error'
              ? 'bg-rose-50 text-rose-800 border-rose-200'
              : 'bg-blue-50 text-blue-800 border-blue-200'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Publication Control Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-5">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">{scheduleData?.title}</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Academic Year {scheduleData?.academicYear} • Semester {scheduleData?.semester}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold ${
                scheduleData?.status === 'PUBLISHED'
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  : scheduleData?.status === 'FEASIBLE'
                  ? 'bg-blue-100 text-blue-800 border border-blue-200'
                  : 'bg-rose-100 text-rose-800 border border-rose-200'
              }`}
            >
              {scheduleData?.status}
            </span>
          </div>
        </div>

        {/* Safety Guard Warning */}
        {!canPublish && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Publication Guard Activated:</p>
              <p className="mt-1">
                This schedule currently has <strong>{hardConflictsCount} unresolved hard conflict(s)</strong>. In accordance with university academic examination guidelines, publication is locked until all student overlaps, room double-bookings, and faculty clashes are resolved.
              </p>
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
          <div className="flex items-center gap-3">
            {scheduleData?.status === 'PUBLISHED' ? (
              <button
                onClick={handleUnpublish}
                className="px-4 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold rounded-lg text-xs transition-colors"
              >
                Unpublish Schedule
              </button>
            ) : (
              <button
                onClick={handlePublish}
                disabled={!canPublish || publishing}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-xs flex items-center gap-2 shadow-sm transition-all disabled:opacity-40"
              >
                <UploadCloud className="w-4 h-4" />
                <span>{publishing ? 'Publishing...' : 'Publish Timetable Officially'}</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={downloadServerCsv}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold shadow-sm transition-colors"
            >
              <FileDown className="w-4 h-4 text-emerald-700" />
              <span>Download CSV</span>
            </button>

            <button
              onClick={downloadServerPdf}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Export Official PDF</span>
            </button>

            <button
              onClick={generateClientPdf}
              className="flex items-center gap-1.5 px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-semibold shadow-sm transition-colors"
              title="Generate PDF in browser"
            >
              <FileText className="w-4 h-4" />
              <span>Client-side PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* Official Timetable Document Preview */}
      <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm space-y-6">
        {/* Document Header */}
        <div className="text-center border-b border-slate-200 pb-6 space-y-1">
          <h2 className="text-xl font-black text-blue-900 tracking-tight">SIMATS ENGINEERING</h2>
          <p className="text-xs font-semibold text-slate-600">Saveetha Institute of Medical and Technical Sciences, Chennai – 602105</p>
          <p className="text-xs font-bold text-slate-800 mt-2">
            OFFICIAL EXAMINATION TIMETABLE • {scheduleData?.academicYear}
          </p>
          <div className="inline-block mt-1 px-3 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-800">
            {scheduleData?.title}
          </div>
        </div>

        {/* Printable Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border border-slate-200">
            <thead className="bg-blue-900 text-white font-bold uppercase tracking-wider">
              <tr>
                <th className="px-4 py-2.5 border-r border-blue-800">Exam Code</th>
                <th className="px-4 py-2.5 border-r border-blue-800">Course Title</th>
                <th className="px-4 py-2.5 border-r border-blue-800">Date</th>
                <th className="px-4 py-2.5 border-r border-blue-800">Time Slot</th>
                <th className="px-4 py-2.5 border-r border-blue-800 text-center">Hall</th>
                <th className="px-4 py-2.5 border-r border-blue-800 text-center">Strength</th>
                <th className="px-4 py-2.5">Invigilator</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {items.map((item, idx) => (
                <tr key={item.id} className={idx % 2 === 1 ? 'bg-slate-50' : 'bg-white'}>
                  <td className="px-4 py-2.5 font-mono font-bold text-blue-900 border-r border-slate-200">
                    {item.examination.examCode}
                  </td>
                  <td className="px-4 py-2.5 font-semibold text-slate-900 border-r border-slate-200">
                    {item.examination.title}
                  </td>
                  <td className="px-4 py-2.5 text-slate-700 border-r border-slate-200">
                    {item.timeSlot?.examDate || '-'}
                  </td>
                  <td className="px-4 py-2.5 text-slate-600 border-r border-slate-200">
                    {item.timeSlot?.slotName || '-'}
                  </td>
                  <td className="px-4 py-2.5 text-center font-bold text-slate-800 border-r border-slate-200">
                    {item.room?.roomNumber || '-'}
                  </td>
                  <td className="px-4 py-2.5 text-center font-bold text-blue-800 border-r border-slate-200">
                    {item.studentCount}
                  </td>
                  <td className="px-4 py-2.5 text-slate-800">
                    {item.faculty?.name || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Document Footer Signatures */}
        <div className="pt-10 flex justify-between text-xs text-slate-600">
          <div className="text-center">
            <div className="w-36 border-b border-slate-400 mb-1" />
            <p className="font-bold">Course Coordinator</p>
          </div>
          <div className="text-center">
            <div className="w-36 border-b border-slate-400 mb-1" />
            <p className="font-bold">Head of Department (IT)</p>
          </div>
          <div className="text-center">
            <div className="w-36 border-b border-slate-400 mb-1" />
            <p className="font-bold">Controller of Examinations</p>
          </div>
        </div>
      </div>
    </div>
  );
};

