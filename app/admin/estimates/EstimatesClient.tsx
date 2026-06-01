"use client";

import { useState } from "react";
import {
  FileText, Plus, ChevronRight, DollarSign, Clock, CheckCircle,
  X, Loader2
} from "lucide-react";

type Client = { id: string; name: string };

type EstimateItem = {
  description: string;
  qty: number;
  unit: string;
  unit_price: number;
};

type Estimate = {
  id: string;
  estimate_number: string;
  status: string;
  total: number;
  issue_date: string | null;
  expiry_date: string | null;
  notes: string | null;
  client_id: string;
  client_name: string | null;
};

function statusBadge(status: string) {
  const map: Record<string, string> = {
    draft: "bg-gray-100 text-gray-600",
    sent: "bg-blue-100 text-blue-700",
    approved: "bg-green-100 text-green-700",
    declined: "bg-red-100 text-red-700",
    expired: "bg-yellow-100 text-yellow-700",
  };
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-semibold capitalize ${map[status] ?? "bg-gray-100 text-gray-500"}`}>
      {status}
    </span>
  );
}

function fmtDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

const EMPTY_ITEM: EstimateItem = { description: "", qty: 1, unit: "load", unit_price: 0 };

export default function EstimatesClient({
  estimates,
  clients,
}: {
  estimates: Estimate[];
  clients: Client[];
}) {
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [clientId, setClientId] = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<EstimateItem[]>([{ ...EMPTY_ITEM }]);
  const [list, setList] = useState(estimates);

  const total = estimates.length;
  const pending = estimates.filter((e) => e.status === "sent").length;
  const approvedVal = estimates
    .filter((e) => e.status === "approved")
    .reduce((s, e) => s + e.total, 0);

  function addItem() {
    setItems((prev) => [...prev, { ...EMPTY_ITEM }]);
  }

  function removeItem(i: number) {
    setItems((prev) => prev.filter((_, idx) => idx !== i));
  }

  function updateItem(i: number, field: keyof EstimateItem, value: string | number) {
    setItems((prev) =>
      prev.map((item, idx) =>
        idx === i ? { ...item, [field]: value } : item
      )
    );
  }

  function lineTotal(item: EstimateItem) {
    return item.qty * item.unit_price;
  }

  const estimateTotal = items.reduce((s, i) => s + lineTotal(i), 0);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/estimates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ client_id: clientId, notes, items }),
      });
      if (res.ok) {
        const { estimate } = await res.json();
        const client = clients.find((c) => c.id === clientId);
        setList((prev) => [{ ...estimate, client_name: client?.name ?? null }, ...prev]);
        setShowModal(false);
        setClientId("");
        setNotes("");
        setItems([{ ...EMPTY_ITEM }]);
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <FileText size={22} className="text-[#e8600a]" />
          <h1 className="text-2xl font-extrabold text-[#1a2744]">Estimates</h1>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#e8600a] text-white text-sm font-semibold rounded-lg hover:bg-[#c4500a] transition-colors"
        >
          <Plus size={15} /> New Estimate
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-1">
            <FileText size={16} className="text-gray-400" />
            <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">Total</span>
          </div>
          <div className="text-3xl font-extrabold text-[#1a2744]">{total}</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-1">
            <Clock size={16} className="text-blue-500" />
            <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">Pending Approval</span>
          </div>
          <div className="text-3xl font-extrabold text-blue-600">{pending}</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign size={16} className="text-green-500" />
            <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">Approved Value</span>
          </div>
          <div className="text-3xl font-extrabold text-green-600">${approvedVal.toLocaleString("en-US", { minimumFractionDigits: 2 })}</div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-left">
              <th className="px-4 py-3 font-semibold text-gray-600">#</th>
              <th className="px-4 py-3 font-semibold text-gray-600">Client</th>
              <th className="px-4 py-3 font-semibold text-gray-600">Status</th>
              <th className="px-4 py-3 font-semibold text-gray-600 text-right">Total</th>
              <th className="px-4 py-3 font-semibold text-gray-600 hidden md:table-cell">Issued</th>
              <th className="px-4 py-3 font-semibold text-gray-600 hidden lg:table-cell">Expires</th>
              <th className="px-4 py-3 font-semibold text-gray-600 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {list.map((est) => (
              <tr key={est.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 font-semibold text-[#e8600a]">{est.estimate_number}</td>
                <td className="px-4 py-3 text-[#1a2744] font-medium">{est.client_name ?? "—"}</td>
                <td className="px-4 py-3">{statusBadge(est.status)}</td>
                <td className="px-4 py-3 text-right font-semibold text-[#1a2744]">
                  ${est.total.toFixed(2)}
                </td>
                <td className="px-4 py-3 text-gray-500 text-xs hidden md:table-cell">
                  {fmtDate(est.issue_date)}
                </td>
                <td className="px-4 py-3 text-gray-500 text-xs hidden lg:table-cell">
                  {fmtDate(est.expiry_date)}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {est.status === "approved" && (
                      <button className="flex items-center gap-1 px-2 py-1 text-xs bg-green-50 text-green-700 rounded hover:bg-green-100 transition-colors font-medium">
                        <ChevronRight size={12} /> Convert
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {list.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-gray-400">
                  No estimates yet. Create your first one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* New Estimate Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-gray-200">
              <h2 className="text-lg font-bold text-[#1a2744]">New Estimate</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {/* Client */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Client *</label>
                <select
                  required
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e8600a]/20 focus:border-[#e8600a]"
                >
                  <option value="">Select client…</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Notes</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e8600a]/20 focus:border-[#e8600a] resize-none"
                  placeholder="Optional notes for this estimate…"
                />
              </div>

              {/* Line items */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-gray-600">Line Items</label>
                  <button type="button" onClick={addItem} className="text-xs text-[#e8600a] hover:underline font-medium">
                    + Add Item
                  </button>
                </div>
                <div className="space-y-2">
                  {items.map((item, i) => (
                    <div key={i} className="grid grid-cols-12 gap-2 items-center">
                      <input
                        type="text"
                        placeholder="Description"
                        value={item.description}
                        onChange={(e) => updateItem(i, "description", e.target.value)}
                        className="col-span-5 px-2 py-1.5 text-xs border border-gray-200 rounded focus:outline-none focus:border-[#e8600a]"
                      />
                      <input
                        type="number"
                        placeholder="Qty"
                        value={item.qty}
                        min={0}
                        onChange={(e) => updateItem(i, "qty", parseFloat(e.target.value) || 0)}
                        className="col-span-2 px-2 py-1.5 text-xs border border-gray-200 rounded focus:outline-none focus:border-[#e8600a]"
                      />
                      <input
                        type="text"
                        placeholder="Unit"
                        value={item.unit}
                        onChange={(e) => updateItem(i, "unit", e.target.value)}
                        className="col-span-2 px-2 py-1.5 text-xs border border-gray-200 rounded focus:outline-none focus:border-[#e8600a]"
                      />
                      <input
                        type="number"
                        placeholder="Price"
                        value={item.unit_price}
                        min={0}
                        step="0.01"
                        onChange={(e) => updateItem(i, "unit_price", parseFloat(e.target.value) || 0)}
                        className="col-span-2 px-2 py-1.5 text-xs border border-gray-200 rounded focus:outline-none focus:border-[#e8600a]"
                      />
                      <button
                        type="button"
                        onClick={() => removeItem(i)}
                        className="col-span-1 flex justify-center text-gray-400 hover:text-red-500"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="text-right mt-3 text-sm font-bold text-[#1a2744]">
                  Total: ${estimateTotal.toFixed(2)}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || !clientId}
                  className="flex items-center gap-1.5 px-4 py-2 bg-[#e8600a] text-white text-sm font-semibold rounded-lg hover:bg-[#c4500a] transition-colors disabled:opacity-50"
                >
                  {saving ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                  {saving ? "Saving…" : "Create Estimate"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
