"use client";

import { useState, useCallback } from "react";
import { Receipt, Upload, Loader2 } from "lucide-react";

type ReceiptRow = {
  id: string;
  vendor: string | null;
  amount: number | null;
  receipt_date: string | null;
  category: string | null;
  employee: string | null;
  status: string;
  file_url: string | null;
  created_at: string;
};

function statusBadge(status: string) {
  const map: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-700",
    review: "bg-orange-100 text-orange-700",
    approved: "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-700",
  };
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-semibold capitalize ${map[status] ?? "bg-gray-100 text-gray-500"}`}>
      {status}
    </span>
  );
}

function categoryBadge(cat: string | null) {
  if (!cat) return <span className="text-gray-400 text-xs">—</span>;
  return <span className="px-1.5 py-0.5 rounded text-xs bg-purple-100 text-purple-700">{cat}</span>;
}

function fmtDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function ReceiptInboxClient({ receipts: initialReceipts }: { receipts: ReceiptRow[] }) {
  const [receipts, setReceipts] = useState(initialReceipts);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  async function uploadReceipt(file: File) {
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/receipts", { method: "POST", body: form });
      if (res.ok) {
        const { receipt } = await res.json();
        setReceipts((prev) => [receipt, ...prev]);
      }
    } finally {
      setUploading(false);
    }
  }

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) uploadReceipt(file);
    },
    []
  );

  async function processOcr(receiptId: string) {
    setProcessingId(receiptId);
    try {
      const res = await fetch("/api/receipts/ocr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receipt_id: receiptId }),
      });
      if (res.ok) {
        const { receipt } = await res.json();
        setReceipts((prev) => prev.map((r) => (r.id === receiptId ? { ...r, ...receipt } : r)));
      }
    } finally {
      setProcessingId(null);
    }
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Receipt size={22} className="text-[#e8600a]" />
        <h1 className="text-2xl font-extrabold text-[#1a2744]">Receipt Inbox</h1>
        <span className="ml-auto text-sm text-gray-400">{receipts.length} receipts</span>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={`border-2 border-dashed rounded-xl p-8 text-center mb-6 transition-colors cursor-pointer ${
          dragging ? "border-[#e8600a] bg-orange-50" : "border-gray-300 bg-gray-50 hover:bg-gray-100"
        }`}
        onClick={() => {
          const input = document.createElement("input");
          input.type = "file";
          input.accept = "image/*,application/pdf";
          input.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) uploadReceipt(file);
          };
          input.click();
        }}
      >
        {uploading ? (
          <Loader2 size={28} className="mx-auto text-[#e8600a] animate-spin mb-2" />
        ) : (
          <Upload size={28} className={`mx-auto mb-2 ${dragging ? "text-[#e8600a]" : "text-gray-400"}`} />
        )}
        <p className={`text-sm font-medium ${dragging ? "text-[#e8600a]" : "text-gray-500"}`}>
          {uploading ? "Uploading…" : dragging ? "Drop receipt here" : "Drag & drop receipt images here, or click to browse"}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">JPEG, PNG, PDF supported</p>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-left">
              <th className="px-4 py-3 font-semibold text-gray-600">Vendor</th>
              <th className="px-4 py-3 font-semibold text-gray-600 text-right">Amount</th>
              <th className="px-4 py-3 font-semibold text-gray-600 hidden md:table-cell">Date</th>
              <th className="px-4 py-3 font-semibold text-gray-600 hidden lg:table-cell">Category</th>
              <th className="px-4 py-3 font-semibold text-gray-600 hidden lg:table-cell">Employee</th>
              <th className="px-4 py-3 font-semibold text-gray-600">Status</th>
              <th className="px-4 py-3 font-semibold text-gray-600 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {receipts.map((r) => (
              <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 text-[#1a2744] font-medium">
                  {r.vendor ?? <span className="text-gray-400 italic text-xs">Not extracted</span>}
                </td>
                <td className="px-4 py-3 text-right font-semibold text-[#1a2744]">
                  {r.amount != null ? `$${r.amount.toFixed(2)}` : "—"}
                </td>
                <td className="px-4 py-3 text-gray-500 text-xs hidden md:table-cell">
                  {fmtDate(r.receipt_date)}
                </td>
                <td className="px-4 py-3 hidden lg:table-cell">{categoryBadge(r.category)}</td>
                <td className="px-4 py-3 text-gray-500 text-xs hidden lg:table-cell">
                  {r.employee ?? "—"}
                </td>
                <td className="px-4 py-3">{statusBadge(r.status)}</td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => processOcr(r.id)}
                    disabled={processingId === r.id}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs bg-[#1a2744] text-white rounded hover:bg-[#0f1a33] transition-colors disabled:opacity-50 ml-auto"
                  >
                    {processingId === r.id ? (
                      <Loader2 size={11} className="animate-spin" />
                    ) : (
                      <Receipt size={11} />
                    )}
                    OCR
                  </button>
                </td>
              </tr>
            ))}
            {receipts.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-gray-400">
                  No receipts yet. Drop one above to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
