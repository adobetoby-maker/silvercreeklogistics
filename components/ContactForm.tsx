"use client";

import { useState } from "react";
import { Send, CheckCircle } from "lucide-react";
import { materials } from "@/lib/materials";

export default function ContactForm() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    material: "",
    quantity: "",
    deliveryAddress: "",
    preferredDate: "",
    message: "",
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed");
      setSubmitted(true);
    } catch {
      alert("Something went wrong sending your message. Please call us directly at (208) 555-0192.");
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-12 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <CheckCircle size={32} className="text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-[#1a2744] mb-2">Message Received!</h2>
        <p className="text-gray-500 max-w-sm">
          We'll get back to you as soon as possible — usually within a few hours during business hours. For urgent
          needs, call us directly.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-6 space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            Name <span className="text-[#e8600a]">*</span>
          </label>
          <input
            required
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Your name"
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#e8600a] focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            Phone <span className="text-[#e8600a]">*</span>
          </label>
          <input
            required
            name="phone"
            type="tel"
            value={form.phone}
            onChange={handleChange}
            placeholder="(208) 555-0100"
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#e8600a] focus:border-transparent"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
        <input
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          placeholder="you@example.com"
          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#e8600a] focus:border-transparent"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Material Needed</label>
          <select
            name="material"
            value={form.material}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#e8600a] focus:border-transparent"
          >
            <option value="">Select material...</option>
            {materials.map((m) => (
              <option key={m.id} value={m.name}>{m.name}</option>
            ))}
            <option value="Not sure">Not sure yet</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Approximate Quantity</label>
          <input
            name="quantity"
            value={form.quantity}
            onChange={handleChange}
            placeholder="e.g. 15 tons, 1 truck load"
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#e8600a] focus:border-transparent"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
          Delivery Address <span className="text-[#e8600a]">*</span>
        </label>
        <input
          required
          name="deliveryAddress"
          value={form.deliveryAddress}
          onChange={handleChange}
          placeholder="Street address, city, ZIP"
          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#e8600a] focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Preferred Delivery Date</label>
        <input
          name="preferredDate"
          type="date"
          value={form.preferredDate}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#e8600a] focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Additional Notes</label>
        <textarea
          name="message"
          value={form.message}
          onChange={handleChange}
          rows={3}
          placeholder="Site access notes, project details, anything else we should know..."
          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#e8600a] focus:border-transparent resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#e8600a] hover:bg-[#c4500a] disabled:opacity-60 text-white font-bold rounded-lg transition-colors text-base"
      >
        {loading ? (
          "Sending..."
        ) : (
          <>
            <Send size={18} />
            Send Quote Request
          </>
        )}
      </button>

      <p className="text-xs text-gray-400 text-center">
        By submitting, you agree to our{" "}
        <a href="/terms" className="underline hover:text-gray-600">Terms of Service</a> and{" "}
        <a href="/privacy" className="underline hover:text-gray-600">Privacy Policy</a>.
      </p>
    </form>
  );
}
