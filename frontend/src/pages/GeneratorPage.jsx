import React, { useState, useEffect } from 'react';
import { schedulesApi } from '../api/endpoints';
import {
  Cpu,
  Play,
  CheckCircle,
  AlertTriangle,
  RotateCw,
  GitBranch,
  Layers,
  Building,
  GraduationCap,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Info,
} from 'lucide-react';

export const GeneratorPage = ({ onNavigate }) => {
  const [formData, setFormData] = useState({
    title: 'End-Semester Examinations - Fall 2026',
    academicYear: '2026-2027',
    semester: 5,
  });

  const [generating, setGenerating] = useState(false);
  const [generationResult, setGenerationResult] = useState(null);
  const [graphData, setGraphData] = useState(null);
  const [activeStep, setActiveStep] = useState(0);

  const loadGraphSummary = async () => {
    try {
      const res = await schedulesApi.getGraph();
      setGraphData(res.data);
    } catch (err) {
      console.error('Error fetching graph data', err);
    }
  };

  useEffect(() => {
    loadGraphSummary();
  }, []);

  const handleGenerate = async (e) => {
    e.preventDefault();
    setGenerating(true);
    setGenerationResult(null);
    setActiveStep(1);

    // Simulate animated step progression for clear visual demonstration
    setTimeout(() => setActiveStep(2), 500);
    setTimeout(() => setActiveStep(3), 1000);
    setTimeout(() => setActiveStep(4), 1500);

    try {
      const res = await schedulesApi.generate(formData);
      setTimeout(() => {
        setGenerationResult(res.data);
        setActiveStep(5);
        setGenerating(false);
        loadGraphSummary();
      }, 2000);
    } catch (err) {
      alert('Scheduling failed: ' + (err.response?.data?.error || err.message));
      setGenerating(false);
      setActiveStep(0);
    }
  };

  const steps = [
    { num: 1, title: 'Conflict Graph Construction', desc: 'Identify shared student registrations between examinations', icon: GitBranch },
    { num: 2, title: 'DSATUR Vertex Ordering & Coloring', desc: 'Dynamic saturation degree calculation for optimal slot assignment', icon: Cpu },
    { num: 3, title: 'Best-Fit Room Allocation', desc: 'Assign examination halls based on seating capacity & prevent double-booking', icon: Building },
    { num: 4, title: 'Faculty Invigilation Allocation', desc: 'Check recorded leave and assign available invigilators without overlap', icon: GraduationCap },
    { num: 5, title: 'Constraint Validation & Alternatives', desc: 'Verify all hard constraints and formulate alternative recommendations', icon: ShieldCheck },
  ];

  return (
    <div className="p-8 space-y-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Automated Examination Timetable Generator
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Backend Graph Colouring (DSATUR) & Conflict-Free Resource Allocation Engine
          </p>
        </div>
      </div>

      {/* Main Grid: Form + Graph Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Generator Controls */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Sparkles className="w-5 h-5 text-blue-700" />
            <h3 className="text-sm font-bold text-slate-900">Schedule Parameters</h3>
          </div>

          <form onSubmit={handleGenerate} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Schedule Title
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Academic Year
                </label>
                <input
                  type="text"
                  required
                  value={formData.academicYear}
                  onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Semester
                </label>
                <input
                  type="number"
                  min="1"
                  max="8"
                  required
                  value={formData.semester}
                  onChange={(e) => setFormData({ ...formData, semester: parseInt(e.target.value) || 1 })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-600 space-y-1">
              <p className="font-bold text-slate-800">Algorithm Specification:</p>
              <p>• DSATUR (Degree of Saturation) Heuristic</p>
              <p>• Best-Fit Decreasing Room Allocation</p>
              <p>• Faculty Leave & Overlap Prevention</p>
              <p>• Strict Hard Constraint Integrity</p>
            </div>

            <button
              type="submit"
              disabled={generating}
              className="w-full py-2.5 px-4 bg-blue-700 hover:bg-blue-800 text-white font-semibold rounded-lg text-xs shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {generating ? (
                <>
                  <RotateCw className="w-4 h-4 animate-spin" />
                  <span>Executing DSATUR Engine...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white" />
                  <span>Run Automated Scheduling</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Conflict Graph Metric Cards */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <GitBranch className="w-5 h-5 text-indigo-700" />
              <h3 className="text-sm font-bold text-slate-900">Examination Conflict Graph G = (V, E)</h3>
            </div>
            <span className="text-xs text-slate-500 font-mono">Pairwise Conflict Analysis</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg text-center">
              <p className="text-[10px] font-bold text-blue-700 uppercase">Vertices |V|</p>
              <p className="text-2xl font-bold text-blue-950 mt-0.5">{graphData?.totalVertices || 0}</p>
              <p className="text-[10px] text-blue-600 mt-0.5">Examinations</p>
            </div>
            <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-lg text-center">
              <p className="text-[10px] font-bold text-indigo-700 uppercase">Edges |E|</p>
              <p className="text-2xl font-bold text-indigo-950 mt-0.5">{graphData?.totalEdges || 0}</p>
              <p className="text-[10px] text-indigo-600 mt-0.5">Shared Conflicts</p>
            </div>
            <div className="p-3 bg-purple-50 border border-purple-100 rounded-lg text-center">
              <p className="text-[10px] font-bold text-purple-700 uppercase">Max Degree Δ(G)</p>
              <p className="text-2xl font-bold text-purple-950 mt-0.5">{graphData?.maxDegree || 0}</p>
              <p className="text-[10px] text-purple-600 mt-0.5">Peak Bottleneck</p>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-center">
              <p className="text-[10px] font-bold text-slate-600 uppercase">Graph Density</p>
              <p className="text-2xl font-bold text-slate-900 mt-0.5">{graphData?.density || 0}</p>
              <p className="text-[10px] text-slate-500 mt-0.5">Overlap Ratio</p>
            </div>
          </div>

          {/* Interactive Graph Node Badges */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
              Graph Nodes & Conflict Degrees
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-48 overflow-y-auto">
              {(graphData?.nodes || []).map((node) => (
                <div
                  key={node.id}
                  className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-xs"
                >
                  <div className="truncate mr-2">
                    <span className="font-bold text-blue-900 font-mono mr-1.5">{node.label}</span>
                    <span className="text-slate-600 truncate">{node.title}</span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                      {node.studentCount} St.
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                      Deg: {node.degree}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Step-by-Step Algorithm Pipeline Progress */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900">
          Scheduling Pipeline Execution Stages
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          {steps.map((st) => {
            const Icon = st.icon;
            const isCompleted = activeStep > st.num || activeStep === 5;
            const isCurrent = activeStep === st.num;

            return (
              <div
                key={st.num}
                className={`p-3.5 rounded-xl border transition-all ${
                  isCompleted
                    ? 'bg-emerald-50/70 border-emerald-300'
                    : isCurrent
                    ? 'bg-blue-50 border-blue-400 ring-2 ring-blue-600/20'
                    : 'bg-slate-50 border-slate-200 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                      isCompleted
                        ? 'bg-emerald-600 text-white'
                        : isCurrent
                        ? 'bg-blue-600 text-white animate-pulse'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {isCompleted ? '✓' : st.num}
                  </span>
                  <Icon className={`w-4 h-4 ${isCompleted ? 'text-emerald-700' : isCurrent ? 'text-blue-700' : 'text-slate-400'}`} />
                </div>
                <h4 className="text-xs font-bold text-slate-900">{st.title}</h4>
                <p className="text-[10px] text-slate-500 mt-1 leading-snug">{st.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Output / Results Panel */}
      {generationResult && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Generation Outcome: {generationResult.schedule?.title}
                </h3>
                <p className="text-xs text-slate-500">
                  Execution completed in {generationResult.statistics?.executionTimeMs || 12} ms
                </p>
              </div>
            </div>

            <span
              className={`px-3 py-1 rounded-full text-xs font-bold ${
                generationResult.schedule?.status === 'FEASIBLE'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-rose-100 text-rose-800'
              }`}
            >
              {generationResult.schedule?.status}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-center">
            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="text-xs text-slate-500 font-medium">Examinations</p>
              <p className="text-xl font-bold text-slate-900 mt-0.5">{generationResult.schedule?.totalExams}</p>
            </div>
            <div className="p-3 bg-emerald-50 rounded-lg">
              <p className="text-xs text-emerald-700 font-medium">Scheduled Cleanly</p>
              <p className="text-xl font-bold text-emerald-800 mt-0.5">{generationResult.schedule?.scheduledExams}</p>
            </div>
            <div className="p-3 bg-rose-50 rounded-lg">
              <p className="text-xs text-rose-700 font-medium">Unresolved Conflicts</p>
              <p className="text-xl font-bold text-rose-800 mt-0.5">{generationResult.schedule?.conflictCount}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-xs text-blue-700 font-medium">Algorithm Used</p>
              <p className="text-xs font-bold text-blue-950 mt-1.5 font-mono">DSATUR Graph Colouring</p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              onClick={() => onNavigate('conflicts')}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold flex items-center gap-1.5"
            >
              <span>View Conflict Audit ({generationResult.schedule?.conflictCount})</span>
            </button>
            <button
              onClick={() => onNavigate('timetable')}
              className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow"
            >
              <span>Open Timetable Calendar & Editor</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

