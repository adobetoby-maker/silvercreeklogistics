"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Client, ClientStatus } from "@/lib/types/db";

const STATUS_OPTIONS: ClientStatus[] = ["active", "lead", "inactive"];

export default function ClientForm({ client }: { client?: Client }) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: client?.name ?? "",
    email: client?.email ?? "",
    phone: client?.phone ?? "",
    company: client?.company ?? "",
    address: client?.address ?? "",
    city: client?.city ?? "",
    state: client?.state ?? "ID",
    zip: client?.zip ?? "",
    status: client?.status ?? "active" as ClientStatus,
    notes: client?.notes ?? "",
    tags: client?.tags?.join(", ") ?? "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const payload = {
      ...form,
      tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
    };
    const res = await fetch(
      client ? `/api/clients/${client.id}` : "/api/clients",
      {
        method: client ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );
    if (res.ok) {
      const data = await res.json();
      router.push(`/admin/clients/${data.id}`);
    } else {
      const err = await res.json();
      setError(err.error ?? "Failed to save client");
      setLoading(false);
    }
  }

  const field = (label: string, key: string, props = {}) => (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1">{label}</label>
      <input
        value={(form as Record<string, string>)[key]}
        onChange={(e) => set(key, e.target.value)}
        className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#e8600a]"
        {...props}
      />
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {field("Name *", "name", { required: true })}
        {field("Company", "company")}
        {field("Phone", "phone", { type: "tel" })}
        {field("Email", "email", { type: "email" })}
      </div>
      {field("Street Address", "address")}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {field("City", "city")}
        {field("State", "state")}
        {field("ZIP", "zip")}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Status</label>
          <select
            value={form.status}
            onChange={(e) => set("status", e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#e8600a]"
          >
            {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>
      {field("Tags (comma-separated)", "tags")}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Notes</label>
        <textarea
          value={form.notes}
          onChange={(e) => set("notes", e.target.value)}
          rows={3}
          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#e8600a] resize-none"
        />
      </div>
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2.5 bg-[#e8600a] hover:bg-[#c4500a] disabled:opacity-60 text-white font-bold rounded-lg transition-colors"
        >
          {loading ? "Saving…" : client ? "Save Changes" : "Create Client"}
        </button>
        <button type="button" onClick={() => router.back()} className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-colors">
          Cancel
        </button>
      </div>
    </form>
  );
}
