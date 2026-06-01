import { requireAdmin } from "@/lib/adminAuth";
import { adminClient } from "@/lib/supabase/admin";
import FleetClient from "./FleetClient";
import { shopInfo } from "@/lib/shopInfo";

export const dynamic = "force-dynamic";

export default async function FleetPage() {
  await requireAdmin();

  const today = new Date();
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay() + 1); // Monday

  const weekDates = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return d.toISOString().split("T")[0];
  });

  const { data: requests } = await adminClient
    .from("service_requests")
    .select("*")
    .in("scheduled_date", weekDates)
    .neq("status", "cancelled")
    .order("scheduled_date", { ascending: true });

  return (
    <FleetClient
      trucks={shopInfo.trucks}
      weekDates={weekDates}
      requests={requests ?? []}
    />
  );
}
