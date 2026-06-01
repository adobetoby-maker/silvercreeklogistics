import { requireAdmin } from "@/lib/adminAuth";
import { adminClient } from "@/lib/supabase/admin";
import ReceiptInboxClient from "./ReceiptInboxClient";

export const dynamic = "force-dynamic";

export default async function ReceiptInboxPage() {
  await requireAdmin();

  const { data } = await adminClient
    .from("receipt_inbox")
    .select("id, vendor, amount, receipt_date, category, employee, status, file_url, created_at")
    .order("created_at", { ascending: false });

  const receipts = (data ?? []) as {
    id: string;
    vendor: string | null;
    amount: number | null;
    receipt_date: string | null;
    category: string | null;
    employee: string | null;
    status: string;
    file_url: string | null;
    created_at: string;
  }[];

  return <ReceiptInboxClient receipts={receipts} />;
}
