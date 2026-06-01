"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Briefcase, Plus, DollarSign, Calendar, MapPin, User } from "lucide-react";
import type { CommercialProject, ProjectPhase, ProjectDailyLog, PhaseStatus, ProjectStatus } from "@/lib/types/db";

const PHASE_STATUS_STYLES: Record<PhaseStatus, string> = {
  pending: "bg-gray-100 text-gray-600",
  active: "bg-blue-100 text-blue-700",
  complete: "bg-green-100 text-green-700",
};

const PROJECT_STATUS_BADGE: Record<ProjectStatus, string> = {
  bid: "bg-yellow-100 text-yellow-700",
  active: "bg-blue-100 text-blue-700",
  on_hold: "bg-gray-100 text-gray-600",
  complete: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-600",
};

const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  bid: "Bid",
  active: "Active",
  on_hold: "On Hold",
  complete: "Complete",
  cancelled: "Cancelled",
};

type DailyLogWithEmployee = ProjectDailyLog & {
  employee?: { id: string; first_name: string; last_name: string } | null;
};

export default function ProjectDetailClient({
  project,
  phases: initialPhases,
  logs: initialLogs,
}: {
  project: CommercialProject;
  phases: ProjectPhase[];
  logs: DailyLogWithEmployee[];
}) {
  const [phases, setPhases] = useState<ProjectPhase[]>(initialPhases);
  const [logs, setLogs] = useState<DailyLogWithEmployee[]>(initialLogs);
  const [showPhaseModal, setShowPhaseModal] = useState(false);
  const [showLogModal, setShowLogModal] = useState(false);
  const [savingPhase, setSavingPhase] = useState(false);
  const [savingLog, setSavingLog] = useState(false);

  const [phaseForm, setPhaseForm] = useState({
    name: "",
    status: "pending" as PhaseStatus,
    start_date: "",
    end_date: "",
    budget: "",
    notes: "",
  });

  const [logForm, setLogForm] = useState({
    log_date: new Date().toISOString().split("T")[0],
    hours: "",
    equipment_used: "",
    material_moved: "",
    weather: "",
    notes: "",
  });

  async function handleAddPhase(e: React.FormEvent) {
    e.preventDefault();
    setSavingPhase(true);
    const res = await fetch(`/api/projects/${project.id}/phases`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...phaseForm,
        project_id: project.id,
        budget: phaseForm.budget ? parseFloat(phaseForm.budget) : null,
        start_date: phaseForm.start_date || null,
        end_date: phaseForm.end_date || null,
      }),
    });
    if (res.ok) {
      const { phase } = await res.json() as { phase: ProjectPhase };
      setPhases((prev) => [...prev, phase]);
      setShowPhaseModal(false);
      setPhaseForm({ name: "", status: "pending", start_date: "", end_date: "", budget: "", notes: "" });
    }
    setSavingPhase(false);
  }

  async function handleAddLog(e: React.FormEvent) {
    e.preventDefault();
    setSavingLog(true);
    const res = await fetch(`/api/projects/${project.id}/logs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...logForm,
        project_id: project.id,
        hours: logForm.hours ? parseFloat(logForm.hours) : null,
      }),
    });
    if (res.ok) {
      const { log } = await res.json() as { log: DailyLogWithEmployee };
      setLogs((prev) => [log, ...prev]);
      setShowLogModal(false);
      setLogForm({ log_date: new Date().toISOString().split("T")[0], hours: "", equipment_used: "", material_moved: "", weather: "", notes: "" });
    }
    setSavingLog(false);
  }

  const statusKey = project.status as ProjectStatus;

  return (
    <div className="p-8 max-w-5xl">
      {/* Back link */}
      <Link href="/admin/projects" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#1a2744] mb-6 transition-colors w-fit">
        <ArrowLeft size={14} /> Back to Projects
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1 flex-wrap">
            <h1 className="text-2xl font-extrabold text-[#1a2744]">{project.name}</h1>
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${PROJECT_STATUS_BADGE[statusKey]}`}>
              {PROJECT_STATUS_LABELS[statusKey]}
            </span>
          </div>
          {project.client && (
            <p className="text-sm text-gray-500">{project.client.name}</p>
          )}
        </div>
        {project.contract_value !== null && (
          <div className="bg-[#1a2744] text-white rounded-xl px-5 py-3 shrink-0">
            <p className="text-xs text-white/60 mb-0.5">Contract Value</p>
            <p className="text-xl font-extrabold flex items-center gap-0.5">
              <DollarSign size={16} />
              {project.contract_value.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </p>
          </div>
        )}
      </div>

      {/* Meta row */}
      <div className="flex gap-6 flex-wrap mb-8 text-sm text-gray-500">
        {project.start_date && (
          <span className="flex items-center gap-1.5">
            <Calendar size={14} />
            Start: {new Date(project.start_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </span>
        )}
        {project.end_date && (
          <span className="flex items-center gap-1.5">
            <Calendar size={14} />
            End: {new Date(project.end_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </span>
        )}
        {project.address && (
          <span className="flex items-center gap-1.5">
            <MapPin size={14} />
            {project.address}{project.city ? `, ${project.city}` : ""}
          </span>
        )}
        {project.project_manager && (
          <span className="flex items-center gap-1.5">
            <User size={14} />
            PM: {project.project_manager}
          </span>
        )}
        {project.notes && (
          <span className="flex items-center gap-1.5 text-gray-400 italic">
            {project.notes}
          </span>
        )}
      </div>

      {/* Phases */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-[#1a2744] flex items-center gap-2">
            <Briefcase size={16} /> Phases
          </h2>
          <button
            onClick={() => setShowPhaseModal(true)}
            className="flex items-center gap-1 px-3 py-1.5 bg-[#e8600a] text-white text-xs font-semibold rounded-lg hover:bg-[#c4500a] transition-colors"
          >
            <Plus size={13} /> Add Phase
          </button>
        </div>

        {phases.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-gray-400">
            <p className="text-sm font-medium">No phases added yet</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-left">
                  <th className="px-4 py-3 font-semibold text-gray-600">Phase</th>
                  <th className="px-4 py-3 font-semibold text-gray-600">Status</th>
                  <th className="px-4 py-3 font-semibold text-gray-600 hidden sm:table-cell">Dates</th>
                  <th className="px-4 py-3 font-semibold text-gray-600 hidden md:table-cell">Budget</th>
                  <th className="px-4 py-3 font-semibold text-gray-600 hidden md:table-cell">Actual</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {phases.map((phase) => (
                  <tr key={phase.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-[#1a2744]">{phase.name}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${PHASE_STATUS_STYLES[phase.status]}`}>
                        {phase.status.charAt(0).toUpperCase() + phase.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 hidden sm:table-cell text-xs">
                      {phase.start_date && new Date(phase.start_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      {phase.start_date && phase.end_date && " – "}
                      {phase.end_date && new Date(phase.end_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </td>
                    <td className="px-4 py-3 text-gray-500 hidden md:table-cell">
                      {phase.budget !== null ? `$${phase.budget.toLocaleString()}` : "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-500 hidden md:table-cell">
                      {phase.actual_cost > 0 ? `$${phase.actual_cost.toLocaleString()}` : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Daily Logs */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-[#1a2744]">Daily Logs</h2>
          <button
            onClick={() => setShowLogModal(true)}
            className="flex items-center gap-1 px-3 py-1.5 bg-[#1a2744] text-white text-xs font-semibold rounded-lg hover:bg-[#111c36] transition-colors"
          >
            <Plus size={13} /> Add Log
          </button>
        </div>

        {logs.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-gray-400">
            <p className="text-sm font-medium">No daily logs yet</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-left">
                  <th className="px-4 py-3 font-semibold text-gray-600">Date</th>
                  <th className="px-4 py-3 font-semibold text-gray-600 hidden sm:table-cell">Employee</th>
                  <th className="px-4 py-3 font-semibold text-gray-600">Hours</th>
                  <th className="px-4 py-3 font-semibold text-gray-600 hidden md:table-cell">Material</th>
                  <th className="px-4 py-3 font-semibold text-gray-600 hidden lg:table-cell">Weather</th>
                  <th className="px-4 py-3 font-semibold text-gray-600 hidden lg:table-cell">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {logs.map((log) => {
                  const logWithEmp = log as DailyLogWithEmployee;
                  return (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-700">
                        {new Date(log.log_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </td>
                      <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">
                        {logWithEmp.employee
                          ? `${logWithEmp.employee.first_name} ${logWithEmp.employee.last_name}`
                          : "—"}
                      </td>
                      <td className="px-4 py-3 text-gray-700 font-medium">
                        {log.hours !== null ? `${log.hours}h` : "—"}
                      </td>
                      <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{log.material_moved ?? "—"}</td>
                      <td className="px-4 py-3 text-gray-500 hidden lg:table-cell">{log.weather ?? "—"}</td>
                      <td className="px-4 py-3 text-gray-400 text-xs hidden lg:table-cell">{log.notes ?? ""}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Phase Modal */}
      {showPhaseModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-[#1a2744]">Add Phase</h2>
            </div>
            <form onSubmit={handleAddPhase} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Phase Name *</label>
                <input
                  required
                  value={phaseForm.name}
                  onChange={(e) => setPhaseForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Site Prep"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#e8600a]/30"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Status</label>
                  <select
                    value={phaseForm.status}
                    onChange={(e) => setPhaseForm((f) => ({ ...f, status: e.target.value as PhaseStatus }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#e8600a]/30"
                  >
                    <option value="pending">Pending</option>
                    <option value="active">Active</option>
                    <option value="complete">Complete</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Budget ($)</label>
                  <input
                    type="number"
                    min="0"
                    value={phaseForm.budget}
                    onChange={(e) => setPhaseForm((f) => ({ ...f, budget: e.target.value }))}
                    placeholder="0"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#e8600a]/30"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={phaseForm.start_date}
                    onChange={(e) => setPhaseForm((f) => ({ ...f, start_date: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#e8600a]/30"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">End Date</label>
                  <input
                    type="date"
                    value={phaseForm.end_date}
                    onChange={(e) => setPhaseForm((f) => ({ ...f, end_date: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#e8600a]/30"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Notes</label>
                <textarea
                  value={phaseForm.notes}
                  onChange={(e) => setPhaseForm((f) => ({ ...f, notes: e.target.value }))}
                  rows={2}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#e8600a]/30 resize-none"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowPhaseModal(false)} className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={savingPhase} className="flex-1 px-4 py-2 bg-[#e8600a] text-white text-sm font-semibold rounded-lg hover:bg-[#c4500a] disabled:opacity-60">
                  {savingPhase ? "Saving…" : "Add Phase"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Daily Log Modal */}
      {showLogModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-[#1a2744]">Add Daily Log</h2>
            </div>
            <form onSubmit={handleAddLog} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Date *</label>
                  <input
                    required
                    type="date"
                    value={logForm.log_date}
                    onChange={(e) => setLogForm((f) => ({ ...f, log_date: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#e8600a]/30"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Hours</label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={logForm.hours}
                    onChange={(e) => setLogForm((f) => ({ ...f, hours: e.target.value }))}
                    placeholder="8"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#e8600a]/30"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Equipment Used</label>
                <input
                  value={logForm.equipment_used}
                  onChange={(e) => setLogForm((f) => ({ ...f, equipment_used: e.target.value }))}
                  placeholder="Mack Super Dump"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#e8600a]/30"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Material Moved</label>
                <input
                  value={logForm.material_moved}
                  onChange={(e) => setLogForm((f) => ({ ...f, material_moved: e.target.value }))}
                  placeholder="200 tons road base"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#e8600a]/30"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Weather</label>
                <input
                  value={logForm.weather}
                  onChange={(e) => setLogForm((f) => ({ ...f, weather: e.target.value }))}
                  placeholder="Sunny, 75°F"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#e8600a]/30"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Notes</label>
                <textarea
                  value={logForm.notes}
                  onChange={(e) => setLogForm((f) => ({ ...f, notes: e.target.value }))}
                  rows={2}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#e8600a]/30 resize-none"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowLogModal(false)} className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={savingLog} className="flex-1 px-4 py-2 bg-[#1a2744] text-white text-sm font-semibold rounded-lg hover:bg-[#111c36] disabled:opacity-60">
                  {savingLog ? "Saving…" : "Add Log"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
