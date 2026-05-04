import { requireAdmin } from "@/lib/adminAuth";
import { adminClient } from "@/lib/supabase/admin";
import Link from "next/link";
import { Plus, Phone, Mail, CheckCircle } from "lucide-react";
import type { Client } from "@/lib/types/db";

export default async function ClientsPage() {
  await requireAdmin();
  const { data: clients } = await adminClient
    .from("clients")
    .select("*")
    .order("name");

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-extrabold text-[#1a2744]">Clients</h1>
        <Link href="/admin/clients/new" className="flex items-center gap-1.5 px-4 py-2 bg-[#e8600a] text-white text-sm font-semibold rounded-lg hover:bg-[#c4500a] transition-colors">
          <Plus size={15} /> New Client
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-left">
              <th className="px-4 py-3 font-semibold text-gray-600">Name</th>
              <th className="px-4 py-3 font-semibold text-gray-600 hidden sm:table-cell">Phone</th>
              <th className="px-4 py-3 font-semibold text-gray-600 hidden md:table-cell">Email</th>
              <th className="px-4 py-3 font-semibold text-gray-600 hidden lg:table-cell">City</th>
              <th className="px-4 py-3 font-semibold text-gray-600">Status</th>
              <th className="px-4 py-3 font-semibold text-gray-600">Portal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {(clients as Client[] ?? []).map((c) => (
              <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <Link href={`/admin/clients/${c.id}`} className="font-semibold text-[#1a2744] hover:text-[#e8600a]">
                    {c.name}
                  </Link>
                  {c.company && <div className="text-xs text-gray-400">{c.company}</div>}
                </td>
                <td className="px-4 py-3 hidden sm:table-cell">
                  {c.phone && (
                    <a href={`tel:${c.phone}`} className="flex items-center gap-1 text-gray-600 hover:text-[#e8600a]">
                      <Phone size={12} /> {c.phone}
                    </a>
                  )}
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                  {c.email && (
                    <a href={`mailto:${c.email}`} className="flex items-center gap-1 text-gray-600 hover:text-[#e8600a]">
                      <Mail size={12} /> {c.email}
                    </a>
                  )}
                </td>
                <td className="px-4 py-3 text-gray-500 hidden lg:table-cell">{c.city}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                    c.status === "active" ? "bg-green-100 text-green-700" :
                    c.status === "lead" ? "bg-yellow-100 text-yellow-700" :
                    "bg-gray-100 text-gray-500"
                  }`}>{c.status}</span>
                </td>
                <td className="px-4 py-3">
                  {c.portal_user_id
                    ? <CheckCircle size={15} className="text-green-500" />
                    : <span className="text-xs text-gray-400">—</span>}
                </td>
              </tr>
            ))}
            {!clients?.length && (
              <tr><td colSpan={6} className="px-4 py-10 text-center text-gray-400">
                No clients yet. <Link href="/admin/clients/new" className="text-[#e8600a] underline">Add one</Link>
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
