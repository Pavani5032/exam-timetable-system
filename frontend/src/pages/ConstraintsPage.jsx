import React, { useState, useEffect } from 'react';
import { constraintsApi } from '../api/endpoints';
import { Sliders, ShieldAlert, CheckCircle, Save, Info, AlertTriangle } from 'lucide-react';

export const ConstraintsPage = () => {
  const [constraints, setConstraints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingValues, setEditingValues] = useState({});
  const [saveSuccess, setSaveSuccess] = useState(false);

  const loadConstraints = async () => {
    setLoading(true);
    try {
      const res = await constraintsApi.getAll();
      setConstraints(res.data);
      const valMap = {};
      res.data.forEach((c) => {
        valMap[c.id] = c.constraintValue;
      });
      setEditingValues(valMap);
    } catch (err) {
      alert('Error fetching constraints: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConstraints();
  }, []);

  const handleToggle = async (id) => {
    try {
      const res = await constraintsApi.toggle(id);
      setConstraints((prev) => prev.map((c) => (c.id === id ? res.data : c)));
    } catch (err) {
      alert('Failed to toggle constraint: ' + err.message);
    }
  };

  const handleValueChange = (id, value) => {
    setEditingValues({ ...editingValues, [id]: value });
  };

  const handleSaveConstraint = async (constraint) => {
    try {
      const updated = {
        ...constraint,
        constraintValue: editingValues[constraint.id],
      };
      await constraintsApi.update(constraint.id, updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
      loadConstraints();
    } catch (err) {
      alert('Failed to update constraint: ' + err.message);
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Scheduling Constraints Configuration</h2>
          <p className="text-xs text-slate-500 mt-1">
            Configure hard and soft optimization constraints enforced by the DSATUR engine and validation layer
          </p>
        </div>

        {saveSuccess && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-semibold animate-pulse">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>Constraints updated and persisted!</span>
          </div>
        )}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-xs text-blue-900 flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold">Hard vs Soft Constraints in University Timetabling:</p>
          <p>
            <strong>Hard Constraints</strong> (e.g. Student Clashes, Room Double-Booking, Seating Capacity) must strictly never be violated. The system will NEVER mark a schedule as published if hard constraints remain unsatisfied.
            <strong> Soft Constraints</strong> (e.g. Exam Spacing, Preferred Sessions) represent quality preferences.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {constraints.map((c) => (
          <div
            key={c.id}
            className={`bg-white rounded-xl border p-5 shadow-sm space-y-4 transition-all ${
              c.isEnabled ? 'border-slate-200' : 'border-slate-200 opacity-60 bg-slate-50'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase ${
                      c.isHardConstraint
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                    }`}
                  >
                    {c.isHardConstraint ? 'HARD CONSTRAINT' : 'SOFT CONSTRAINT'}
                  </span>
                  <span className="font-mono text-[10px] text-slate-400">{c.constraintKey}</span>
                </div>
                <h3 className="text-sm font-bold text-slate-900">{c.constraintName}</h3>
              </div>

              {/* Toggle switch */}
              <button
                onClick={() => handleToggle(c.id)}
                className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  c.isEnabled ? 'bg-blue-600' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    c.isEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">{c.description}</p>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-4">
              <div className="flex-1">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Configured Threshold / Value
                </label>
                <input
                  type="text"
                  value={editingValues[c.id] || ''}
                  onChange={(e) => handleValueChange(c.id, e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded text-xs font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>
              <button
                onClick={() => handleSaveConstraint(c)}
                className="mt-4 px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded text-xs font-semibold flex items-center gap-1 shadow-sm transition-colors"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

