"use client";

import { useState } from "react";
import { Truck, Calendar, ChevronLeft, ChevronRight, Plus } from "lucide-react";

type TruckRow = {
  id: string;
  name: string;
  unit: string;
  year: string;
  capacity: string;
  type: string;
  description: string;
  image: string;
  driver: string;
  color: string;
};

type ServiceRequest = {
  id: string;
  status: string;
  material_name: string | null;
  quantity: number | null;
  unit: string | null;
  delivery_address: string | null;
  scheduled_date: string | null;
  driver_name: string | null;
  internal_notes: string | null;
};

const STATUS_COLORS: Record<string, string> = {
  new: "bg-blue-100 text-blue-800 border-blue-200",
  assigned: "bg-yellow-100 text-yellow-800 border-yellow-200",
  in_transit: "bg-orange-100 text-orange-800 border-orange-200",
  delivered: "bg-green-100 text-green-800 border-green-200",
};

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function FleetClient({
  trucks,
  weekDates,
  requests,
}: {
  trucks: TruckRow[];
  weekDates: string[];
  requests: ServiceRequest[];
}) {
  const [weekOffset, setWeekOffset] = useState(0);
  const [selected, setSelected] = useState<ServiceRequest | null>(null);

  // Group requests by truck × date
  const grid: Record<string, Record<string, ServiceRequest[]>> = {};
  for (const r of requests) {
    const key = r.driver_name ?? "unassigned";
    const day = r.scheduled_date ?? "";
    if (!grid[key]) grid[key] = {};
    if (!grid[key][day]) grid[key][day] = [];
    grid[key][day].push(r);
  }

  const fmtDate = (iso: string) => {
    const d = new Date(iso + "T12:00:00");
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1a2744]">Fleet Schedule</h1>
          <p className="text-sm text-gray-500 mt-0.5">Weekly run schedule for all units</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg shadow-sm">
            <button
              onClick={() => setWeekOffset((o) => o - 1)}
              className="p-2 hover:bg-gray-50 rounded-l-lg transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="px-3 py-2 text-sm font-medium text-gray-700">
              <Calendar size={14} className="inline mr-1.5 text-gray-400" />
              {weekOffset === 0 ? "This Week" : weekOffset === 1 ? "Next Week" : weekOffset === -1 ? "Last Week" : `Week ${weekOffset > 0 ? "+" : ""}${weekOffset}`}
            </span>
            <button
              onClick={() => setWeekOffset((o) => o + 1)}
              className="p-2 hover:bg-gray-50 rounded-r-lg transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
          <a
            href="/admin/dispatch"
            className="flex items-center gap-1.5 px-4 py-2 bg-[#e8600a] text-white text-sm font-semibold rounded-lg hover:bg-[#c4500a] transition-colors"
          >
            <Plus size={15} /> New Run
          </a>
        </div>
      </div>

      {/* Fleet Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {trucks.map((t) => {
          const weekJobs = requests.filter((r) => r.driver_name === t.driver);
          return (
            <div key={t.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                  style={{ backgroundColor: t.color + "20" }}
                >
                  <Truck size={18} style={{ color: t.color }} />
                </div>
                <div>
                  <div className="font-bold text-sm text-[#1a2744]">{t.name}</div>
                  <div className="text-xs text-gray-500">{t.unit} · {t.year} · {t.driver}</div>
                </div>
              </div>
              <div className="text-xs text-gray-500 mb-2">{t.capacity}</div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">This week</span>
                <span className="font-bold" style={{ color: t.color }}>{weekJobs.length} run{weekJobs.length !== 1 ? "s" : ""}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Schedule Grid */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="grid" style={{ gridTemplateColumns: `180px repeat(${weekDates.length}, 1fr)` }}>
          {/* Header row */}
          <div className="bg-gray-50 border-b border-r border-gray-200 px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Unit
          </div>
          {weekDates.map((d, i) => (
            <div
              key={d}
              className={`bg-gray-50 border-b border-r border-gray-200 px-3 py-3 text-center ${
                d === today ? "bg-orange-50" : ""
              }`}
            >
              <div className={`text-xs font-bold uppercase tracking-wide ${d === today ? "text-[#e8600a]" : "text-gray-500"}`}>
                {DAY_LABELS[i]}
              </div>
              <div className={`text-sm font-semibold mt-0.5 ${d === today ? "text-[#e8600a]" : "text-gray-800"}`}>
                {fmtDate(d)}
              </div>
            </div>
          ))}

          {/* Truck rows */}
          {trucks.map((t) => (
            <>
              <div
                key={`label-${t.id}`}
                className="border-b border-r border-gray-200 px-4 py-4 bg-gray-50/50"
              >
                <div className="font-semibold text-sm text-[#1a2744]">{t.unit}</div>
                <div className="text-xs text-gray-500 mt-0.5 truncate">{t.name}</div>
              </div>
              {weekDates.map((d) => {
                const jobs = grid[t.driver]?.[d] ?? [];
                return (
                  <div
                    key={`${t.id}-${d}`}
                    className={`border-b border-r border-gray-200 p-2 min-h-[80px] ${
                      d === today ? "bg-orange-50/30" : "hover:bg-gray-50/50"
                    }`}
                  >
                    {jobs.length === 0 ? (
                      <div className="h-full flex items-center justify-center">
                        <span className="text-xs text-gray-300">—</span>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        {jobs.map((j) => (
                          <button
                            key={j.id}
                            onClick={() => setSelected(j)}
                            className={`w-full text-left px-2 py-1.5 rounded border text-xs font-medium transition-shadow hover:shadow-sm ${
                              STATUS_COLORS[j.status] ?? "bg-gray-100 text-gray-700 border-gray-200"
                            }`}
                          >
                            <div className="truncate">{j.material_name ?? "Run"}</div>
                            {j.quantity && (
                              <div className="opacity-70">{j.quantity} {j.unit}</div>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </>
          ))}
        </div>
      </div>

      {/* Unassigned runs */}
      {(() => {
        const unassigned = requests.filter((r) => !r.driver_name);
        if (unassigned.length === 0) return null;
        return (
          <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <div className="text-sm font-bold text-yellow-800 mb-2">
              {unassigned.length} Unassigned Run{unassigned.length !== 1 ? "s" : ""}
            </div>
            <div className="space-y-1">
              {unassigned.map((r) => (
                <div key={r.id} className="text-xs text-yellow-700 flex items-center gap-2">
                  <span className="font-medium">{r.scheduled_date ?? "No date"}</span>
                  <span>·</span>
                  <span>{r.material_name ?? "Material TBD"}</span>
                  {r.delivery_address && <span className="text-yellow-600 truncate">→ {r.delivery_address}</span>}
                </div>
              ))}
            </div>
          </div>
        );
      })()}

      {/* Detail modal */}
      {selected && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-[#1a2744] text-lg">Run Details</h3>
              <button
                onClick={() => setSelected(null)}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                ×
              </button>
            </div>
            <dl className="space-y-2 text-sm">
              {[
                ["Material", selected.material_name],
                ["Quantity", selected.quantity ? `${selected.quantity} ${selected.unit ?? ""}`.trim() : null],
                ["Scheduled Date", selected.scheduled_date],
                ["Delivery Address", selected.delivery_address],
                ["Driver", selected.driver_name],
                ["Status", selected.status],
                ["Notes", selected.internal_notes],
              ].map(([label, val]) =>
                val ? (
                  <div key={label as string} className="flex gap-2">
                    <dt className="font-medium text-gray-500 w-28 shrink-0">{label}</dt>
                    <dd className="text-gray-900 capitalize">{val as string}</dd>
                  </div>
                ) : null
              )}
            </dl>
            <div className="mt-5 flex gap-2">
              <a
                href={`/admin/dispatch`}
                className="flex-1 text-center px-4 py-2 bg-[#e8600a] text-white text-sm font-semibold rounded-lg hover:bg-[#c4500a]"
              >
                Open in Dispatch
              </a>
              <button
                onClick={() => setSelected(null)}
                className="px-4 py-2 border border-gray-200 text-sm text-gray-600 rounded-lg hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
