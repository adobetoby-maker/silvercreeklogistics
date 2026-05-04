import { requireAdmin } from "@/lib/adminAuth";
import { adminClient } from "@/lib/supabase/admin";
import Link from "next/link";
import { Plus, Send, Users } from "lucide-react";
import type { Campaign } from "@/lib/types/db";

export default async function MarketingPage() {
  await requireAdmin();
  const { data: campaigns } = await adminClient.from("campaigns").select("*").order("created_at", { ascending: false });
  const { count: clientCount } = await adminClient.from("clients").select("*", { count: "exact", head: true }).eq("status", "active");

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1a2744]">Marketing</h1>
          <p className="text-gray-500 text-sm">{clientCount ?? 0} active clients in your list</p>
        </div>
        <Link href="/admin/marketing/new" className="flex items-center gap-1.5 px-4 py-2 bg-[#e8600a] text-white text-sm font-semibold rounded-lg hover:bg-[#c4500a] transition-colors">
          <Plus size={15} /> New Campaign
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {[
          { label: "Total Campaigns", value: campaigns?.length ?? 0 },
          { label: "Sent", value: campaigns?.filter((c) => c.status === "sent").length ?? 0 },
          { label: "Active Clients", value: clientCount ?? 0 },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white rounded-xl shadow-sm p-5">
            <div className="text-2xl font-extrabold text-[#1a2744]">{value}</div>
            <div className="text-sm text-gray-500">{label}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-left">
              <th className="px-4 py-3 font-semibold text-gray-600">Campaign</th>
              <th className="px-4 py-3 font-semibold text-gray-600 hidden sm:table-cell">Type</th>
              <th className="px-4 py-3 font-semibold text-gray-600">Status</th>
              <th className="px-4 py-3 font-semibold text-gray-600 hidden md:table-cell">Recipients</th>
              <th className="px-4 py-3 font-semibold text-gray-600 hidden lg:table-cell">Sent</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {(campaigns as Campaign[] ?? []).map((c) => (
              <tr key={c.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <Link href={`/admin/marketing/${c.id}`} className="font-semibold text-[#1a2744] hover:text-[#e8600a]">
                    {c.name}
                  </Link>
                  {c.subject && <div className="text-xs text-gray-400">{c.subject}</div>}
                </td>
                <td className="px-4 py-3 text-gray-500 hidden sm:table-cell capitalize">{c.type}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded text-xs font-semibold ${c.status === "sent" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                    {c.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500 hidden md:table-cell">
                  <span className="flex items-center gap-1"><Users size={12} /> {c.recipient_count}</span>
                </td>
                <td className="px-4 py-3 text-gray-500 hidden lg:table-cell">
                  {c.sent_at ? new Date(c.sent_at).toLocaleDateString() : "—"}
                </td>
              </tr>
            ))}
            {!campaigns?.length && (
              <tr><td colSpan={5} className="px-4 py-10 text-center text-gray-400">
                No campaigns yet. <Link href="/admin/marketing/new" className="text-[#e8600a] underline">Create one</Link>
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
