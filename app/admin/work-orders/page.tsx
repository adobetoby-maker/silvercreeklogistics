import { requireAdmin } from "@/lib/adminAuth";
import { adminClient } from "@/lib/supabase/admin";
import WorkOrdersClient from "./WorkOrdersClient";

export const dynamic = "force-dynamic";

export default async function WorkOrdersPage() {
  await requireAdmin();

  const { data: requests } = await adminClient
    .from("service_requests")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  return <WorkOrdersClient orders={requests ?? []} />;
}
