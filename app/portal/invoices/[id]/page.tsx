import { createClient } from "@/lib/supabase/server";
import { adminClient } from "@/lib/supabase/admin";
import { notFound } from "next/navigation";
import InvoiceView from "@/components/InvoiceView";
import type { Invoice, Client, InvoiceItem, Payment } from "@/lib/types/db";

export default async function PortalInvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: client } = await adminClient.from("clients").select("id").eq("portal_user_id", user!.id).single();

  const { data, error } = await adminClient
    .from("invoices")
    .select("*, client:clients(*), items:invoice_items(*), payments(*)")
    .eq("id", id)
    .eq("client_id", client?.id ?? "")
    .order("sort_order", { referencedTable: "invoice_items", ascending: true })
    .single();

  if (error || !data) notFound();

  return (
    <div className="max-w-3xl">
      <InvoiceView invoice={data as Invoice & { client: Client; items: InvoiceItem[]; payments: Payment[] }} />
    </div>
  );
}
