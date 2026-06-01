import { requireAdmin } from "@/lib/adminAuth";
import { adminClient } from "@/lib/supabase/admin";
import ARReportClient from "./ARReportClient";

export const dynamic = "force-dynamic";

type RawInvoice = {
  id: string;
  invoice_number: string;
  client_id: string;
  balance: number;
  due_date: string | null;
  status: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  client: any;
};

export default async function ARReportPage() {
  await requireAdmin();

  const { data } = await adminClient
    .from("invoices")
    .select("id, invoice_number, client_id, balance, due_date, status, client:clients(name)")
    .gt("balance", 0)
    .order("due_date", { ascending: true });

  const today = new Date();

  const rows = ((data ?? []) as RawInvoice[]).map((inv) => {
    const due = inv.due_date ? new Date(inv.due_date) : null;
    const ageDays = due
      ? Math.floor((today.getTime() - due.getTime()) / 86400000)
      : 0;
    return {
      id: inv.id,
      invoice_number: inv.invoice_number,
      client_id: inv.client_id,
      client_name: inv.client?.name ?? null,
      balance: inv.balance,
      due_date: inv.due_date,
      status: inv.status,
      age_days: ageDays,
    };
  });

  return <ARReportClient rows={rows} />;
}
