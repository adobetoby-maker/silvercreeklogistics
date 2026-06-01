"use client";

import { useState } from "react";
import { ClipboardList, Clock, Truck, MapPin, Plus, Search, CheckCircle, AlertCircle } from "lucide-react";

type Order = {
  id: string;
  status: string;
  material_name: string | null;
  quantity: number | null;
  unit: string | null;
  delivery_address: string | null;
  delivery_city: string | null;
  scheduled_date: string | null;
  requested_date: string | null;
  driver_name: string | null;
  internal_notes: string | null;
  customer_name: string;
  customer_phone: string;
  created_at: string;
};


const STATUS_META: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  new: { label: "New", color: "bg-blue-100 text-blue-700 border-blue-200", icon: <Clock size={12} /> },
  assigned: { label: "Assigned", color: "bg-yellow-100 text-yellow-700 border-yellow-200", icon: <Truck size={12} /> },
  in_transit: { label: "In Transit", color: "bg-orange-100 text-orange-700 border-orange-200", icon: <Truck size={12} /> },
  delivered: { label: "Delivered", color: "bg-green-100 text-green-700 border-green-200", icon: <CheckCircle size={12} /> },
  cancelled: { label: "Cancelled", color: "bg-red-100 text-red-700 border-red-200", icon: <AlertCircle size={12} /> },
};

export default function WorkOrdersClient({ orders }: { orders: Order[] }) {
  const [filter, setFilter] = useState<string>("active");
  const [search, setSearch] = useState("");

  const statusGroups = {
    active: ["new", "assigned", "in_transit"],
    delivered: ["delivered"],
    cancelled: ["cancelled"],
    all: Object.keys(STATUS_META),
  };

  const filtered = orders.filter((o) => {
    const matchStatus = statusGroups[filter as keyof typeof statusGroups].includes(o.status);
    const matchSearch =
      !search ||
      o.material_name?.toLowerCase().includes(search.toLowerCase()) ||
      o.delivery_address?.toLowerCase().includes(search.toLowerCase()) ||
      o.customer_name?.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  const counts = {
    active: orders.filter((o) => statusGroups.active.includes(o.status)).length,
    delivered: orders.filter((o) => o.status === "delivered").length,
    cancelled: orders.filter((o) => o.status === "cancelled").length,
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1a2744]">Work Orders</h1>
          <p className="text-sm text-gray-500 mt-0.5">Track every haul from request to delivery</p>
        </div>
        <a
          href="/admin/dispatch"
          className="flex items-center gap-1.5 px-4 py-2 bg-[#e8600a] text-white text-sm font-semibold rounded-lg hover:bg-[#c4500a] transition-colors"
        >
          <Plus size={15} /> New Work Order
        </a>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { key: "active", label: "Active", icon: <Clock size={18} />, color: "#e8600a" },
          { key: "delivered", label: "Delivered", icon: <CheckCircle size={18} />, color: "#16a34a" },
          { key: "cancelled", label: "Cancelled", icon: <AlertCircle size={18} />, color: "#dc2626" },
        ].map(({ key, label, icon, color }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`bg-white rounded-xl border p-4 text-left transition-all ${
              filter === key ? "border-[#e8600a] shadow-sm" : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <span style={{ color }}>{icon}</span>
              <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">{label}</span>
            </div>
            <div className="text-3xl font-extrabold" style={{ color: filter === key ? color : "#1a2744" }}>
              {counts[key as keyof typeof counts]}
            </div>
          </button>
        ))}
      </div>

      {/* Search + Filter */}
      <div className="flex gap-3 mb-4">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search material, address, client..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e8600a]/20 focus:border-[#e8600a]"
          />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e8600a]/20 bg-white"
        >
          <option value="active">Active ({counts.active})</option>
          <option value="delivered">Delivered ({counts.delivered})</option>
          <option value="cancelled">Cancelled ({counts.cancelled})</option>
          <option value="all">All Orders</option>
        </select>
      </div>

      {/* Orders list */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <ClipboardList size={32} className="mx-auto text-gray-300 mb-3" />
          <div className="text-gray-500 font-medium">No work orders found</div>
          <div className="text-sm text-gray-400 mt-1">
            {filter === "active" ? "All caught up! Create a new work order from Dispatch." : "No results match your filter."}
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((o) => {
            const meta = STATUS_META[o.status] ?? STATUS_META.new;
            return (
              <div key={o.id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow transition-shadow">
                <div className="p-4 flex items-start gap-4">
                  {/* Status badge */}
                  <span className={`shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-xs font-medium mt-0.5 ${meta.color}`}>
                    {meta.icon}
                    {meta.label}
                  </span>

                  {/* Core info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-bold text-[#1a2744] text-sm">
                          {o.material_name ?? "Material TBD"}
                          {o.quantity && (
                            <span className="text-gray-400 font-normal ml-1.5">
                              · {o.quantity} {o.unit}
                            </span>
                          )}
                        </div>
                        {o.customer_name && (
                          <div className="text-xs text-gray-500 mt-0.5">{o.customer_name}</div>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        {(o.scheduled_date ?? o.requested_date) && (
                          <div className="text-xs font-semibold text-[#e8600a]">{fmtDate((o.scheduled_date ?? o.requested_date)!)}</div>
                        )}
                        <div className="text-xs text-gray-400 mt-0.5">Created {fmtDate(o.created_at)}</div>
                      </div>
                    </div>

                    {o.delivery_address && (
                      <div className="flex items-center gap-1 mt-1.5 text-xs text-gray-500">
                        <MapPin size={11} className="shrink-0 text-gray-400" />
                        {o.delivery_address}{o.delivery_city ? `, ${o.delivery_city}` : ""}
                      </div>
                    )}

                    {o.driver_name && (
                      <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                        <Truck size={11} className="shrink-0 text-gray-400" />
                        {o.driver_name}
                      </div>
                    )}

                    {o.internal_notes && (
                      <div className="mt-2 text-xs text-gray-500 italic border-l-2 border-gray-200 pl-2">
                        {o.internal_notes}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
