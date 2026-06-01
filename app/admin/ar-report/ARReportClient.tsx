"use client";

import { useState } from "react";
import {
  DollarSign, AlertTriangle, TrendingUp, X, Loader2, StickyNote
} from "lucide-react";

type ARRow = {
  id: string;
  invoice_number: string;
  client_id: string;
  client_name: string | null;
  balance: number;
  due_date: string | null;
  status: string;
  age_days: number;
};

type Bucket = "current" | "30_60" | "61_90" | "90plus";

function getBucket(ageDays: number): Bucket {
  if (ageDays <= 0) return "current";
  if (ageDays <= 30) return "current";
  if (ageDays <= 60) return "30_60";
  if (ageDays <= 90) return "61_90";
  return "90plus";
}

function rowBg(ageDays: number) {
  if (ageDays <= 30) return "";
  if (ageDays <= 60) return "bg-yellow-50";
  if (ageDays <= 90) return "bg-orange-50";
  return "bg-red-50";
}

function ageBadge(ageDays: number) {
  const buckets: Record<Bucket, { label: string; cls: string }> = {
    current: { label: "Current", cls: "bg-green-100 text-green-700" },
    "30_60": { label: "31–60 days", cls: "bg-yellow-100 text-yellow-700" },
    "61_90": { label: "61–90 days", cls: "bg-orange-100 text-orange-700" },
    "90plus": { label: "90+ days", cls: "bg-red-100 text-red-700" },
  };
  const b = getBucket(ageDays);
  const { label, cls } = buckets[b];
  return <span className={`px-2 py-0.5 rounded text-xs font-semibold ${cls}`}>{label}</span>;
}

function fmtDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

const BUCKET_LABELS: Record<Bucket, string> = {
  current: "Current (0–30)",
  "30_60": "31–60 Days",
  "61_90": "61–90 Days",
  "90plus": "90+ Days",
};

export default function ARReportClient({ rows }: { rows: ARRow[] }) {
  const [noteModal, setNoteModal] = useState<ARRow | null>(null);
  const [noteText, setNoteText] = useState("");
  const [saving, setSaving] = useState(false);

  const totalOutstanding = rows.reduce((s, r) => s + r.balance, 0);
  const overdue = rows.filter((r) => r.age_days > 30);
  const overdueCount = overdue.length;
  const largest = overdue.reduce(
    (max, r) => (!max || r.balance > max.balance ? r : max),
    null as ARRow | null
  );

  const buckets: Bucket[] = ["current", "30_60", "61_90", "90plus"];

  async function saveNote() {
    if (!noteModal || !noteText.trim()) return;
    setSaving(true);
    try {
      await fetch("/api/ar-notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoice_id: noteModal.id, note: noteText }),
      });
      setNoteModal(null);
      setNoteText("");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <TrendingUp size={22} className="text-[#e8600a]" />
        <h1 className="text-2xl font-extrabold text-[#1a2744]">AR Aging Report</h1>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign size={16} className="text-[#e8600a]" />
            <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">Total Outstanding</span>
          </div>
          <div className="text-3xl font-extrabold text-[#1a2744]">
            ${totalOutstanding.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle size={16} className="text-red-500" />
            <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">Overdue Count</span>
          </div>
          <div className="text-3xl font-extrabold text-red-600">{overdueCount}</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle size={16} className="text-orange-500" />
            <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">Largest Overdue</span>
          </div>
          <div className="text-lg font-extrabold text-[#1a2744] truncate">
            {largest ? (
              <>
                <span className="text-orange-600">${largest.balance.toFixed(2)}</span>
                <span className="text-sm text-gray-500 ml-2 font-medium">{largest.client_name ?? "—"}</span>
              </>
            ) : (
              <span className="text-gray-400 text-sm">None</span>
            )}
          </div>
        </div>
      </div>

      {/* Aging buckets */}
      {buckets.map((bucket) => {
        const bucketRows = rows.filter((r) => getBucket(r.age_days) === bucket);
        if (bucketRows.length === 0) return null;
        const bucketTotal = bucketRows.reduce((s, r) => s + r.balance, 0);

        return (
          <div key={bucket} className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-bold text-[#1a2744] text-sm">{BUCKET_LABELS[bucket]}</h2>
              <span className="text-xs text-gray-500 font-semibold">
                ${bucketTotal.toLocaleString("en-US", { minimumFractionDigits: 2 })} · {bucketRows.length} invoice{bucketRows.length !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-left">
                    <th className="px-4 py-2.5 font-semibold text-gray-600 text-xs">Invoice</th>
                    <th className="px-4 py-2.5 font-semibold text-gray-600 text-xs">Client</th>
                    <th className="px-4 py-2.5 font-semibold text-gray-600 text-xs text-right">Balance</th>
                    <th className="px-4 py-2.5 font-semibold text-gray-600 text-xs hidden md:table-cell">Due</th>
                    <th className="px-4 py-2.5 font-semibold text-gray-600 text-xs">Age</th>
                    <th className="px-4 py-2.5 font-semibold text-gray-600 text-xs text-right">Note</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {bucketRows.map((r) => (
                    <tr key={r.id} className={`${rowBg(r.age_days)} hover:brightness-95 transition-all`}>
                      <td className="px-4 py-2.5 font-semibold text-[#e8600a] text-xs">{r.invoice_number}</td>
                      <td className="px-4 py-2.5 text-[#1a2744] font-medium text-xs">{r.client_name ?? "—"}</td>
                      <td className="px-4 py-2.5 text-right font-bold text-[#1a2744] text-xs">${r.balance.toFixed(2)}</td>
                      <td className="px-4 py-2.5 text-gray-500 text-xs hidden md:table-cell">{fmtDate(r.due_date)}</td>
                      <td className="px-4 py-2.5">{ageBadge(r.age_days)}</td>
                      <td className="px-4 py-2.5 text-right">
                        <button
                          onClick={() => { setNoteModal(r); setNoteText(""); }}
                          className="flex items-center gap-1 px-2 py-0.5 text-xs bg-[#1a2744] text-white rounded hover:bg-[#0f1a33] transition-colors ml-auto"
                        >
                          <StickyNote size={10} /> Note
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}

      {rows.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <DollarSign size={32} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500 font-medium">No outstanding balances</p>
          <p className="text-sm text-gray-400 mt-1">All invoices are fully paid.</p>
        </div>
      )}

      {/* Note modal */}
      {noteModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b border-gray-200">
              <h2 className="font-bold text-[#1a2744]">Collection Note — {noteModal.invoice_number}</h2>
              <button onClick={() => setNoteModal(null)} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>
            <div className="p-5">
              <label className="block text-xs font-semibold text-gray-600 mb-2">Note</label>
              <textarea
                rows={4}
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Add a collection note for this invoice…"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e8600a]/20 focus:border-[#e8600a] resize-none"
              />
              <div className="flex justify-end gap-2 mt-3">
                <button
                  onClick={() => setNoteModal(null)}
                  className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={saveNote}
                  disabled={saving || !noteText.trim()}
                  className="flex items-center gap-1.5 px-4 py-2 bg-[#e8600a] text-white text-sm font-semibold rounded-lg hover:bg-[#c4500a] transition-colors disabled:opacity-50"
                >
                  {saving ? <Loader2 size={13} className="animate-spin" /> : <StickyNote size={13} />}
                  {saving ? "Saving…" : "Save Note"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
