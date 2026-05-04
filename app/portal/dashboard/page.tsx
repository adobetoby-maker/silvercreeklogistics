import { createClient } from "@/lib/supabase/server";
import { adminClient } from "@/lib/supabase/admin";
import Link from "next/link";
import { FileText, DollarSign, Clock } from "lucide-react";
import { shopInfo } from "@/lib/shopInfo";
import type { Invoice } from "@/lib/types/db";

export default async function PortalDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: client } = await adminClient
    .from("clients")
    .select("*")
    .eq("portal_user_id", user!.id)
    .single();

  const { data: invoices } = await adminClient
    .from("invoices")
    .select("*")
    .eq("client_id", client?.id ?? "")
    .order("created_at", { ascending: false });

  const outstanding = (invoices as Invoice[] ?? []).filter((i) => i.status !== "paid" && i.status !== "void");
  const totalBalance = outstanding.reduce((s, i) => s + i.balance, 0);

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-[#1a2744] mb-1">
        Welcome back{client?.name ? `, ${client.name.split(" ")[0]}` : ""}
      </h1>
      <p className="text-gray-500 text-sm mb-8">Here's your account summary.</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: "Total Invoices", value: invoices?.length ?? 0, icon: FileText, color: "text-purple-600 bg-purple-50" },
          { label: "Outstanding Balance", value: `$${totalBalance.toFixed(2)}`, icon: DollarSign, color: "text-orange-600 bg-orange-50" },
          { label: "Open Invoices", value: outstanding.length, icon: Clock, color: "text-blue-600 bg-blue-50" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-xl p-5 shadow-sm">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${color}`}><Icon size={20} /></div>
            <div className="text-2xl font-extrabold text-[#1a2744]">{value}</div>
            <div className="text-sm text-gray-500">{label}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-bold text-[#1a2744]">Recent Invoices</h2>
          <Link href="/portal/invoices" className="text-sm text-[#e8600a] hover:underline">View all</Link>
        </div>
        <div className="divide-y divide-gray-50">
          {(invoices as Invoice[] ?? []).slice(0, 5).map((inv) => (
            <Link key={inv.id} href={`/portal/invoices/${inv.id}`} className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition-colors">
              <div>
                <div className="font-semibold text-sm text-[#1a2744]">{inv.invoice_number}</div>
                <div className="text-xs text-gray-400">{inv.issue_date}</div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                  inv.status === "paid" ? "bg-green-100 text-green-700" :
                  inv.status === "overdue" ? "bg-red-100 text-red-700" :
                  "bg-blue-100 text-blue-700"
                }`}>{inv.status}</span>
                <span className="font-bold text-[#1a2744] text-sm">${inv.total.toFixed(2)}</span>
              </div>
            </Link>
          ))}
          {!invoices?.length && (
            <p className="px-5 py-8 text-center text-gray-400 text-sm">No invoices yet.</p>
          )}
        </div>
      </div>

      <div className="bg-[#1a2744] text-white rounded-xl p-5 text-sm">
        <div className="font-bold mb-1">Questions about your account?</div>
        <p className="text-gray-300 text-xs mb-3">Contact Silver Creek Logistics directly.</p>
        <div className="flex gap-4">
          <a href={`tel:${shopInfo.phone.replace(/\D/g, "")}`} className="text-[#f4a46a] hover:underline">{shopInfo.phone}</a>
          <a href={`mailto:${shopInfo.email}`} className="text-[#f4a46a] hover:underline">{shopInfo.email}</a>
        </div>
      </div>
    </div>
  );
}
