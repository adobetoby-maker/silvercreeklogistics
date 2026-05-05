import { requireAdmin } from "@/lib/adminAuth";
import { adminClient } from "@/lib/supabase/admin";
import DispatchBoard from "@/components/admin/DispatchBoard";
import Link from "next/link";
import { Plus, RefreshCw } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DispatchPage() {
  await requireAdmin();

  const { data: requests } = await adminClient
    .from("service_requests")
    .select("*")
    .neq("status", "cancelled")
    .order("created_at", { ascending: false });

  const { data: recent } = await adminClient
    .from("service_requests")
    .select("*")
    .eq("status", "cancelled")
    .order("created_at", { ascending: false })
    .limit(5);

  const counts = {
    new: requests?.filter((r) => r.status === "new").length ?? 0,
    assigned: requests?.filter((r) => r.status === "assigned").length ?? 0,
    in_transit: requests?.filter((r) => r.status === "in_transit").length ?? 0,
    delivered: requests?.filter((r) => r.status === "delivered").length ?? 0,
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1a2744]">Dispatch Board</h1>
          <p className="text-sm text-gray-500 mt-0.5">Plan and track every load from request to delivery.</p>
        </div>
        <div className="flex gap-3">
          <form action="/api/cron/dispatch" method="get">
            <button type="submit"
              className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">
              <RefreshCw size={14} /> Run Notifications
            </button>
          </form>
          <Link href="/order" target="_blank"
            className="flex items-center gap-1.5 px-4 py-2 bg-[#e8600a] hover:bg-[#c4500a] text-white text-sm font-semibold rounded-lg transition-colors">
            <Plus size={14} /> New Request
          </Link>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { label: "New", value: counts.new, color: "text-orange-600", bg: "bg-orange-50" },
          { label: "Assigned", value: counts.assigned, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "In Transit", value: counts.in_transit, color: "text-yellow-600", bg: "bg-yellow-50" },
          { label: "Delivered", value: counts.delivered, color: "text-green-600", bg: "bg-green-50" },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className={`${bg} rounded-xl p-4 text-center`}>
            <div className={`text-2xl font-extrabold ${color}`}>{value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Board */}
      <DispatchBoard initial={requests ?? []} />

      {/* Cancelled / recent history */}
      {!!recent?.length && (
        <div className="mt-10">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Recently Cancelled</h2>
          <div className="bg-white rounded-xl border border-gray-100 divide-y divide-gray-50 text-sm">
            {recent.map((r) => (
              <div key={r.id} className="px-4 py-3 flex items-center justify-between gap-4">
                <div>
                  <span className="font-semibold text-gray-700">{r.customer_name}</span>
                  <span className="text-gray-400 mx-2">·</span>
                  <span className="text-gray-500">{r.quantity} {r.unit}s of {r.material_name}</span>
                </div>
                <span className="text-xs text-gray-400">{new Date(r.created_at).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
