"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import type { Client, Invoice, InvoiceItem } from "@/lib/types/db";
import { materials } from "@/lib/materials";

type LineItem = Omit<InvoiceItem, "id" | "invoice_id" | "sort_order">;

const DEFAULT_ITEM: LineItem = { description: "", material: null, quantity: 1, unit: "ton", unit_price: 0, total: 0 };

export default function InvoiceForm({ invoice, clients, defaultClientId }: {
  invoice?: Invoice & { items?: InvoiceItem[] };
  clients: Client[];
  defaultClientId?: string;
}) {
  const router = useRouter();
  const [clientId, setClientId] = useState(invoice?.client_id ?? defaultClientId ?? "");
  const [status, setStatus] = useState(invoice?.status ?? "draft");
  const [issueDate, setIssueDate] = useState(invoice?.issue_date ?? new Date().toISOString().split("T")[0]);
  const [dueDate, setDueDate] = useState(invoice?.due_date ?? "");
  const [taxRate, setTaxRate] = useState(String((invoice?.tax_rate ?? 0) * 100));
  const [notes, setNotes] = useState(invoice?.notes ?? "");
  const [items, setItems] = useState<LineItem[]>(
    invoice?.items?.map(({ description, material, quantity, unit, unit_price, total }) =>
      ({ description, material, quantity, unit, unit_price, total })) ?? [{ ...DEFAULT_ITEM }]
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const subtotal = items.reduce((s, i) => s + i.total, 0);
  const taxAmount = subtotal * (parseFloat(taxRate) / 100 || 0);
  const total = subtotal + taxAmount;

  function updateItem(idx: number, field: keyof LineItem, value: string | number | null) {
    setItems((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: value };
      if (field === "quantity" || field === "unit_price") {
        next[idx].total = +(next[idx].quantity * next[idx].unit_price).toFixed(2);
      }
      return next;
    });
  }

  function addItem() { setItems((p) => [...p, { ...DEFAULT_ITEM }]); }
  function removeItem(idx: number) { setItems((p) => p.filter((_, i) => i !== idx)); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!clientId) { setError("Select a client"); return; }
    setLoading(true);
    setError("");

    const payload = {
      client_id: clientId,
      status,
      issue_date: issueDate,
      due_date: dueDate || null,
      tax_rate: parseFloat(taxRate) / 100 || 0,
      notes: notes || null,
      items,
    };

    const res = await fetch(
      invoice ? `/api/invoices/${invoice.id}` : "/api/invoices",
      { method: invoice ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }
    );

    if (res.ok) {
      const data = await res.json();
      router.push(`/admin/invoices/${data.id}`);
    } else {
      const err = await res.json();
      setError(err.error ?? "Failed to save invoice");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="sm:col-span-2">
          <label className="block text-sm font-semibold text-gray-700 mb-1">Client *</label>
          <select
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#e8600a]"
          >
            <option value="">Select client…</option>
            {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as Invoice["status"])}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#e8600a]"
          >
            {["draft", "sent", "paid", "overdue", "void"].map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Issue Date</label>
          <input type="date" value={issueDate} onChange={(e) => setIssueDate(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#e8600a]" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Due Date</label>
          <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#e8600a]" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Tax Rate (%)</label>
          <input type="number" min="0" max="30" step="0.1" value={taxRate} onChange={(e) => setTaxRate(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#e8600a]" />
        </div>
      </div>

      {/* Line items */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-semibold text-gray-700">Line Items</label>
          <button type="button" onClick={addItem} className="flex items-center gap-1 text-xs text-[#e8600a] font-semibold hover:underline">
            <Plus size={12} /> Add item
          </button>
        </div>
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-3 py-2 text-left font-semibold text-gray-600">Description</th>
                <th className="px-3 py-2 text-left font-semibold text-gray-600 hidden md:table-cell">Material</th>
                <th className="px-3 py-2 text-right font-semibold text-gray-600 w-20">Qty</th>
                <th className="px-3 py-2 text-left font-semibold text-gray-600 w-16 hidden sm:table-cell">Unit</th>
                <th className="px-3 py-2 text-right font-semibold text-gray-600 w-24">Price</th>
                <th className="px-3 py-2 text-right font-semibold text-gray-600 w-24">Total</th>
                <th className="px-3 py-2 w-8"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((item, idx) => (
                <tr key={idx}>
                  <td className="px-2 py-1.5">
                    <input value={item.description} onChange={(e) => updateItem(idx, "description", e.target.value)}
                      placeholder="Description" required
                      className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#e8600a]" />
                  </td>
                  <td className="px-2 py-1.5 hidden md:table-cell">
                    <select value={item.material ?? ""} onChange={(e) => updateItem(idx, "material", e.target.value || null)}
                      className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#e8600a]">
                      <option value="">—</option>
                      {materials.map((m) => <option key={m.id} value={m.name}>{m.name}</option>)}
                    </select>
                  </td>
                  <td className="px-2 py-1.5">
                    <input type="number" min="0" step="0.01" value={item.quantity}
                      onChange={(e) => updateItem(idx, "quantity", parseFloat(e.target.value) || 0)}
                      className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm text-right focus:outline-none focus:ring-1 focus:ring-[#e8600a]" />
                  </td>
                  <td className="px-2 py-1.5 hidden sm:table-cell">
                    <select value={item.unit} onChange={(e) => updateItem(idx, "unit", e.target.value)}
                      className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#e8600a]">
                      {["ton", "yard", "load", "hr", "ea"].map((u) => <option key={u} value={u}>{u}</option>)}
                    </select>
                  </td>
                  <td className="px-2 py-1.5">
                    <input type="number" min="0" step="0.01" value={item.unit_price}
                      onChange={(e) => updateItem(idx, "unit_price", parseFloat(e.target.value) || 0)}
                      className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm text-right focus:outline-none focus:ring-1 focus:ring-[#e8600a]" />
                  </td>
                  <td className="px-3 py-1.5 text-right font-semibold text-[#1a2744]">${item.total.toFixed(2)}</td>
                  <td className="px-2 py-1.5">
                    {items.length > 1 && (
                      <button type="button" onClick={() => removeItem(idx)} className="text-gray-300 hover:text-red-500 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="mt-3 flex justify-end">
          <div className="w-56 space-y-1.5 text-sm">
            <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
            <div className="flex justify-between text-gray-600"><span>Tax ({taxRate || 0}%)</span><span>${taxAmount.toFixed(2)}</span></div>
            <div className="flex justify-between font-bold text-[#1a2744] text-base border-t border-gray-200 pt-1.5"><span>Total</span><span>${total.toFixed(2)}</span></div>
          </div>
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Notes</label>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2}
          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#e8600a] resize-none" />
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}
      <div className="flex gap-3">
        <button type="submit" disabled={loading}
          className="px-6 py-2.5 bg-[#e8600a] hover:bg-[#c4500a] disabled:opacity-60 text-white font-bold rounded-lg transition-colors">
          {loading ? "Saving…" : invoice ? "Save Changes" : "Create Invoice"}
        </button>
        <button type="button" onClick={() => router.back()}
          className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-colors">
          Cancel
        </button>
      </div>
    </form>
  );
}
