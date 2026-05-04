import { requireAdmin } from "@/lib/adminAuth";
import { adminClient } from "@/lib/supabase/admin";
import { notFound } from "next/navigation";
import InvoiceForm from "@/components/admin/InvoiceForm";
import type { Client, Invoice, InvoiceItem } from "@/lib/types/db";

export default async function EditInvoicePage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;

  const [{ data: invoice, error }, { data: clients }] = await Promise.all([
    adminClient.from("invoices").select("*, items:invoice_items(*)").eq("id", id).single(),
    adminClient.from("clients").select("*").order("name"),
  ]);

  if (error || !invoice) notFound();

  return (
    <div className="p-8 max-w-5xl">
      <h1 className="text-2xl font-extrabold text-[#1a2744] mb-6">Edit {(invoice as Invoice).invoice_number}</h1>
      <div className="bg-white rounded-xl shadow-sm p-6">
        <InvoiceForm
          invoice={invoice as Invoice & { items: InvoiceItem[] }}
          clients={(clients ?? []) as Client[]}
        />
      </div>
    </div>
  );
}
