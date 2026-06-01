"use client";

import { useState } from "react";
import { BarChart2, CheckCircle, XCircle, Send, Plus } from "lucide-react";
import type { SurveyResult, Client } from "@/lib/types/db";

type ClientStub = Pick<Client, "id" | "name" | "email">;

function avg(nums: (number | null)[]): number {
  const valid = nums.filter((n): n is number => n !== null);
  if (valid.length === 0) return 0;
  return valid.reduce((a, b) => a + b, 0) / valid.length;
}

function npsCategory(score: number | null): "promoter" | "passive" | "detractor" {
  if (score === null) return "detractor";
  if (score >= 9) return "promoter";
  if (score >= 7) return "passive";
  return "detractor";
}

function ScoreBar({ label, value, max = 5 }: { label: string; value: number; max?: number }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="font-medium text-gray-600">{label}</span>
        <span className="font-bold text-[#1a2744]">{value.toFixed(1)} / {max}</span>
      </div>
      <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full bg-[#e8600a] transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export default function SurveysClient({
  surveys: initial,
  clients,
}: {
  surveys: SurveyResult[];
  clients: ClientStub[];
}) {
  const [surveys] = useState<SurveyResult[]>(initial);
  const [showModal, setShowModal] = useState(false);
  const [sending, setSending] = useState(false);
  const [form, setForm] = useState({ client_id: "", email: "" });

  // NPS stats
  const withNps = surveys.filter((s) => s.nps_score !== null);
  const promoters = withNps.filter((s) => npsCategory(s.nps_score) === "promoter").length;
  const passives = withNps.filter((s) => npsCategory(s.nps_score) === "passive").length;
  const detractors = withNps.filter((s) => npsCategory(s.nps_score) === "detractor").length;
  const npsScore =
    withNps.length > 0
      ? Math.round(((promoters - detractors) / withNps.length) * 100)
      : 0;
  const avgNps = withNps.length > 0 ? avg(withNps.map((s) => s.nps_score)) : 0;

  // Category averages
  const qualityAvg = avg(surveys.map((s) => s.quality_score));
  const timelinessAvg = avg(surveys.map((s) => s.timeliness_score));
  const communicationAvg = avg(surveys.map((s) => s.communication_score));

  function npsColor(score: number) {
    if (score >= 0) return "text-green-600";
    return "text-red-600";
  }

  function responseNpsColor(score: number | null) {
    if (score === null) return "bg-gray-100 text-gray-500";
    if (score >= 9) return "bg-green-100 text-green-700";
    if (score >= 7) return "bg-yellow-100 text-yellow-700";
    return "bg-red-100 text-red-600";
  }

  async function handleSendSurvey(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    await fetch("/api/surveys/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSending(false);
    setShowModal(false);
    setForm({ client_id: "", email: "" });
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-extrabold text-[#1a2744] flex items-center gap-2">
          <BarChart2 size={22} /> Customer Surveys
        </h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#e8600a] text-white text-sm font-semibold rounded-lg hover:bg-[#c4500a] transition-colors"
        >
          <Send size={14} /> Send Survey
        </button>
      </div>

      {/* NPS + Category scores */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {/* NPS Gauge */}
        <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col items-center justify-center">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Net Promoter Score</p>
          <div className="relative flex items-center justify-center w-28 h-28 mb-2">
            <div className="absolute inset-0 rounded-full border-8 border-gray-100" />
            <div className="text-center">
              <p className={`text-3xl font-extrabold ${npsColor(npsScore)}`}>{npsScore}</p>
              <p className="text-xs text-gray-400">{avgNps.toFixed(1)} avg</p>
            </div>
          </div>
          <div className="flex gap-4 text-xs mt-2">
            <span className="flex items-center gap-1 text-green-600 font-semibold">
              <span className="w-2 h-2 rounded-full bg-green-500 inline-block" /> {promoters} Promoters
            </span>
            <span className="flex items-center gap-1 text-yellow-600 font-semibold">
              <span className="w-2 h-2 rounded-full bg-yellow-400 inline-block" /> {passives} Passives
            </span>
            <span className="flex items-center gap-1 text-red-500 font-semibold">
              <span className="w-2 h-2 rounded-full bg-red-400 inline-block" /> {detractors} Detractors
            </span>
          </div>
        </div>

        {/* Category scores */}
        <div className="md:col-span-2 bg-white rounded-xl shadow-sm p-6">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">Category Averages</p>
          {surveys.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">No survey data yet</p>
          ) : (
            <div className="space-y-4">
              <ScoreBar label="Quality" value={qualityAvg} />
              <ScoreBar label="Timeliness" value={timelinessAvg} />
              <ScoreBar label="Communication" value={communicationAvg} />
            </div>
          )}
          <p className="text-xs text-gray-400 mt-4">{surveys.length} response{surveys.length !== 1 ? "s" : ""} total</p>
        </div>
      </div>

      {/* Review cards */}
      {surveys.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <BarChart2 size={36} className="mx-auto mb-3 opacity-30" />
          <p className="font-medium">No survey responses yet</p>
          <p className="text-sm mt-1">Send a survey to start collecting feedback</p>
        </div>
      ) : (
        <div className="space-y-4">
          {surveys.map((s) => (
            <div key={s.id} className="bg-white rounded-xl shadow-sm p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <p className="font-bold text-[#1a2744]">
                      {s.client?.name ?? "Anonymous"}
                    </p>
                    <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${responseNpsColor(s.nps_score)}`}>
                      NPS: {s.nps_score ?? "—"}
                    </span>
                    {s.would_refer !== null && (
                      <span className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${s.would_refer ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"}`}>
                        {s.would_refer ? <CheckCircle size={12} /> : <XCircle size={12} />}
                        {s.would_refer ? "Would refer" : "Would not refer"}
                      </span>
                    )}
                    <span className="text-xs text-gray-400 ml-auto">
                      {new Date(s.responded_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                  </div>
                  {s.comments && (
                    <p className="mt-2 text-sm text-gray-600 leading-relaxed">{s.comments}</p>
                  )}
                </div>
                {/* Mini scores */}
                <div className="shrink-0 flex gap-3 text-xs text-gray-500">
                  {s.quality_score !== null && (
                    <div className="text-center">
                      <p className="font-bold text-[#1a2744] text-sm">{s.quality_score}</p>
                      <p>Quality</p>
                    </div>
                  )}
                  {s.timeliness_score !== null && (
                    <div className="text-center">
                      <p className="font-bold text-[#1a2744] text-sm">{s.timeliness_score}</p>
                      <p>Time</p>
                    </div>
                  )}
                  {s.communication_score !== null && (
                    <div className="text-center">
                      <p className="font-bold text-[#1a2744] text-sm">{s.communication_score}</p>
                      <p>Comm.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Send Survey Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-[#1a2744] flex items-center gap-2">
                <Plus size={18} /> Send Survey
              </h2>
            </div>
            <form onSubmit={handleSendSurvey} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Client</label>
                <select
                  value={form.client_id}
                  onChange={(e) => {
                    const client = clients.find((c) => c.id === e.target.value);
                    setForm((f) => ({ ...f, client_id: e.target.value, email: client?.email ?? f.email }));
                  }}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#e8600a]/30"
                >
                  <option value="">— Select client —</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Email Address *</label>
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="customer@email.com"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#e8600a]/30"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sending}
                  className="flex-1 px-4 py-2 bg-[#e8600a] text-white text-sm font-semibold rounded-lg hover:bg-[#c4500a] disabled:opacity-60"
                >
                  {sending ? "Sending…" : "Send Survey"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
