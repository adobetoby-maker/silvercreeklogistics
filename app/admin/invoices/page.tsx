import { requireAdmin } from "@/lib/adminAuth";
import { adminClient } from "@/lib/supabase/admin";
import Link from "next/link";
import { Plus } from "lucide-react";
import type { Invoice, Client } from "@/lib/types/db";

type InvoiceRow = Invoice & { client: Client };

export default async function InvoicesPage() {
  await requireAdmin();
  const { data } = await adminClient
    .from("invoices")
    .select("*, client:clients(name)")
    .order("created_at", { ascending: false });

  const invoices = (data ?? []) as InvoiceRow[];

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-extrabold text-[#1a2744]">Invoices</h1>
        <Link href="/admin/invoices/new" className="flex items-center gap-1.5 px-4 py-2 bg-[#e8600a] text-white text-sm font-semibold rounded-lg hover:bg-[#c4500a] transition-colors">
          <Plus size={15} /> New Invoice
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-left">
              <th className="px-4 py-3 font-semibold text-gray-600">#</th>
              <th className="px-4 py-3 font-semibold text-gray-600">Client</th>
              <th className="px-4 py-3 font-semibold text-gray-600 hidden sm:table-cell">Date</th>
              <th className="px-4 py-3 font-semibold text-gray-600 hidden md:table-cell">Due</th>
              <th className="px-4 py-3 font-semibold text-gray-600">Status</th>
              <th className="px-4 py-3 font-semibold text-gray-600 text-right">Total</th>
              <th className="px-4 py-3 font-semibold text-gray-600 text-right hidden lg:table-cell">Balance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {invoices.map((inv) => (
              <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <Link href={`/admin/invoices/${inv.id}`} className="font-semibold text-[#e8600a] hover:underline">
                    {inv.invoice_number}
                  </Link>
                </td>
                <td className="px-4 py-3 text-[#1a2744] font-medium">{inv.client?.name}</td>
                <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">{inv.issue_date}</td>
                <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{inv.due_date ?? "—"}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                    inv.status === "paid" ? "bg-green-100 text-green-700" :
                    inv.status === "overdue" ? "bg-red-100 text-red-700" :
                    inv.status === "sent" ? "bg-blue-100 text-blue-700" :
                    inv.status === "void" ? "bg-gray-100 text-gray-400" :
                    "bg-yellow-100 text-yellow-700"
                  }`}>{inv.status}</span>
                </td>
                <td className="px-4 py-3 text-right font-semibold text-[#1a2744]">${inv.total.toFixed(2)}</td>
                <td className={`px-4 py-3 text-right font-semibold hidden lg:table-cell ${inv.balance > 0 ? "text-red-600" : "text-green-600"}`}>
                  ${inv.balance.toFixed(2)}
                </td>
              </tr>
            ))}
            {invoices.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-10 text-center text-gray-400">
                No invoices yet. <Link href="/admin/invoices/new" className="text-[#e8600a] underline">Create one</Link>
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
