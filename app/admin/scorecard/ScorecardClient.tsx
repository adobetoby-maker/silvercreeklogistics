"use client";
// PHASE 2 — HR

import { useState } from "react";
import { Star, Plus, X, TrendingUp, Shield, Users, Clock, Award } from "lucide-react";

type EmployeeRef = { id: string; first_name: string; last_name: string };

type EmployeeOption = {
  id: string;
  first_name: string;
  last_name: string;
  role: string;
};

type Review = {
  id: string;
  review_period: string;
  attendance_score: number | null;
  performance_score: number | null;
  safety_score: number | null;
  customer_score: number | null;
  overall_score: number | null;
  strengths: string | null;
  improvements: string | null;
  goals: string | null;
  notes: string | null;
  created_at: string;
  employee: EmployeeRef | null;
  reviewer: EmployeeRef | null;
};

type ReviewFormState = {
  employee_id: string;
  review_period: string;
  attendance_score: string;
  performance_score: string;
  safety_score: string;
  customer_score: string;
  strengths: string;
  improvements: string;
  goals: string;
  notes: string;
};

const EMPTY_FORM: ReviewFormState = {
  employee_id: "",
  review_period: "",
  attendance_score: "3",
  performance_score: "3",
  safety_score: "3",
  customer_score: "3",
  strengths: "",
  improvements: "",
  goals: "",
  notes: "",
};

function StarRow({ label, icon: Icon, score }: { label: string; icon: React.ElementType; score: number | null }) {
  const s = score ?? 0;
  return (
    <div className="bg-gray-50 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon size={14} className="text-gray-500" />
        <span className="text-xs font-semibold text-gray-600">{label}</span>
      </div>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <Star
            key={n}
            size={18}
            className={n <= s ? "text-[#e8600a] fill-[#e8600a]" : "text-gray-200"}
          />
        ))}
        <span className="ml-2 text-lg font-bold text-[#1a2744]">{s > 0 ? s : "—"}</span>
      </div>
    </div>
  );
}

function StarInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const current = parseInt(value) || 0;
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-600 mb-1">{label}</label>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(String(n))}
            className="focus:outline-none"
          >
            <Star
              size={22}
              className={n <= current ? "text-[#e8600a] fill-[#e8600a]" : "text-gray-200 hover:text-[#e8600a]/50 transition-colors"}
            />
          </button>
        ))}
      </div>
    </div>
  );
}

function ScoreRing({ score }: { score: number | null }) {
  const s = score ?? 0;
  const pct = (s / 5) * 100;
  const r = 40;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width="100" height="100" className="-rotate-90">
        <circle cx="50" cy="50" r={r} strokeWidth="8" stroke="#e5e7eb" fill="none" />
        <circle
          cx="50" cy="50" r={r} strokeWidth="8" fill="none"
          stroke="#e8600a"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          className="transition-all duration-700"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-2xl font-extrabold text-[#1a2744]">{s > 0 ? s.toFixed(1) : "—"}</span>
        <span className="text-xs text-gray-400">/ 5.0</span>
      </div>
    </div>
  );
}

function empFullName(emp: EmployeeRef | null) {
  if (!emp) return "Unknown";
  return `${emp.first_name} ${emp.last_name}`;
}

