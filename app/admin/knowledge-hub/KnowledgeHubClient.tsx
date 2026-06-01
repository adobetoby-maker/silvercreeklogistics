"use client";

import { useState } from "react";
import { BookOpen, Plus, ToggleLeft, ToggleRight, Trash2, Loader2, X } from "lucide-react";

type KnowledgeEntry = {
  id: string;
  created_at: string;
  category: string;
  question: string;
  answer: string;
  enabled: boolean;
  sort_order: number;
};

const CATEGORIES = [
  { value: "service", label: "Service" },
  { value: "pricing", label: "Pricing" },
  { value: "hours", label: "Hours" },
  { value: "coverage_area", label: "Coverage Area" },
  { value: "faq", label: "FAQ" },
  { value: "policy", label: "Policy" },
  { value: "equipment", label: "Equipment" },
  { value: "other", label: "Other" },
];

const CATEGORY_COLORS: Record<string, string> = {
  service: "bg-blue-100 text-blue-700",
  pricing: "bg-green-100 text-green-700",
  hours: "bg-yellow-100 text-yellow-700",
  coverage_area: "bg-purple-100 text-purple-700",
  faq: "bg-orange-100 text-orange-700",
  policy: "bg-red-100 text-red-700",
  equipment: "bg-cyan-100 text-cyan-700",
  other: "bg-gray-100 text-gray-700",
};

const DEFAULT_ENTRIES: Omit<KnowledgeEntry, "id" | "created_at">[] = [
  {
    category: "service",
    question: "What materials do you deliver?",
    answer: "We deliver road base, crushed gravel, sand, rip rap, decorative rock, pit run, and other aggregate materials throughout the Magic Valley region.",
    enabled: true,
    sort_order: 1,
  },
  {
    category: "coverage_area",
    question: "What areas do you serve?",
    answer: "We serve Twin Falls, Jerome, Gooding, Blaine County, Cassia County, and surrounding Magic Valley communities within approximately 60 miles.",
    enabled: true,
    sort_order: 2,
  },
  {
    category: "hours",
    question: "What are your hours of operation?",
    answer: "Monday through Friday 7am-6pm, Saturday 8am-2pm. Emergency deliveries can sometimes be arranged — call for availability.",
    enabled: true,
    sort_order: 3,
  },
  {
    category: "pricing",
    question: "How do you price deliveries?",
    answer: "Pricing is based on material type, quantity (by the ton), and delivery distance. Minimum delivery is typically 5 tons. Call or request a quote online for current prices.",
    enabled: true,
    sort_order: 4,
  },
];

