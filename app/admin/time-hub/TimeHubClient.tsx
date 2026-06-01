"use client";
// PHASE 2 — HR

import { useState } from "react";
import { Clock, Calendar, Truck, CheckCircle, XCircle, AlertCircle, ClipboardList } from "lucide-react";

type EmployeeRef = { id: string; first_name: string; last_name: string };

type TimeEntry = {
  id: string;
  clock_in: string;
  clock_out: string | null;
  regular_hours: number | null;
  overtime_hours: number;
  status: string;
  job_reference: string | null;
  notes: string | null;
  employee: EmployeeRef | null;
};

type TimeOffRequest = {
  id: string;
  type: string;
  start_date: string;
  end_date: string;
  hours_requested: number;
  reason: string | null;
  status: string;
  reviewer_notes: string | null;
  employee: EmployeeRef | null;
};

type DowntimeForm = {
  id: string;
  truck_id: string | null;
  reason: string;
  start_time: string;
  end_time: string | null;
  hours: number | null;
  notes: string | null;
  employee: EmployeeRef | null;
};

const TIME_OFF_TYPE_COLOR: Record<string, string> = {
  vacation: "bg-blue-100 text-blue-700",
  sick:     "bg-red-100 text-red-700",
  personal: "bg-purple-100 text-purple-700",
  unpaid:   "bg-gray-100 text-gray-600",
};

const DOWNTIME_REASON_LABEL: Record<string, string> = {
  weather:        "Weather",
  breakdown:      "Breakdown",
  wait_load:      "Wait – Load",
  wait_customer:  "Wait – Customer",
  training:       "Training",
  other:          "Other",
};

function StatusBadge({ status }: { status: string }) {
  if (status === "active") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-green-100 text-green-700">
        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
        Active
      </span>
    );
  }
  if (status === "approved" || status === "approved") {
    return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-gray-100 text-gray-600">Approved</span>;
  }
  if (status === "rejected" || status === "denied") {
    return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-red-100 text-red-600">Rejected</span>;
  }
  if (status === "pending") {
    return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-yellow-100 text-yellow-700">Pending</span>;
  }
  return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-gray-100 text-gray-500">{status}</span>;
}

function empName(emp: EmployeeRef | null) {
  if (!emp) return "Unknown";
  return `${emp.first_name} ${emp.last_name}`;
}

function fmtDateTime(dt: string | null) {
  if (!dt) return "—";
  return new Date(dt).toLocaleString("en-US", {
    month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
  });
}

function fmtDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function EmptyState({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <Icon size={36} className="text-gray-200 mb-3" />
      <p className="text-gray-400 text-sm">{label}</p>
    </div>
  );
}

