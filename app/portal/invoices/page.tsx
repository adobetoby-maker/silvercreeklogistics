import { createClient } from "@/lib/supabase/server";
import { adminClient } from "@/lib/supabase/admin";
import Link from "next/link";
import type { Invoice } from "@/lib/types/db";

export default async function PortalInvoicesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: client } = await adminClient.from("clients").select("id").eq("portal_user_id", user!.id).single();
  const { data: invoices } = await adminClient.from("invoices").select("*").eq("client_id", client?.id ?? "").order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-[#1a2744] mb-6">My Invoices</h1>
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-left">
              <th className="px-4 py-3 font-semibold text-gray-600">#</th>
              <th className="px-4 py-3 font-semibold text-gray-600 hidden sm:table-cell">Date</th>
              <th className="px-4 py-3 font-semibold text-gray-600 hidden md:table-cell">Due</th>
              <th className="px-4 py-3 font-semibold text-gray-600">Status</th>
              <th className="px-4 py-3 font-semibold text-gray-600 text-right">Total</th>
              <th className="px-4 py-3 font-semibold text-gray-600 text-right hidden sm:table-cell">Balance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {(invoices as Invoice[] ?? []).map((inv) => (
              <tr key={inv.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <Link href={`/portal/invoices/${inv.id}`} className="font-semibold text-[#e8600a] hover:underline">{inv.invoice_number}</Link>
                </td>
                <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">{inv.issue_date}</td>
                <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{inv.due_date ?? "—"}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                    inv.status === "paid" ? "bg-green-100 text-green-700" :
                    inv.status === "overdue" ? "bg-red-100 text-red-700" :
                    "bg-blue-100 text-blue-700"
                  }`}>{inv.status}</span>
                </td>
                <td className="px-4 py-3 text-right font-semibold text-[#1a2744]">${inv.total.toFixed(2)}</td>
                <td className={`px-4 py-3 text-right font-semibold hidden sm:table-cell ${inv.balance > 0 ? "text-red-600" : "text-green-600"}`}>
                  ${inv.balance.toFixed(2)}
                </td>
              </tr>
            ))}
            {!invoices?.length && (
              <tr><td colSpan={6} className="px-4 py-10 text-center text-gray-400">No invoices on your account.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