export default function KnowledgeHubClient({ entries: initialEntries }: { entries: KnowledgeEntry[] }) {
  const [entries, setEntries] = useState<KnowledgeEntry[]>(initialEntries);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    category: "faq",
    question: "",
    answer: "",
  });

  const handleToggle = async (entry: KnowledgeEntry) => {
    setTogglingId(entry.id);
    try {
      const res = await fetch("/api/knowledge", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: entry.id, enabled: !entry.enabled }),
      });
      if (res.ok) {
        setEntries((prev) =>
          prev.map((e) => (e.id === entry.id ? { ...e, enabled: !e.enabled } : e))
        );
      }
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this knowledge entry?")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/knowledge?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setEntries((prev) => prev.filter((e) => e.id !== id));
      }
    } finally {
      setDeletingId(null);
    }
  };

  const handleSave = async () => {
    if (!form.question.trim() || !form.answer.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/knowledge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        const created = await res.json() as KnowledgeEntry;
        setEntries((prev) => [created, ...prev]);
        setForm({ category: "faq", question: "", answer: "" });
        setShowForm(false);
      }
    } finally {
      setSaving(false);
    }
  };

  const seedDefaults = async () => {
    if (!confirm("Add default sample knowledge entries?")) return;
    setSaving(true);
    for (const entry of DEFAULT_ENTRIES) {
      const res = await fetch("/api/knowledge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(entry),
      });
      if (res.ok) {
        const created = await res.json() as KnowledgeEntry;
        setEntries((prev) => [...prev, created]);
      }
    }
    setSaving(false);
  };

  const enabledCount = entries.filter((e) => e.enabled).length;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1a2744]">Knowledge Hub</h1>
          <p className="text-gray-500 text-sm mt-1">
            Business knowledge used by the AI assistant to answer questions.{" "}
            <span className="text-[#e8600a] font-medium">{enabledCount} active</span> of {entries.length} entries.
          </p>
        </div>
        <div className="flex gap-2">
          {entries.length === 0 && (
            <button
              onClick={seedDefaults}
              disabled={saving}
              className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Seed Defaults
            </button>
          )}
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#e8600a] text-white text-sm rounded-lg hover:bg-[#d4550a] transition-colors cursor-pointer"
          >
            <Plus size={16} />
            Add Entry
          </button>
        </div>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">New Knowledge Entry</h2>
            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
              <X size={18} />
            </button>
          </div>
          <div className="grid gap-4">
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#e8600a]"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Question / Topic</label>
              <input
                type="text"
                value={form.question}
                onChange={(e) => setForm((f) => ({ ...f, question: e.target.value }))}
                placeholder="e.g. What materials do you deliver?"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#e8600a]"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Answer</label>
              <textarea
                value={form.answer}
                onChange={(e) => setForm((f) => ({ ...f, answer: e.target.value }))}
                placeholder="Provide a clear, complete answer that the AI can use..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#e8600a] resize-none"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !form.question.trim() || !form.answer.trim()}
                className="flex items-center gap-2 px-4 py-2 bg-[#1a2744] text-white text-sm rounded-lg hover:bg-[#253565] disabled:opacity-50 transition-colors cursor-pointer"
              >
                {saving && <Loader2 size={14} className="animate-spin" />}
                Save Entry
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Empty state */}
      {entries.length === 0 && !showForm && (
        <div className="text-center py-16 bg-white border border-gray-200 rounded-xl">
          <BookOpen size={40} className="mx-auto text-gray-300 mb-3" />
          <h3 className="font-semibold text-gray-600 mb-1">No Knowledge Entries Yet</h3>
          <p className="text-gray-400 text-sm mb-4">Add entries to help the AI assistant answer questions about your business.</p>
          <button
            onClick={seedDefaults}
            className="px-4 py-2 bg-[#e8600a] text-white text-sm rounded-lg hover:bg-[#d4550a] transition-colors cursor-pointer"
          >
            Add Sample Entries
          </button>
        </div>
      )}

      {/* Entries table */}
      {entries.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-24">Category</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Question</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Answer</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-20">Active</th>
                <th className="w-10" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {entries.map((entry) => (
                <tr key={entry.id} className={`hover:bg-gray-50 transition-colors ${!entry.enabled ? "opacity-50" : ""}`}>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${CATEGORY_COLORS[entry.category] ?? "bg-gray-100 text-gray-700"}`}>
                      {CATEGORIES.find((c) => c.value === entry.category)?.label ?? entry.category}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-gray-900">{entry.question}</p>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <p className="text-sm text-gray-500 truncate max-w-xs">{entry.answer}</p>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => handleToggle(entry)}
                      disabled={togglingId === entry.id}
                      className="cursor-pointer"
                      title={entry.enabled ? "Disable" : "Enable"}
                    >
                      {togglingId === entry.id ? (
                        <Loader2 size={20} className="animate-spin text-gray-400 mx-auto" />
                      ) : entry.enabled ? (
                        <ToggleRight size={24} className="text-[#e8600a]" />
                      ) : (
                        <ToggleLeft size={24} className="text-gray-300" />
                      )}
                    </button>
                  </td>
                  <td className="px-3 py-3">
                    <button
                      onClick={() => handleDelete(entry.id)}
                      disabled={deletingId === entry.id}
                      className="p-1 text-gray-300 hover:text-red-500 transition-colors cursor-pointer"
                      title="Delete"
                    >
                      {deletingId === entry.id ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Trash2 size={14} />
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
