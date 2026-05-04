"use client";

import { useState } from "react";
import { UserPlus, CheckCircle } from "lucide-react";

export default function InviteButton({ clientId, hasPortal, email }: { clientId: string; hasPortal: boolean; email: string | null }) {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(hasPortal);

  async function invite() {
    if (!email) { alert("Client has no email address."); return; }
    setLoading(true);
    const res = await fetch(`/api/clients/${clientId}/invite`, { method: "POST" });
    if (res.ok) setDone(true);
    else alert("Failed to send invite. Make sure Supabase is configured.");
    setLoading(false);
  }

  if (done) {
    return (
      <div className="flex items-center gap-1.5 px-3 py-2 bg-green-100 text-green-700 text-sm font-semibold rounded-lg">
        <CheckCircle size={14} /> Portal Active
      </div>
    );
  }

  return (
    <button
      onClick={invite}
      disabled={loading}
      className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-60"
    >
      <UserPlus size={14} />
      {loading ? "Sending…" : "Invite to Portal"}
    </button>
  );
}
