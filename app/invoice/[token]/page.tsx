import { adminClient } from "@/lib/supabase/admin";
import { notFound } from "next/navigation";
import InvoiceView from "@/components/InvoiceView";
import type { Invoice, Client, InvoiceItem, Payment } from "@/lib/types/db";

export default async function PublicInvoicePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  const { data, error } = await adminClient
    .from("invoices")
    .select("*, client:clients(*), items:invoice_items(*), payments(*)")
    .eq("public_token", token)
    .order("sort_order", { referencedTable: "invoice_items", ascending: true })
    .single();

  if (error || !data) notFound();

  return (
    <div className="min-h-screen bg-[#f5f0eb] py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <InvoiceView invoice={data as Invoice & { client: Client; items: InvoiceItem[]; payments: Payment[] }} />
        <p className="text-center text-xs text-gray-400 mt-6">
          Questions? Contact Silver Creek Logistics directly.
        </p>
      </div>
    </div>
  );
}
