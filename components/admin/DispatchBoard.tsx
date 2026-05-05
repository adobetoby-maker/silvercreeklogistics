"use client";

import { useState } from "react";
import { Phone, MapPin, Package, Calendar, User, ChevronRight, X } from "lucide-react";
import { drivers } from "@/lib/drivers";

type Request = {
  id: string;
  created_at: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  material_name: string;
  quantity: number;
  unit: string;
  delivery_address: string;
  delivery_city: string | null;
  requested_date: string | null;
  delivery_notes: string | null;
  status: "new" | "assigned" | "in_transit" | "delivered" | "cancelled";
  driver_name: string | null;
  driver_email: string | null;
  driver_phone: string | null;
  scheduled_date: string | null;
  scheduled_time: string | null;
  internal_notes: string | null;
};

const COLUMNS: { key: Request["status"]; label: string; color: string; dot: string }[] = [
  { key: "new",        label: "New",        color: "border-t-orange-500",  dot: "bg-orange-500" },
  { key: "assigned",   label: "Assigned",   color: "border-t-blue-500",    dot: "bg-blue-500" },
  { key: "in_transit", label: "In Transit", color: "border-t-yellow-500",  dot: "bg-yellow-500" },
  { key: "delivered",  label: "Delivered",  color: "border-t-green-500",   dot: "bg-green-500" },
];

const NEXT_STATUS: Partial<Record<Request["status"], Request["status"]>> = {
  new: "assigned",
  assigned: "in_transit",
  in_transit: "delivered",
};

const STATUS_LABEL: Record<string, string> = {
  new: "Mark Assigned",
  assigned: "Mark In Transit",
  in_transit: "Mark Delivered",
};

export default function DispatchBoard({ initial }: { initial: Request[] }) {
  const [requests, setRequests] = useState<Request[]>(initial);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);

  async function patch(id: string, updates: Partial<Request>) {
    setSaving(id);
    const res = await fetch(`/api/service-requests/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    if (res.ok) {
      const updated = await res.json();
      setRequests((prev) => prev.map((r) => (r.id === id ? updated : r)));
    }
    setSaving(null);
  }

  async function cancel(id: string) {
    if (!confirm("Cancel this request?")) return;
    await patch(id, { status: "cancelled" });
  }

  const active = requests.filter((r) => r.status !== "cancelled");

  return (
    <div className="overflow-x-auto pb-4">
      <div className="flex gap-4 min-w-max">
        {COLUMNS.map(({ key, label, color, dot }) => {
          const cards = active.filter((r) => r.status === key);
          return (
            <div key={key} className="w-72 flex flex-col gap-3">
              {/* Column header */}
              <div className="flex items-center gap-2 px-1">
                <span className={`w-2.5 h-2.5 rounded-full ${dot}`} />
                <span className="font-semibold text-sm text-gray-700">{label}</span>
                <span className="ml-auto text-xs text-gray-400 bg-gray-100 rounded-full px-2 py-0.5">{cards.length}</span>
              </div>

              {/* Cards */}
              {cards.map((r) => (
                <div key={r.id} className={`bg-white rounded-xl shadow-sm border-t-4 ${color} border border-gray-100 overflow-hidden`}>
                  <div className="p-4">
                    {/* Top row */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div>
                        <div className="font-bold text-[#1a2744] text-sm">{r.customer_name}</div>
                        <a href={`tel:${r.customer_phone.replace(/\D/g, "")}`}
                          className="flex items-center gap-1 text-[#e8600a] text-xs font-semibold hover:underline mt-0.5">
                          <Phone size={11} /> {r.customer_phone}
                        </a>
                      </div>
                      <button onClick={() => cancel(r.id)} className="text-gray-300 hover:text-red-400 transition-colors">
                        <X size={14} />
                      </button>
                    </div>

                    {/* Material */}
                    <div className="flex items-center gap-1.5 text-xs text-gray-600 mb-1">
                      <Package size={12} className="text-[#e8600a]" />
                      <span className="font-semibold">{r.quantity} {r.unit}s</span> of {r.material_name}
                    </div>

                    {/* Address */}
                    <div className="flex items-start gap-1.5 text-xs text-gray-500 mb-1">
                      <MapPin size={12} className="text-[#e8600a] shrink-0 mt-0.5" />
                      {r.delivery_address}{r.delivery_city ? `, ${r.delivery_city}` : ""}
                    </div>

                    {/* Date */}
                    {r.requested_date && (
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
                        <Calendar size={12} className="text-[#e8600a]" />
                        Requested: {r.requested_date}
                      </div>
                    )}

                    {/* Driver */}
                    {r.driver_name && (
                      <div className="flex items-center gap-1.5 text-xs text-blue-600 mt-1">
                        <User size={12} /> {r.driver_name}
                        {r.scheduled_date && ` · ${r.scheduled_date}`}
                      </div>
                    )}

                    {/* Expand toggle */}
                    <button onClick={() => setExpanded(expanded === r.id ? null : r.id)}
                      className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 mt-2 transition-colors">
                      <ChevronRight size={12} className={`transition-transform ${expanded === r.id ? "rotate-90" : ""}`} />
                      {expanded === r.id ? "Less" : "Assign & Schedule"}
                    </button>
                  </div>

                  {/* Expanded panel */}
                  {expanded === r.id && (
                    <div className="px-4 pb-4 space-y-3 border-t border-gray-100 pt-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Assign Driver</label>
                        <select
                          value={r.driver_name ?? ""}
                          onChange={(e) => {
                            const d = drivers.find((d) => d.name === e.target.value);
                            patch(r.id, { driver_name: d?.name ?? null, driver_email: d?.email ?? null, driver_phone: d?.phone ?? null });
                          }}
                          className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#e8600a]">
                          <option value="">Unassigned</option>
                          {drivers.map((d) => <option key={d.name} value={d.name}>{d.name}</option>)}
                        </select>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 mb-1">Date</label>
                          <input type="date" value={r.scheduled_date ?? ""}
                            onChange={(e) => patch(r.id, { scheduled_date: e.target.value || null })}
                            className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#e8600a]" />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 mb-1">Time</label>
                          <input type="time" value={r.scheduled_time ?? ""}
                            onChange={(e) => patch(r.id, { scheduled_time: e.target.value || null })}
                            className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#e8600a]" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Internal Notes</label>
                        <textarea rows={2} value={r.internal_notes ?? ""}
                          onChange={(e) => patch(r.id, { internal_notes: e.target.value })}
                          className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#e8600a] resize-none"
                          placeholder="Notes for the team…" />
                      </div>
                      {r.delivery_notes && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-2.5 py-2 text-xs text-yellow-800">
                          <span className="font-semibold">Customer notes:</span> {r.delivery_notes}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Advance status button */}
                  {NEXT_STATUS[r.status] && (
                    <div className="px-4 pb-4">
                      <button
                        onClick={() => patch(r.id, { status: NEXT_STATUS[r.status]! })}
                        disabled={saving === r.id}
                        className="w-full py-2 bg-[#1a2744] hover:bg-[#253359] disabled:opacity-50 text-white text-xs font-bold rounded-lg transition-colors">
                        {saving === r.id ? "Saving…" : STATUS_LABEL[r.status]}
                      </button>
                    </div>
                  )}
                </div>
              ))}

              {cards.length === 0 && (
                <div className="text-center text-xs text-gray-300 py-8">No jobs here</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
