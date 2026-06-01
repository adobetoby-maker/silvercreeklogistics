import { requireAdmin } from "@/lib/adminAuth";
import { adminClient } from "@/lib/supabase/admin";
import EstimatesClient from "./EstimatesClient";

export const dynamic = "force-dynamic";

type RawEstimate = {
  id: string;
  estimate_number: string;
  status: string;
  total: number;
  issue_date: string | null;
  expiry_date: string | null;
  notes: string | null;
  client_id: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  client: any;
};

export default async function EstimatesPage() {
  await requireAdmin();

  const [estimatesRes, clientsRes] = await Promise.all([
    adminClient
      .from("estimates")
      .select("id, estimate_number, status, total, issue_date, expiry_date, notes, client_id, client:clients(name)")
      .order("created_at", { ascending: false }),
    adminClient
      .from("clients")
      .select("id, name")
      .eq("status", "active")
      .order("name"),
  ]);

  const estimates = ((estimatesRes.data ?? []) as RawEstimate[]).map((e) => ({
    ...e,
    client_name: e.client?.name ?? null,
  }));

  const clients = (clientsRes.data ?? []) as { id: string; name: string }[];

  return <EstimatesClient estimates={estimates} clients={clients} />;
}
