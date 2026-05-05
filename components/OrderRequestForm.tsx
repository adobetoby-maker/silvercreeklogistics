"use client";

import { useState } from "react";
import { materials } from "@/lib/materials";
import { CheckCircle, Loader2 } from "lucide-react";

export default function OrderRequestForm() {
  const [form, setForm] = useState({
    customer_name: "", customer_phone: "", customer_email: "",
    material_id: "", quantity: "", delivery_address: "", delivery_city: "",
    requested_date: "", delivery_notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const selected = materials.find((m) => m.id === form.material_id);

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/service-requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setSent(true);
    } else {
      setError("Something went wrong. Please call us directly.");
    }
    setLoading(false);
  }

  if (sent) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-10 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle size={32} className="text-green-600" />
        </div>
        <h2 className="text-xl font-bold text-[#1a2744] mb-2">Request Received!</h2>
        <p className="text-gray-500 text-sm max-w-sm mx-auto">
          We'll be in touch within 30 minutes to confirm your delivery. You can also call us directly to get scheduled faster.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 space-y-6">
      {/* Contact */}
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-4">Your Info</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Name *</label>
            <input required value={form.customer_name} onChange={(e) => set("customer_name", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#e8600a]"
              placeholder="Your name" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Phone *</label>
            <input required type="tel" value={form.customer_phone} onChange={(e) => set("customer_phone", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#e8600a]"
              placeholder="(208) 555-0000" />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-1">Email <span className="text-gray-400 font-normal">(optional)</span></label>
            <input type="email" value={form.customer_email} onChange={(e) => set("customer_email", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#e8600a]"
              placeholder="you@example.com" />
          </div>
        </div>
      </div>

      {/* Order */}
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-4">What You Need</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-1">Material *</label>
            <select required value={form.material_id} onChange={(e) => set("material_id", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#e8600a]">
              <option value="">Select a material…</option>
              {materials.map((m) => (
                <option key={m.id} value={m.id}>{m.name} — ${m.deliveredPrice}/{m.unit} delivered</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Quantity * {selected && <span className="text-gray-400 font-normal">({selected.unit}s)</span>}
            </label>
            <input required type="number" min="1" step="0.5" value={form.quantity} onChange={(e) => set("quantity", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#e8600a]"
              placeholder={selected ? `Min ${selected.minLoad} ${selected.unit}s` : "How many?"} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Preferred Date</label>
            <input type="date" value={form.requested_date} onChange={(e) => set("requested_date", e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#e8600a]" />
          </div>
        </div>
      </div>

      {/* Delivery */}
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-4">Delivery Location</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-1">Street Address *</label>
            <input required value={form.delivery_address} onChange={(e) => set("delivery_address", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#e8600a]"
              placeholder="123 Main St" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">City</label>
            <input value={form.delivery_city} onChange={(e) => set("delivery_city", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#e8600a]"
              placeholder="Twin Falls" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Access Notes</label>
            <input value={form.delivery_notes} onChange={(e) => set("delivery_notes", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#e8600a]"
              placeholder="Gate code, where to dump, etc." />
          </div>
        </div>
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <button type="submit" disabled={loading}
        className="w-full py-3.5 bg-[#e8600a] hover:bg-[#c4500a] disabled:opacity-60 text-white font-bold rounded-lg text-base transition-colors flex items-center justify-center gap-2">
        {loading ? <><Loader2 size={18} className="animate-spin" /> Submitting…</> : "Request This Load"}
      </button>
      <p className="text-xs text-center text-gray-400">We'll confirm within 30 minutes. Same-day delivery often available.</p>
    </form>
  );
}
