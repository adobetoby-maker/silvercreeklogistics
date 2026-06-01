/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { adminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = adminClient as any;

  const { data: invoice } = await db
    .from("invoices")
    .select("*, client:clients(*), items:invoice_items(*)")
    .eq("id", id)
    .single();

  if (!invoice) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { generateInvoicePDF } = await import("@/lib/pdf/generateInvoicePDF");
  const blob = await generateInvoicePDF({
    invoice_number: invoice.invoice_number,
    issue_date: invoice.issue_date,
    due_date: invoice.due_date,
    client: invoice.client ?? { name: "Unknown", state: "ID" },
    items: invoice.items ?? [],
    subtotal: invoice.subtotal,
    tax_rate: invoice.tax_rate,
    tax_amount: invoice.tax_amount,
    total: invoice.total,
    amount_paid: invoice.amount_paid,
    balance: invoice.balance,
    notes: invoice.notes,
  });

  const buffer = Buffer.from(await blob.arrayBuffer());
  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="invoice-${invoice.invoice_number}.pdf"`,
    },
  });
}
