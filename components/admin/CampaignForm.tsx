"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Send } from "lucide-react";

export default function CampaignForm({ availableTags }: { availableTags: string[] }) {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", type: "email", subject: "", body: "", target_tags: [] as string[] });
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(false);

  function set(k: string, v: string) { setForm((f) => ({ ...f, [k]: v })); }

  function toggleTag(tag: string) {
    setForm((f) => ({
      ...f,
      target_tags: f.target_tags.includes(tag)
        ? f.target_tags.filter((t) => t !== tag)
        : [...f.target_tags, tag],
    }));
  }

  async function handleSubmit(e: React.FormEvent, send = false) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/campaigns", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, send }),
    });
    if (res.ok) {
      const data = await res.json();
      router.push(`/admin/marketing`);
    }
    setLoading(false);
  }

  return (
    <form className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Campaign Name *</label>
          <input required value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Spring special, Seasonal reminder…"
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#e8600a]" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Type</label>
          <select value={form.type} onChange={(e) => set("type", e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#e8600a]">
            <option value="email">Email</option>
            <option value="sms">SMS</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Subject Line</label>
        <input value={form.subject} onChange={(e) => set("subject", e.target.value)} placeholder="Special pricing on road base this month"
          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#e8600a]" />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Message Body</label>
        <textarea value={form.body} onChange={(e) => set("body", e.target.value)} rows={6}
          placeholder="Hi {name}, we're running a special on road base this spring…"
          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#e8600a] resize-none" />
        <p className="text-xs text-gray-400 mt-1">Use {"{name}"} to personalize with the client's name.</p>
      </div>

      {availableTags.length > 0 && (
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Target by Tag (leave empty = all active clients)</label>
          <div className="flex flex-wrap gap-2">
            {availableTags.map((tag) => (
              <button key={tag} type="button" onClick={() => toggleTag(tag)}
                className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                  form.target_tags.includes(tag) ? "bg-[#e8600a] border-[#e8600a] text-white" : "border-gray-300 text-gray-600 hover:border-[#e8600a]"
                }`}>{tag}</button>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={(e) => handleSubmit(e, false)} disabled={loading}
          className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-colors disabled:opacity-60">
          Save Draft
        </button>
        <button type="button" onClick={(e) => handleSubmit(e, true)} disabled={loading}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#e8600a] hover:bg-[#c4500a] text-white font-bold rounded-lg transition-colors disabled:opacity-60">
          <Send size={15} /> {loading ? "Sending…" : "Send Now"}
        </button>
      </div>
    </form>
  );
}
