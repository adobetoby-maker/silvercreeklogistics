import { requireAdmin } from "@/lib/adminAuth";
import { adminClient } from "@/lib/supabase/admin";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Edit, Send, DollarSign, ExternalLink } from "lucide-react";
import InvoiceView from "@/components/InvoiceView";
import PaymentPanel from "@/components/admin/PaymentPanel";
import QBSyncButton from "@/components/admin/QBSyncButton";
import type { Invoice, Client, InvoiceItem, Payment } from "@/lib/types/db";

type FullInvoice = Invoice & { client: Client; items: InvoiceItem[]; payments: Payment[] };

export default async function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;

  const { data, error } = await adminClient
    .from("invoices")
    .select("*, client:clients(*), items:invoice_items(*), payments(*)")
    .eq("id", id)
    .order("sort_order", { referencedTable: "invoice_items", ascending: true })
    .single();

  if (error || !data) notFound();
  const invoice = data as FullInvoice;
  const publicUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/invoice/${invoice.public_token}`;

  return (
    <div className="p-8">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1a2744]">{invoice.invoice_number}</h1>
          <p className="text-gray-500 text-sm">{invoice.client?.name}</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <a href={publicUrl} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors">
            <ExternalLink size={14} /> Public Link
          </a>
          <Link href={`/admin/invoices/${id}/edit`}
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors">
            <Edit size={14} /> Edit
          </Link>
          <QBSyncButton invoiceId={id} qbInvoiceId={invoice.qb_invoice_id} clientQbId={invoice.client?.qb_customer_id} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <InvoiceView invoice={invoice} />
        </div>
        <div>
          <PaymentPanel invoice={invoice} />
        </div>
      </div>
    </div>
  );
}
