import { requireAdmin } from "@/lib/adminAuth";
import { adminClient } from "@/lib/supabase/admin";
import Link from "next/link";
import { Users, FileText, DollarSign, AlertCircle, Plus } from "lucide-react";

export default async function AdminDashboard() {
  await requireAdmin();

  const [{ count: clientCount }, { data: invoices }] = await Promise.all([
    adminClient.from("clients").select("*", { count: "exact", head: true }),
    adminClient.from("invoices").select("status, total, balance").order("created_at", { ascending: false }),
  ]);

  const stats = {
    clients: clientCount ?? 0,
    invoices: invoices?.length ?? 0,
    outstanding: invoices?.filter((i) => i.status === "sent" || i.status === "overdue")
      .reduce((s, i) => s + i.balance, 0) ?? 0,
    overdue: invoices?.filter((i) => i.status === "overdue").length ?? 0,
  };

  const recent = invoices?.slice(0, 8) ?? [];

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1a2744]">Dashboard</h1>
          <p className="text-gray-500 text-sm">Silver Creek Logistics LLC</p>
        </div>
        <div className="flex gap-3">
          <Link href="/admin/clients/new" className="flex items-center gap-1.5 px-4 py-2 bg-white border border-gray-200 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors">
            <Plus size={15} /> Client
          </Link>
          <Link href="/admin/invoices/new" className="flex items-center gap-1.5 px-4 py-2 bg-[#e8600a] text-white text-sm font-semibold rounded-lg hover:bg-[#c4500a] transition-colors">
            <Plus size={15} /> Invoice
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Clients", value: stats.clients, icon: Users, href: "/admin/clients", color: "text-blue-600 bg-blue-50" },
          { label: "Total Invoices", value: stats.invoices, icon: FileText, href: "/admin/invoices", color: "text-purple-600 bg-purple-50" },
          { label: "Outstanding", value: `$${stats.outstanding.toFixed(2)}`, icon: DollarSign, href: "/admin/invoices", color: "text-orange-600 bg-orange-50" },
          { label: "Overdue", value: stats.overdue, icon: AlertCircle, href: "/admin/invoices?status=overdue", color: "text-red-600 bg-red-50" },
        ].map(({ label, value, icon: Icon, href, color }) => (
          <Link key={label} href={href} className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${color}`}>
              <Icon size={20} />
            </div>
            <div className="text-2xl font-extrabold text-[#1a2744]">{value}</div>
            <div className="text-sm text-gray-500">{label}</div>
          </Link>
        ))}
      </div>

      {/* Recent invoices */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-[#1a2744]">Recent Invoices</h2>
          <Link href="/admin/invoices" className="text-sm text-[#e8600a] hover:underline">View all</Link>
        </div>
        <div className="divide-y divide-gray-50">
          {recent.length === 0 && (
            <p className="px-6 py-8 text-center text-gray-400 text-sm">No invoices yet. <Link href="/admin/invoices/new" className="text-[#e8600a] underline">Create one</Link></p>
          )}
          {recent.map((inv: { id?: string; invoice_number?: string; status: string; total: number; balance: number }) => (
            <div key={(inv as { id: string }).id} className="flex items-center justify-between px-6 py-3 hover:bg-gray-50">
              <div className="flex items-center gap-3">
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                  inv.status === "paid" ? "bg-green-100 text-green-700" :
                  inv.status === "overdue" ? "bg-red-100 text-red-700" :
                  inv.status === "sent" ? "bg-blue-100 text-blue-700" :
                  "bg-gray-100 text-gray-600"
                }`}>{inv.status}</span>
              </div>
              <div className="text-sm font-semibold text-[#1a2744]">${inv.total.toFixed(2)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
