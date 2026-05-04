import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminClient } from "@/lib/supabase/admin";

async function isAdmin() {
  const c = await cookies();
  return c.get("scl_admin_session")?.value === process.env.ADMIN_SECRET;
}

async function nextInvoiceNumber(): Promise<string> {
  const { data } = await adminClient
    .from("invoices")
    .select("invoice_number")
    .order("created_at", { ascending: false })
    .limit(1)
    .single();
  if (!data) return "SCL-0001";
  const num = parseInt(data.invoice_number.split("-")[1] ?? "0") + 1;
  return `SCL-${String(num).padStart(4, "0")}`;
}

export async function GET() {
  if (!await isAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { data, error } = await adminClient
    .from("invoices")
    .select("*, client:clients(id, name, email, phone)")
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  if (!await isAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const { items, ...invoiceData } = body;

  const invoice_number = await nextInvoiceNumber();

  // Calculate totals
  const subtotal = (items as { total: number }[]).reduce((s, i) => s + i.total, 0);
  const tax_rate = invoiceData.tax_rate ?? 0;
  const tax_amount = +(subtotal * tax_rate).toFixed(2);
  const total = +(subtotal + tax_amount).toFixed(2);

  const { data: invoice, error } = await adminClient
    .from("invoices")
    .insert({ ...invoiceData, invoice_number, subtotal, tax_amount, total, balance: total })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (items?.length) {
    const rows = items.map((item: object, i: number) => ({
      ...item,
      invoice_id: invoice.id,
      sort_order: i,
    }));
    await adminClient.from("invoice_items").insert(rows);
  }

  return NextResponse.json(invoice, { status: 201 });
}
