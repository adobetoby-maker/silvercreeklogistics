"use client";
// PHASE 2 — HR

import { useState } from "react";
import {
  Users, Plus, X, BadgeCheck, Clock, UserCheck,
  Briefcase, Truck, Shield, Wrench, Building2,
} from "lucide-react";

type Crew = { id: string; name: string };

type Employee = {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  role: string;
  hourly_rate: number;
  cdl: boolean;
  hire_date: string | null;
  active: boolean;
  crew: Crew | null;
};

const ROLE_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  driver:     { label: "Driver",     color: "bg-[#e8600a]/10 text-[#e8600a]",    icon: Truck },
  dispatcher: { label: "Dispatcher", color: "bg-blue-100 text-blue-700",         icon: Briefcase },
  admin:      { label: "Admin",      color: "bg-[#1a2744]/10 text-[#1a2744]",    icon: Shield },
  mechanic:   { label: "Mechanic",   color: "bg-green-100 text-green-700",        icon: Wrench },
  office:     { label: "Office",     color: "bg-gray-100 text-gray-600",          icon: Building2 },
};

function initials(emp: Employee) {
  return `${emp.first_name[0] ?? ""}${emp.last_name[0] ?? ""}`.toUpperCase();
}

function avatarColor(role: string) {
  const map: Record<string, string> = {
    driver: "bg-[#e8600a]",
    dispatcher: "bg-blue-600",
    admin: "bg-[#1a2744]",
    mechanic: "bg-green-600",
    office: "bg-gray-500",
  };
  return map[role] ?? "bg-gray-400";
}

type FormState = {
  first_name: string; last_name: string; email: string; phone: string;
  role: string; hourly_rate: string; hire_date: string; cdl: boolean; crew_id: string;
};

const EMPTY_FORM: FormState = {
  first_name: "", last_name: "", email: "", phone: "",
  role: "driver", hourly_rate: "", hire_date: "", cdl: false, crew_id: "",
};

export default function EmployeesClient({
  employees,
  crews,
}: {
  employees: Employee[];
  crews: Crew[];
}) {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeDrivers = employees.filter((e) => e.active && e.cdl);
  const totalHours = 0; // placeholder until time_entries aggregated

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          hourly_rate: parseFloat(form.hourly_rate) || 0,
          crew_id: form.crew_id || null,
        }),
      });
      if (!res.ok) {
        const j = await res.json();
        throw new Error(j.error ?? "Failed to create employee");
      }
      setShowModal(false);
      setForm(EMPTY_FORM);
      window.location.reload();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1a2744]">Employees</h1>
          <p className="text-sm text-gray-500 mt-0.5">HR roster and team overview</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#e8600a] text-white text-sm font-semibold rounded-lg hover:bg-[#c4500a] transition-colors"
        >
          <Plus size={15} /> Add Employee
        </button>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#1a2744]/10 flex items-center justify-center">
              <Users size={18} className="text-[#1a2744]" />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-[#1a2744]">{employees.length}</div>
              <div className="text-xs text-gray-500">Total Employees</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#e8600a]/10 flex items-center justify-center">
              <UserCheck size={18} className="text-[#e8600a]" />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-[#1a2744]">{activeDrivers.length}</div>
              <div className="text-xs text-gray-500">Active CDL Drivers</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <Clock size={18} className="text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-[#1a2744]">{totalHours}h</div>
              <div className="text-xs text-gray-500">Weekly Hours</div>
            </div>
          </div>
        </div>
      </div>

      {/* Employee Cards Grid */}
      {employees.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl shadow-sm">
          <Users size={40} className="text-gray-300 mb-3" />
          <p className="text-gray-400 font-medium">No employees yet</p>
          <button
            onClick={() => setShowModal(true)}
            className="mt-4 px-4 py-2 bg-[#e8600a] text-white text-sm font-semibold rounded-lg hover:bg-[#c4500a] transition-colors"
          >
            Add First Employee
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {employees.map((emp) => {
            const roleConf = ROLE_CONFIG[emp.role] ?? ROLE_CONFIG.office;
            const RoleIcon = roleConf.icon;
            return (
              <div
                key={emp.id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-3 mb-4">
                  <div className={`w-11 h-11 rounded-full ${avatarColor(emp.role)} text-white text-sm font-bold flex items-center justify-center shrink-0`}>
                    {initials(emp)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-[#1a2744] truncate">
                      {emp.first_name} {emp.last_name}
                    </div>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold mt-0.5 ${roleConf.color}`}>
                      <RoleIcon size={10} />
                      {roleConf.label}
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Rate</span>
                    <span className="font-semibold text-[#1a2744]">
                      ${emp.hourly_rate.toFixed(2)}/hr
                    </span>
                  </div>
                  {emp.crew && (
                    <div className="flex justify-between text-gray-600">
                      <span>Crew</span>
                      <span className="font-semibold text-[#1a2744]">{emp.crew.name}</span>
                    </div>
                  )}
                  {emp.hire_date && (
                    <div className="flex justify-between text-gray-600">
                      <span>Hired</span>
                      <span className="text-gray-700">
                        {new Date(emp.hire_date).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                  {emp.cdl && (
                    <span className="flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded">
                      <BadgeCheck size={10} /> CDL
                    </span>
                  )}
                  {!emp.active && (
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded font-semibold">
                      Inactive
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Employee Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-[#1a2744]">Add Employee</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">First Name *</label>
                  <input
                    required
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#e8600a]/40"
                    value={form.first_name}
                    onChange={(e) => setForm((f) => ({ ...f, first_name: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Last Name *</label>
                  <input
                    required
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#e8600a]/40"
                    value={form.last_name}
                    onChange={(e) => setForm((f) => ({ ...f, last_name: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Email</label>
                <input
                  type="email"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#e8600a]/40"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Phone</label>
                <input
                  type="tel"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#e8600a]/40"
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Role *</label>
                  <select
                    required
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#e8600a]/40"
                    value={form.role}
                    onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
                  >
                    <option value="driver">Driver</option>
                    <option value="dispatcher">Dispatcher</option>
                    <option value="admin">Admin</option>
                    <option value="mechanic">Mechanic</option>
                    <option value="office">Office</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Hourly Rate ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#e8600a]/40"
                    value={form.hourly_rate}
                    onChange={(e) => setForm((f) => ({ ...f, hourly_rate: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Hire Date</label>
                  <input
                    type="date"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#e8600a]/40"
                    value={form.hire_date}
                    onChange={(e) => setForm((f) => ({ ...f, hire_date: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Crew</label>
                  <select
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#e8600a]/40"
                    value={form.crew_id}
                    onChange={(e) => setForm((f) => ({ ...f, crew_id: e.target.value }))}
                  >
                    <option value="">No crew</option>
                    {crews.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  className="w-4 h-4 accent-[#e8600a]"
                  checked={form.cdl}
                  onChange={(e) => setForm((f) => ({ ...f, cdl: e.target.checked }))}
                />
                <span className="text-sm font-medium text-gray-700">CDL License Holder</span>
              </label>

              {error && (
                <div className="px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                  {error}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-200 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-2 bg-[#e8600a] text-white text-sm font-semibold rounded-lg hover:bg-[#c4500a] transition-colors disabled:opacity-60"
                >
                  {saving ? "Saving…" : "Add Employee"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
