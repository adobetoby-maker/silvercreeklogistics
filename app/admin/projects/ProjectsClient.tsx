"use client";

import { useState } from "react";
import Link from "next/link";
import { Briefcase, Plus, DollarSign } from "lucide-react";
import type { CommercialProject, ProjectStatus, Client, ProjectPhase } from "@/lib/types/db";

type ClientStub = Pick<Client, "id" | "name">;

const STATUS_COLUMNS: { key: ProjectStatus; label: string; color: string }[] = [
  { key: "bid", label: "Bid", color: "bg-yellow-50 border-yellow-200" },
  { key: "active", label: "Active", color: "bg-blue-50 border-blue-200" },
  { key: "on_hold", label: "On Hold", color: "bg-gray-50 border-gray-200" },
  { key: "complete", label: "Complete", color: "bg-green-50 border-green-200" },
];

const STATUS_BADGE: Record<ProjectStatus, string> = {
  bid: "bg-yellow-100 text-yellow-700",
  active: "bg-blue-100 text-blue-700",
  on_hold: "bg-gray-100 text-gray-600",
  complete: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-600",
};

export default function ProjectsClient({
  projects: initial,
  clients,
}: {
  projects: CommercialProject[];
  clients: ClientStub[];
}) {
  const [projects, setProjects] = useState<CommercialProject[]>(initial);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    client_id: "",
    status: "bid" as ProjectStatus,
    start_date: "",
    end_date: "",
    contract_value: "",
    address: "",
    city: "",
    project_manager: "",
    notes: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        client_id: form.client_id || null,
        contract_value: form.contract_value ? parseFloat(form.contract_value) : null,
        start_date: form.start_date || null,
        end_date: form.end_date || null,
      }),
    });
    if (res.ok) {
      const { project } = await res.json() as { project: CommercialProject };
      const client = clients.find((c) => c.id === form.client_id);
      setProjects((prev) => [{ ...project, client: client as Client | undefined, phases: [] }, ...prev]);
      setShowModal(false);
      setForm({ name: "", client_id: "", status: "bid", start_date: "", end_date: "", contract_value: "", address: "", city: "", project_manager: "", notes: "" });
    }
    setSaving(false);
  }

  function phaseProgress(phases: ProjectPhase[] | undefined) {
    if (!phases || phases.length === 0) return { total: 0, complete: 0 };
    return {
      total: phases.length,
      complete: phases.filter((p) => p.status === "complete").length,
    };
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-extrabold text-[#1a2744] flex items-center gap-2">
          <Briefcase size={22} /> Commercial Projects
        </h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#e8600a] text-white text-sm font-semibold rounded-lg hover:bg-[#c4500a] transition-colors"
        >
          <Plus size={15} /> New Project
        </button>
      </div>

      {/* Kanban columns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {STATUS_COLUMNS.map(({ key, label, color }) => {
          const col = projects.filter((p) => p.status === key);
          return (
            <div key={key} className={`rounded-xl border ${color} p-4 min-h-[200px]`}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-sm text-gray-700">{label}</h2>
                <span className="text-xs font-semibold bg-white/60 px-2 py-0.5 rounded-full text-gray-500">
                  {col.length}
                </span>
              </div>

              {col.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-6">No projects</p>
              ) : (
                <div className="space-y-3">
                  {col.map((project) => {
                    const { total, complete } = phaseProgress(project.phases);
                    const pct = total > 0 ? (complete / total) * 100 : 0;
                    return (
                      <Link key={project.id} href={`/admin/projects/${project.id}`}>
                        <div className="bg-white rounded-lg p-4 shadow-sm border border-white hover:border-[#e8600a]/30 transition-colors cursor-pointer">
                          <p className="font-bold text-[#1a2744] text-sm leading-tight mb-1">{project.name}</p>
                          {project.client && (
                            <p className="text-xs text-gray-500 mb-2">{project.client.name}</p>
                          )}
                          {project.contract_value !== null && (
                            <p className="flex items-center gap-0.5 text-xs font-semibold text-gray-700 mb-3">
                              <DollarSign size={11} />
                              {project.contract_value.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                            </p>
                          )}
                          {total > 0 && (
                            <div>
                              <div className="flex justify-between text-xs text-gray-400 mb-1">
                                <span>Phases</span>
                                <span>{complete}/{total}</span>
                              </div>
                              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-[#e8600a] rounded-full"
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                            </div>
                          )}
                          {project.project_manager && (
                            <p className="text-xs text-gray-400 mt-2">PM: {project.project_manager}</p>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Empty state when no projects at all */}
      {projects.length === 0 && (
        <div className="text-center py-16 text-gray-400 mt-4">
          <Briefcase size={36} className="mx-auto mb-3 opacity-30" />
          <p className="font-medium">No commercial projects yet</p>
          <p className="text-sm mt-1">Create your first project using the button above</p>
        </div>
      )}

      {/* New Project Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl">
              <h2 className="text-lg font-bold text-[#1a2744]">New Project</h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Project Name *</label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Perrine Bridge Rd Grading"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#e8600a]/30"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Client</label>
                  <select
                    value={form.client_id}
                    onChange={(e) => setForm((f) => ({ ...f, client_id: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#e8600a]/30"
                  >
                    <option value="">— Select —</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as ProjectStatus }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#e8600a]/30"
                  >
                    <option value="bid">Bid</option>
                    <option value="active">Active</option>
                    <option value="on_hold">On Hold</option>
                    <option value="complete">Complete</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={form.start_date}
                    onChange={(e) => setForm((f) => ({ ...f, start_date: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#e8600a]/30"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">End Date</label>
                  <input
                    type="date"
                    value={form.end_date}
                    onChange={(e) => setForm((f) => ({ ...f, end_date: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#e8600a]/30"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Contract Value ($)</label>
                  <input
                    type="number"
                    min="0"
                    step="100"
                    value={form.contract_value}
                    onChange={(e) => setForm((f) => ({ ...f, contract_value: e.target.value }))}
                    placeholder="0"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#e8600a]/30"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Project Manager</label>
                  <input
                    value={form.project_manager}
                    onChange={(e) => setForm((f) => ({ ...f, project_manager: e.target.value }))}
                    placeholder="Name"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#e8600a]/30"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Address</label>
                <input
                  value={form.address}
                  onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                  placeholder="123 Main St"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#e8600a]/30"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">City</label>
                <input
                  value={form.city}
                  onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                  placeholder="Twin Falls"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#e8600a]/30"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Notes</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                  rows={2}
                  placeholder="Any project notes…"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#e8600a]/30 resize-none"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-2 bg-[#e8600a] text-white text-sm font-semibold rounded-lg hover:bg-[#c4500a] disabled:opacity-60"
                >
                  {saving ? "Saving…" : "Create Project"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Status badge reference (used to satisfy STATUS_BADGE import) */}
      <div className="hidden">
        {Object.entries(STATUS_BADGE).map(([k, v]) => <span key={k} className={v} />)}
      </div>
    </div>
  );
}
