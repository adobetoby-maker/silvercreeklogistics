"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Truck, Mail } from "lucide-react";

export default function PortalLoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/portal/dashboard` },
    });
    setSent(true);
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-[#f5f0eb] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-[#e8600a] rounded-lg flex items-center justify-center">
            <Truck size={20} className="text-white" />
          </div>
          <div>
            <div className="font-bold text-[#1a2744]">Silver Creek Logistics</div>
            <div className="text-xs text-gray-400">Client Portal</div>
          </div>
        </div>

        {sent ? (
          <div className="text-center">
            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail size={24} className="text-green-600" />
            </div>
            <h2 className="text-lg font-bold text-[#1a2744] mb-2">Check your email</h2>
            <p className="text-gray-500 text-sm">
              We sent a login link to <strong>{email}</strong>. Click it to access your invoices.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#e8600a]"
              />
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-3 bg-[#e8600a] hover:bg-[#c4500a] disabled:opacity-60 text-white font-bold rounded-lg transition-colors">
              {loading ? "Sending…" : "Email Me a Login Link"}
            </button>
            <p className="text-xs text-center text-gray-400">
              No password needed — we'll email you a secure link each time.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
