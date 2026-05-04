"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw, CheckCircle } from "lucide-react";

export default function QBSyncButton({ invoiceId, qbInvoiceId, clientQbId }: {
  invoiceId: string;
  qbInvoiceId: string | null;
  clientQbId: string | null;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [synced, setSynced] = useState(!!qbInvoiceId);

  async function sync() {
    setLoading(true);
    // If client not in QB, sync them first
    if (!clientQbId) {
      alert("Sync the client to QuickBooks first (on the client page).");
      setLoading(false);
      return;
    }
    const res = await fetch("/api/quickbooks/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "invoice", id: invoiceId }),
    });
    if (res.ok) {
      setSynced(true);
      router.refresh();
    } else {
      alert("QuickBooks sync failed. Check your QB connection in Settings.");
    }
    setLoading(false);
  }

  if (synced) {
    return (
      <div className="flex items-center gap-1.5 px-3 py-2 bg-green-100 text-green-700 text-sm font-semibold rounded-lg">
        <CheckCircle size={14} /> In QuickBooks
      </div>
    );
  }

  return (
    <button onClick={sync} disabled={loading}
      className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 text-sm font-semibold rounded-lg hover:bg-gray-50 disabled:opacity-60 transition-colors">
      <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
      {loading ? "Syncing…" : "Sync to QB"}
    </button>
  );
}
