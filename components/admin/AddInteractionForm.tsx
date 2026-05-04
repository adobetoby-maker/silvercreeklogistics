"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { adminClient as _admin } from "@/lib/supabase/admin";
import type { Client } from "@/lib/types/db";

const TYPES = ["call", "email", "delivery", "quote", "note", "meeting"] as const;

export default function AddInteractionForm({ clients }: { clients: Pick<Client, "id" | "name">[] }) {
  const router = useRouter();
  const [form, setForm] = useState({ client_id: "", type: "call", subject: "", notes: "", next_followup: "" });
  const [loading, setLoading] = useState(false);

  function set(k: string, v: string) { setForm((f) => ({ ...f, [k]: v })); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/interactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, next_followup: form.next_followup || null }),
    });
    setForm({ client_id: "", type: "call", subject: "", notes: "", next_followup: "" });
    setLoading(false);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">Client *</label>
        <select required value={form.client_id} onChange={(e) => set("client_id", e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#e8600a]">
          <option value="">Select client…</option>
          {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">Type</label>
        <select value={form.type} onChange={(e) => set("type", e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#e8600a]">
          {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">Subject</label>
        <input value={form.subject} onChange={(e) => set("subject", e.target.value)} placeholder="e.g. Quoted road base delivery"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#e8600a]" />
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">Notes</label>
        <textarea value={form.notes} onChange={(e) => set("notes", e.target.value)} rows={2} placeholder="Details…"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#e8600a] resize-none" />
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">Follow-up date</label>
        <input type="date" value={form.next_followup} onChange={(e) => set("next_followup", e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#e8600a]" />
      </div>
      <button type="submit" disabled={loading}
        className="w-full py-2.5 bg-[#e8600a] hover:bg-[#c4500a] disabled:opacity-60 text-white font-bold rounded-lg text-sm transition-colors">
        {loading ? "Saving…" : "Log Interaction"}
      </button>
    </form>
  );
}
