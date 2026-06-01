"use client";

import { useState } from "react";
import { GitBranch, Plus, Check, DollarSign, Phone, Mail, ChevronDown } from "lucide-react";
import type { Referral, ReferralStatus, Client } from "@/lib/types/db";

const STATUS_STYLES: Record<ReferralStatus, string> = {
  pending: "bg-gray-100 text-gray-600",
  contacted: "bg-blue-100 text-blue-700",
  converted: "bg-green-100 text-green-700",
  lost: "bg-red-100 text-red-600",
};

const STATUS_LABELS: Record<ReferralStatus, string> = {
  pending: "Pending",
  contacted: "Contacted",
  converted: "Converted",
  lost: "Lost",
};

type ClientStub = Pick<Client, "id" | "name">;

export default function ReferralsClient({
  referrals: initial,
  clients,
}: {
  referrals: Referral[];
  clients: ClientStub[];
}) {
  const [referrals, setReferrals] = useState<Referral[]>(initial);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);

  // New referral form state
  const [form, setForm] = useState({
    referrer_client_id: "",
    referred_name: "",
    referred_phone: "",
    referred_email: "",
    reward_amount: "50",
    notes: "",
  });

  // Stats
  const total = referrals.length;
  const converted = referrals.filter((r) => r.status === "converted").length;
  const pendingRewards = referrals
    .filter((r) => r.status === "converted" && !r.reward_paid)
    .reduce((sum, r) => sum + (r.reward_amount ?? 0), 0);

  async function updateStatus(id: string, status: ReferralStatus) {
    setReferrals((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status } : r))
    );
    await fetch("/api/referrals", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
  }

  async function toggleRewardPaid(r: Referral) {
    const newVal = !r.reward_paid;
    setReferrals((prev) =>
      prev.map((ref) => (ref.id === r.id ? { ...ref, reward_paid: newVal } : ref))
    );
    await fetch("/api/referrals", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: r.id, reward_paid: newVal }),
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/referrals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        referrer_client_id: form.referrer_client_id || null,
        reward_amount: parseFloat(form.reward_amount) || 0,
      }),
    });
    if (res.ok) {
      const { referral } = await res.json() as { referral: Referral };
      // attach referrer name if chosen
      const referrer = clients.find((c) => c.id === form.referrer_client_id);
      setReferrals((prev) => [{ ...referral, referrer: referrer as Client | undefined }, ...prev]);
      setShowModal(false);
      setForm({ referrer_client_id: "", referred_name: "", referred_phone: "", referred_email: "", reward_amount: "50", notes: "" });
    }
    setSaving(false);
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-extrabold text-[#1a2744] flex items-center gap-2">
          <GitBranch size={22} /> Referrals
        </h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#e8600a] text-white text-sm font-semibold rounded-lg hover:bg-[#c4500a] transition-colors"
        >
          <Plus size={15} /> Add Referral
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-5">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Total Referrals</p>
          <p className="text-3xl font-extrabold text-[#1a2744]">{total}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Converted</p>
          <p className="text-3xl font-extrabold text-green-600">{converted}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Pending Rewards</p>
          <p className="text-3xl font-extrabold text-[#e8600a]">
            ${pendingRewards.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {referrals.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <GitBranch size={36} className="mx-auto mb-3 opacity-30" />
            <p className="font-medium">No referrals yet</p>
            <p className="text-sm mt-1">Add your first referral using the button above</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-left">
                <th className="px-4 py-3 font-semibold text-gray-600">Referred By</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Referred Person</th>
                <th className="px-4 py-3 font-semibold text-gray-600 hidden md:table-cell">Contact</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Status</th>
                <th className="px-4 py-3 font-semibold text-gray-600 hidden lg:table-cell">Reward</th>
                <th className="px-4 py-3 font-semibold text-gray-600 hidden lg:table-cell">Paid</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {referrals.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-[#1a2744]">
                    {r.referrer?.name ?? <span className="text-gray-400 italic">Unknown</span>}
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-800">{r.referred_name}</td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <div className="flex flex-col gap-0.5 text-gray-500">
                      {r.referred_phone && (
                        <span className="flex items-center gap-1"><Phone size={11} />{r.referred_phone}</span>
                      )}
                      {r.referred_email && (
                        <span className="flex items-center gap-1"><Mail size={11} />{r.referred_email}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="relative inline-block">
                      <select
                        value={r.status}
                        onChange={(e) => updateStatus(r.id, e.target.value as ReferralStatus)}
                        className={`appearance-none text-xs font-semibold px-2.5 py-1 pr-6 rounded-full cursor-pointer border-0 focus:outline-none ${STATUS_STYLES[r.status]}`}
                      >
                        {(Object.keys(STATUS_LABELS) as ReferralStatus[]).map((s) => (
                          <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                        ))}
                      </select>
                      <ChevronDown size={11} className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-50" />
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <span className="flex items-center gap-0.5 text-gray-700">
                      <DollarSign size={12} />
                      {(r.reward_amount ?? 0).toFixed(0)}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    {r.status === "converted" ? (
                      <button
                        onClick={() => toggleRewardPaid(r)}
                        className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full transition-colors ${
                          r.reward_paid
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-500 hover:bg-green-50 hover:text-green-600"
                        }`}
                      >
                        {r.reward_paid && <Check size={11} />}
                        {r.reward_paid ? "Paid" : "Mark Paid"}
                      </button>
                    ) : (
                      <span className="text-gray-300 text-xs">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add Referral Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-[#1a2744]">Add Referral</h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Referred By (Client)</label>
                <select
                  value={form.referrer_client_id}
                  onChange={(e) => setForm((f) => ({ ...f, referrer_client_id: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#e8600a]/30"
                >
                  <option value="">— Select client —</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Referred Person Name *</label>
                <input
                  required
                  value={form.referred_name}
                  onChange={(e) => setForm((f) => ({ ...f, referred_name: e.target.value }))}
                  placeholder="Full name"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#e8600a]/30"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Phone</label>
                  <input
                    value={form.referred_phone}
                    onChange={(e) => setForm((f) => ({ ...f, referred_phone: e.target.value }))}
                    placeholder="(208) 555-0100"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#e8600a]/30"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Reward ($)</label>
                  <input
                    type="number"
                    min="0"
                    step="5"
                    value={form.reward_amount}
                    onChange={(e) => setForm((f) => ({ ...f, reward_amount: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#e8600a]/30"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Email</label>
                <input
                  type="email"
                  value={form.referred_email}
                  onChange={(e) => setForm((f) => ({ ...f, referred_email: e.target.value }))}
                  placeholder="email@example.com"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#e8600a]/30"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Notes</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                  rows={2}
                  placeholder="Any context about this referral…"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#e8600a]/30 resize-none"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-2 bg-[#e8600a] text-white text-sm font-semibold rounded-lg hover:bg-[#c4500a] transition-colors disabled:opacity-60"
                >
                  {saving ? "Saving…" : "Add Referral"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
