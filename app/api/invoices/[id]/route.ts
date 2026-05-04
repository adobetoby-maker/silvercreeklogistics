import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminClient } from "@/lib/supabase/admin";

async function isAdmin() {
  const c = await cookies();
  return c.get("scl_admin_session")?.value === process.env.ADMIN_SECRET;
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // Allow public access via ?token=
  const token = req.nextUrl.searchParams.get("token");
  if (!token && !await isAdmin()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let query = adminClient
    .from("invoices")
    .select("*, client:clients(*), items:invoice_items(*), payments(*)")
    .eq("id", id);

  if (token) query = query.eq("public_token", token);

  const { data, error } = await query.single();
  if (error) return NextResponse.json({ error: error.message }, { status: 404 });
  return NextResponse.json(data);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await isAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await req.json();
  const { items, ...invoiceData } = body;

  // Recalculate totals if items provided
  if (items) {
    const subtotal = (items as { total: number }[]).reduce((s, i) => s + i.total, 0);
    const tax_amount = +(subtotal * (invoiceData.tax_rate ?? 0)).toFixed(2);
    invoiceData.subtotal = subtotal;
    invoiceData.tax_amount = tax_amount;
    invoiceData.total = +(subtotal + tax_amount).toFixed(2);

    await adminClient.from("invoice_items").delete().eq("invoice_id", id);
    const rows = items.map((item: object, i: number) => ({
      ...item,
      invoice_id: id,
      sort_order: i,
    }));
    await adminClient.from("invoice_items").insert(rows);
  }

  const { data, error } = await adminClient
    .from("invoices")
    .update(invoiceData)
    .eq("id", id)
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await isAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const { error } = await adminClient.from("invoices").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
