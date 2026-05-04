"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DollarSign } from "lucide-react";
import type { Invoice, Payment } from "@/lib/types/db";

export default function PaymentPanel({ invoice }: { invoice: Invoice & { payments?: Payment[] } }) {
  const router = useRouter();
  const [amount, setAmount] = useState(invoice.balance.toFixed(2));
  const [method, setMethod] = useState("cash");
  const [ref, setRef] = useState("");
  const [loading, setLoading] = useState(false);

  async function record() {
    setLoading(true);
    await fetch(`/api/invoices/${invoice.id}/payment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: parseFloat(amount), method, reference_number: ref || null }),
    });
    setLoading(false);
    router.refresh();
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-5 space-y-4">
      <h3 className="font-bold text-[#1a2744] flex items-center gap-2">
        <DollarSign size={16} className="text-[#e8600a]" /> Record Payment
      </h3>

      <div className="space-y-1.5 text-sm border border-gray-100 rounded-lg p-3">
        <div className="flex justify-between text-gray-600"><span>Invoice total</span><span className="font-semibold">${invoice.total.toFixed(2)}</span></div>
        <div className="flex justify-between text-gray-600"><span>Paid</span><span className="font-semibold text-green-600">${invoice.amount_paid.toFixed(2)}</span></div>
        <div className="flex justify-between font-bold text-[#e8600a] border-t border-gray-100 pt-1.5"><span>Balance</span><span>${invoice.balance.toFixed(2)}</span></div>
      </div>

      {invoice.status !== "paid" && invoice.status !== "void" && (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Amount</label>
            <input type="number" min="0.01" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#e8600a]" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Method</label>
            <select value={method} onChange={(e) => setMethod(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#e8600a]">
              {["cash", "check", "card", "ach", "other"].map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Reference # (optional)</label>
            <input value={ref} onChange={(e) => setRef(e.target.value)} placeholder="Check #, transaction ID…"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#e8600a]" />
          </div>
          <button onClick={record} disabled={loading || parseFloat(amount) <= 0}
            className="w-full py-2.5 bg-[#e8600a] hover:bg-[#c4500a] disabled:opacity-60 text-white font-bold rounded-lg text-sm transition-colors">
            {loading ? "Recording…" : "Record Payment"}
          </button>
        </div>
      )}
    </div>
  );
}