export default function TimeHubClient({
  timeEntries,
  timeOffRequests,
  downtimeForms,
}: {
  timeEntries: TimeEntry[];
  timeOffRequests: TimeOffRequest[];
  downtimeForms: DowntimeForm[];
}) {
  const [tab, setTab] = useState<"timesheets" | "timeoff" | "downtime">("timesheets");
  const [updating, setUpdating] = useState<string | null>(null);

  // Weekly hours total
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  weekStart.setHours(0, 0, 0, 0);
  const weeklyEntries = timeEntries.filter((e) => new Date(e.clock_in) >= weekStart);
  const weeklyHours = weeklyEntries.reduce(
    (s, e) => s + (e.regular_hours ?? 0) + e.overtime_hours,
    0,
  );

  async function updateTimeEntry(id: string, status: string) {
    setUpdating(id);
    try {
      await fetch("/api/time-entries", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      window.location.reload();
    } finally {
      setUpdating(null);
    }
  }

  async function updateTimeOff(id: string, status: string) {
    setUpdating(id);
    try {
      await fetch("/api/time-entries", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status, table: "time_off_requests" }),
      });
      window.location.reload();
    } finally {
      setUpdating(null);
    }
  }

  const TABS = [
    { key: "timesheets", label: "Timesheets", icon: Clock, count: timeEntries.length },
    { key: "timeoff",    label: "Time Off",   icon: Calendar, count: timeOffRequests.filter((r) => r.status === "pending").length },
    { key: "downtime",   label: "Downtime",   icon: Truck, count: downtimeForms.length },
  ] as const;

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-[#1a2744]">Time Hub</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Timesheets · Time Off · Downtime &nbsp;·&nbsp;
          <span className="text-[#e8600a] font-semibold">{weeklyHours.toFixed(1)}h</span> this week
        </p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
        {TABS.map(({ key, label, icon: Icon, count }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold transition-colors ${
              tab === key
                ? "bg-white text-[#1a2744] shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Icon size={14} />
            {label}
            {count > 0 && (
              <span className={`px-1.5 py-0.5 rounded text-xs ${tab === key ? "bg-[#e8600a] text-white" : "bg-gray-200 text-gray-600"}`}>
                {count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Timesheets tab ── */}
      {tab === "timesheets" && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {timeEntries.length === 0 ? (
            <EmptyState icon={Clock} label="No time entries recorded yet" />
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-left">
                  <th className="px-4 py-3 font-semibold text-gray-600">Employee</th>
                  <th className="px-4 py-3 font-semibold text-gray-600">Clock In</th>
                  <th className="px-4 py-3 font-semibold text-gray-600">Clock Out</th>
                  <th className="px-4 py-3 font-semibold text-gray-600">Reg Hrs</th>
                  <th className="px-4 py-3 font-semibold text-gray-600">OT Hrs</th>
                  <th className="px-4 py-3 font-semibold text-gray-600">Status</th>
                  <th className="px-4 py-3 font-semibold text-gray-600">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {timeEntries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-[#1a2744]">{empName(entry.employee)}</td>
                    <td className="px-4 py-3 text-gray-600">{fmtDateTime(entry.clock_in)}</td>
                    <td className="px-4 py-3 text-gray-600">{fmtDateTime(entry.clock_out)}</td>
                    <td className="px-4 py-3 text-gray-700">{entry.regular_hours?.toFixed(1) ?? "—"}</td>
                    <td className="px-4 py-3 text-gray-700">
                      {entry.overtime_hours > 0 ? (
                        <span className="text-[#e8600a] font-semibold">{entry.overtime_hours.toFixed(1)}</span>
                      ) : "0.0"}
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={entry.status} /></td>
                    <td className="px-4 py-3">
                      {entry.status !== "approved" && entry.status !== "rejected" ? (
                        <button
                          disabled={updating === entry.id}
                          onClick={() => updateTimeEntry(entry.id, "approved")}
                          className="flex items-center gap-1 text-xs font-semibold text-green-700 hover:text-green-900 disabled:opacity-50"
                        >
                          <CheckCircle size={13} />
                          {updating === entry.id ? "…" : "Approve"}
                        </button>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ── Time Off tab ── */}
      {tab === "timeoff" && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {timeOffRequests.length === 0 ? (
            <EmptyState icon={Calendar} label="No time-off requests yet" />
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-left">
                  <th className="px-4 py-3 font-semibold text-gray-600">Employee</th>
                  <th className="px-4 py-3 font-semibold text-gray-600">Type</th>
                  <th className="px-4 py-3 font-semibold text-gray-600">Dates</th>
                  <th className="px-4 py-3 font-semibold text-gray-600">Hours</th>
                  <th className="px-4 py-3 font-semibold text-gray-600">Status</th>
                  <th className="px-4 py-3 font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {timeOffRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-[#1a2744]">{empName(req.employee)}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold ${TIME_OFF_TYPE_COLOR[req.type] ?? "bg-gray-100 text-gray-600"}`}>
                        {req.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {fmtDate(req.start_date)} – {fmtDate(req.end_date)}
                    </td>
                    <td className="px-4 py-3 text-gray-700">{req.hours_requested}h</td>
                    <td className="px-4 py-3"><StatusBadge status={req.status} /></td>
                    <td className="px-4 py-3">
                      {req.status === "pending" ? (
                        <div className="flex gap-2">
                          <button
                            disabled={updating === req.id}
                            onClick={() => updateTimeOff(req.id, "approved")}
                            className="flex items-center gap-1 text-xs font-semibold text-green-700 hover:text-green-900 disabled:opacity-50"
                          >
                            <CheckCircle size={13} />
                            {updating === req.id ? "…" : "Approve"}
                          </button>
                          <button
                            disabled={updating === req.id}
                            onClick={() => updateTimeOff(req.id, "denied")}
                            className="flex items-center gap-1 text-xs font-semibold text-red-600 hover:text-red-800 disabled:opacity-50"
                          >
                            <XCircle size={13} />
                            Deny
                          </button>
                        </div>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ── Downtime tab ── */}
      {tab === "downtime" && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {downtimeForms.length === 0 ? (
            <EmptyState icon={AlertCircle} label="No downtime forms recorded yet" />
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-left">
                  <th className="px-4 py-3 font-semibold text-gray-600">Employee</th>
                  <th className="px-4 py-3 font-semibold text-gray-600">Truck</th>
                  <th className="px-4 py-3 font-semibold text-gray-600">Reason</th>
                  <th className="px-4 py-3 font-semibold text-gray-600">Date</th>
                  <th className="px-4 py-3 font-semibold text-gray-600">Hours</th>
                  <th className="px-4 py-3 font-semibold text-gray-600">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {downtimeForms.map((dt) => (
                  <tr key={dt.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-[#1a2744]">{empName(dt.employee)}</td>
                    <td className="px-4 py-3 text-gray-600">{dt.truck_id ?? "—"}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded text-xs font-semibold bg-amber-100 text-amber-700">
                        {DOWNTIME_REASON_LABEL[dt.reason] ?? dt.reason}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{fmtDateTime(dt.start_time)}</td>
                    <td className="px-4 py-3 text-gray-700">{dt.hours?.toFixed(1) ?? "—"}</td>
                    <td className="px-4 py-3 text-gray-500 truncate max-w-[200px]">{dt.notes ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
