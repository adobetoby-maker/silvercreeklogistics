import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminClient } from "@/lib/supabase/admin";

async function isAdmin() {
  const c = await cookies();
  return c.get("scl_admin_session")?.value === process.env.ADMIN_SECRET;
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await isAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await req.json();

  const { data: payment, error } = await adminClient
    .from("payments")
    .insert({ ...body, invoice_id: id })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Recompute amount_paid and balance
  const { data: payments } = await adminClient
    .from("payments")
    .select("amount")
    .eq("invoice_id", id);
  const amount_paid = (payments ?? []).reduce((s, p) => s + p.amount, 0);

  const { data: invoice } = await adminClient
    .from("invoices")
    .select("total")
    .eq("id", id)
    .single();
  const balance = Math.max(0, (invoice?.total ?? 0) - amount_paid);
  const status = balance === 0 ? "paid" : "sent";

  await adminClient
    .from("invoices")
    .update({ amount_paid: +amount_paid.toFixed(2), balance: +balance.toFixed(2), status })
    .eq("id", id);

  return NextResponse.json(payment, { status: 201 });
}
