// PHASE 2 — HR/OPS
import { requireAdmin } from "@/lib/adminAuth";
import { adminClient } from "@/lib/supabase/admin";
import { MapPin, Truck, Clock } from "lucide-react";

export const dynamic = "force-dynamic";

const STATUS_COLOR: Record<string, string> = {
  new: "bg-blue-100 text-blue-700",
  assigned: "bg-yellow-100 text-yellow-700",
  in_transit: "bg-orange-100 text-orange-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

export default async function JobsMapPage() {
  await requireAdmin();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = adminClient as any;

  const today = new Date().toISOString().split("T")[0];
  const weekEnd = new Date();
  weekEnd.setDate(weekEnd.getDate() + 7);

  const { data: runs } = await db
    .from("service_requests")
    .select("*")
    .gte("scheduled_date", today)
    .lte("scheduled_date", weekEnd.toISOString().split("T")[0])
    .neq("status", "cancelled")
    .order("scheduled_date", { ascending: true });

  const jobs = runs ?? [];
  const active = jobs.filter((r: { status: string }) => r.status === "in_transit" || r.status === "assigned");
  const upcoming = jobs.filter((r: { status: string }) => r.status === "new");

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-[#1a2744]">Jobs Map</h1>
        <p className="text-sm text-gray-500 mt-0.5">Active and upcoming runs this week</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Active Runs", value: active.length, color: "#e8600a", icon: <Truck size={20} /> },
          { label: "Upcoming", value: upcoming.length, color: "#3b82f6", icon: <Clock size={20} /> },
          { label: "Total This Week", value: jobs.length, color: "#1a2744", icon: <MapPin size={20} /> },
        ].map(({ label, value, color, icon }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
            <div className="flex items-center gap-2 mb-2">
              <span style={{ color }}>{icon}</span>
              <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">{label}</span>
            </div>
            <div className="text-3xl font-extrabold" style={{ color }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Map embed — Twin Falls, ID area */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-6">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
          <MapPin size={16} className="text-[#e8600a]" />
          <span className="font-semibold text-sm text-[#1a2744]">Magic Valley — Delivery Zone</span>
        </div>
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d182000!2d-114.461!3d42.563!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2sus!4v1700000000000!5m2!1sen!2sus"
          width="100%"
          height="420"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="Magic Valley Delivery Map"
        />
      </div>

      {/* Upcoming runs table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="px-4 py-3 border-b border-gray-100">
          <h2 className="font-bold text-[#1a2744] text-sm">This Week&apos;s Runs ({jobs.length})</h2>
        </div>
        {jobs.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            <Truck size={32} className="mx-auto mb-2 text-gray-300" />
            <div className="font-medium">No runs scheduled this week</div>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {jobs.map((r: { id: string; status: string; material_name: string | null; customer_name: string; delivery_address: string | null; delivery_city: string | null; scheduled_date: string | null; driver_name: string | null; quantity: number | null; unit: string | null }) => (
              <div key={r.id} className="px-4 py-3 flex items-center gap-4">
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${STATUS_COLOR[r.status] ?? "bg-gray-100 text-gray-700"}`}>
                  {r.status.replace("_", " ")}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-[#1a2744] truncate">
                    {r.material_name ?? "Run"} {r.quantity ? `· ${r.quantity} ${r.unit}` : ""}
                  </div>
                  <div className="text-xs text-gray-500 truncate">
                    {r.customer_name} → {r.delivery_address ?? r.delivery_city ?? "TBD"}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  {r.scheduled_date && (
                    <div className="text-xs font-semibold text-[#e8600a]">
                      {new Date(r.scheduled_date + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </div>
                  )}
                  {r.driver_name && (
                    <div className="text-xs text-gray-400">{r.driver_name}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