export default function ScorecardClient({
  employees,
  reviews,
}: {
  employees: EmployeeOption[];
  reviews: Review[];
}) {
  const [selectedId, setSelectedId] = useState<string>(employees[0]?.id ?? "");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<ReviewFormState>({ ...EMPTY_FORM, employee_id: selectedId });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const selectedEmployee = employees.find((e) => e.id === selectedId);
  const employeeReviews = reviews.filter((r) => r.employee?.id === selectedId);
  const latestReview = employeeReviews[0] ?? null;

  function field(key: keyof ReviewFormState, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setFormError(null);
    try {
      const scores = [
        parseInt(form.attendance_score),
        parseInt(form.performance_score),
        parseInt(form.safety_score),
        parseInt(form.customer_score),
      ];
      const overall = (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1);

      const res = await fetch("/api/employee-reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employee_id: form.employee_id || selectedId,
          review_period: form.review_period,
          attendance_score: parseInt(form.attendance_score),
          performance_score: parseInt(form.performance_score),
          safety_score: parseInt(form.safety_score),
          customer_score: parseInt(form.customer_score),
          overall_score: parseFloat(overall),
          strengths: form.strengths || null,
          improvements: form.improvements || null,
          goals: form.goals || null,
          notes: form.notes || null,
        }),
      });
      if (!res.ok) {
        const j = await res.json();
        throw new Error(j.error ?? "Failed to save review");
      }
      setShowModal(false);
      setForm({ ...EMPTY_FORM, employee_id: selectedId });
      window.location.reload();
    } catch (err) {
      setFormError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1a2744]">Performance Scorecard</h1>
          <p className="text-sm text-gray-500 mt-0.5">Employee reviews and ratings</p>
        </div>
        <button
          onClick={() => {
            setForm({ ...EMPTY_FORM, employee_id: selectedId });
            setShowModal(true);
          }}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#e8600a] text-white text-sm font-semibold rounded-lg hover:bg-[#c4500a] transition-colors"
        >
          <Plus size={15} /> Write Review
        </button>
      </div>

      {employees.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl shadow-sm">
          <Users size={40} className="text-gray-200 mb-3" />
          <p className="text-gray-400 font-medium">No employees to review yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-12 gap-6">
          {/* Employee selector sidebar */}
          <div className="col-span-3">
            <div className="bg-white rounded-xl shadow-sm p-3 space-y-1">
              {employees.map((emp) => {
                const empReviews = reviews.filter((r) => r.employee?.id === emp.id);
                const latest = empReviews[0];
                return (
                  <button
                    key={emp.id}
                    onClick={() => setSelectedId(emp.id)}
                    className={`w-full text-left px-3 py-2.5 rounded-lg transition-colors ${
                      emp.id === selectedId
                        ? "bg-[#1a2744] text-white"
                        : "hover:bg-gray-50 text-gray-700"
                    }`}
                  >
                    <div className="font-semibold text-sm">{emp.first_name} {emp.last_name}</div>
                    <div className={`text-xs mt-0.5 ${emp.id === selectedId ? "text-gray-300" : "text-gray-400"}`}>
                      {latest ? `Score: ${latest.overall_score ?? "—"}` : "No reviews"}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main scorecard panel */}
          <div className="col-span-9 space-y-5">
            {!selectedEmployee ? (
              <div className="bg-white rounded-xl shadow-sm p-10 flex flex-col items-center">
                <Award size={36} className="text-gray-200 mb-2" />
                <p className="text-gray-400 text-sm">Select an employee to view their scorecard</p>
              </div>
            ) : (
              <>
                {/* Employee header + overall ring */}
                <div className="bg-white rounded-xl shadow-sm p-6 flex items-center gap-8">
                  <div className="w-14 h-14 rounded-full bg-[#1a2744] text-white font-bold text-lg flex items-center justify-center shrink-0">
                    {selectedEmployee.first_name[0]}{selectedEmployee.last_name[0]}
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-extrabold text-[#1a2744]">
                      {selectedEmployee.first_name} {selectedEmployee.last_name}
                    </h2>
                    <p className="text-sm text-gray-500 capitalize">{selectedEmployee.role}</p>
                    {latestReview && (
                      <p className="text-xs text-gray-400 mt-1">
                        Last review: {latestReview.review_period}
                      </p>
                    )}
                  </div>
                  <ScoreRing score={latestReview?.overall_score ?? null} />
                </div>

                {latestReview ? (
                  <>
                    {/* Score cards */}
                    <div className="grid grid-cols-2 gap-4">
                      <StarRow label="Attendance"   icon={Clock}       score={latestReview.attendance_score} />
                      <StarRow label="Performance"  icon={TrendingUp}  score={latestReview.performance_score} />
                      <StarRow label="Safety"       icon={Shield}      score={latestReview.safety_score} />
                      <StarRow label="Customer"     icon={Users}       score={latestReview.customer_score} />
                    </div>

                    {/* Text sections */}
                    <div className="grid grid-cols-3 gap-4">
                      {[
                        { label: "Strengths",    icon: "✦", content: latestReview.strengths },
                        { label: "Improvements", icon: "△", content: latestReview.improvements },
                        { label: "Goals",        icon: "◎", content: latestReview.goals },
                      ].map(({ label, icon, content }) => (
                        <div key={label} className="bg-white rounded-xl shadow-sm p-4">
                          <div className="flex items-center gap-1.5 mb-2">
                            <span className="text-[#e8600a]">{icon}</span>
                            <h3 className="text-xs font-bold text-gray-600 uppercase tracking-wide">{label}</h3>
                          </div>
                          {content ? (
                            <p className="text-sm text-gray-700 leading-relaxed">{content}</p>
                          ) : (
                            <p className="text-sm text-gray-300 italic">Not recorded</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="bg-white rounded-xl shadow-sm p-12 flex flex-col items-center">
                    <Award size={36} className="text-gray-200 mb-3" />
                    <p className="text-gray-400 font-medium">No reviews yet for this employee</p>
                    <button
                      onClick={() => {
                        setForm({ ...EMPTY_FORM, employee_id: selectedId });
                        setShowModal(true);
                      }}
                      className="mt-4 px-4 py-2 bg-[#e8600a] text-white text-sm font-semibold rounded-lg hover:bg-[#c4500a] transition-colors"
                    >
                      Write First Review
                    </button>
                  </div>
                )}

                {/* Review history */}
                {employeeReviews.length > 0 && (
                  <div className="bg-white rounded-xl shadow-sm p-5">
                    <h3 className="text-sm font-bold text-[#1a2744] mb-3">Review History</h3>
                    <div className="space-y-2">
                      {employeeReviews.map((rev) => (
                        <div key={rev.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                          <div>
                            <span className="text-sm font-semibold text-gray-700">{rev.review_period}</span>
                            {rev.reviewer && (
                              <span className="text-xs text-gray-400 ml-2">by {empFullName(rev.reviewer)}</span>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            <Star size={12} className="text-[#e8600a] fill-[#e8600a]" />
                            <span className="text-sm font-bold text-[#1a2744]">
                              {rev.overall_score?.toFixed(1) ?? "—"}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Write Review Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-[#1a2744]">Write Review</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Employee *</label>
                <select
                  required
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#e8600a]/40"
                  value={form.employee_id}
                  onChange={(e) => field("employee_id", e.target.value)}
                >
                  <option value="">Select employee…</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.first_name} {emp.last_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Review Period *</label>
                <input
                  required
                  placeholder="e.g. Q2 2026"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#e8600a]/40"
                  value={form.review_period}
                  onChange={(e) => field("review_period", e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <StarInput label="Attendance"   value={form.attendance_score}   onChange={(v) => field("attendance_score", v)} />
                <StarInput label="Performance"  value={form.performance_score}  onChange={(v) => field("performance_score", v)} />
                <StarInput label="Safety"       value={form.safety_score}       onChange={(v) => field("safety_score", v)} />
                <StarInput label="Customer"     value={form.customer_score}     onChange={(v) => field("customer_score", v)} />
              </div>

              {[
                { key: "strengths" as const,    label: "Strengths" },
                { key: "improvements" as const, label: "Areas for Improvement" },
                { key: "goals" as const,        label: "Goals" },
              ].map(({ key, label }) => (
                <div key={key}>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">{label}</label>
                  <textarea
                    rows={2}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#e8600a]/40 resize-none"
                    value={form[key]}
                    onChange={(e) => field(key, e.target.value)}
                  />
                </div>
              ))}

              {formError && (
                <div className="px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                  {formError}
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
                  {saving ? "Saving…" : "Save Review"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
