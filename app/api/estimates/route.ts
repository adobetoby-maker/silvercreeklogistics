import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminClient } from "@/lib/supabase/admin";

async function isAdmin() {
  const c = await cookies();
  return c.get("scl_admin_session")?.value === process.env.ADMIN_SECRET;
}

async function nextEstimateNumber(): Promise<string> {
  const { data } = await adminClient
    .from("estimates")
    .select("estimate_number")
    .order("created_at", { ascending: false })
    .limit(1)
    .single();
  if (!data) return "EST-0001";
  const num = parseInt(data.estimate_number.split("-")[1] ?? "0") + 1;
  return `EST-${String(num).padStart(4, "0")}`;
}

export async function GET() {
  if (!await isAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { data, error } = await adminClient
    .from("estimates")
    .select("*, client:clients(id, name, email)")
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  if (!await isAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { items, client_id, notes } = body as {
    items: { description: string; qty: number; unit: string; unit_price: number }[];
    client_id: string;
    notes: string;
  };

  const estimate_number = await nextEstimateNumber();

  const subtotal = items.reduce((s, i) => s + i.qty * i.unit_price, 0);
  const total = +subtotal.toFixed(2);

  const { data: estimate, error } = await adminClient
    .from("estimates")
    .insert({
      estimate_number,
      client_id,
      notes: notes ?? null,
      status: "draft",
      subtotal: total,
      total,
      issue_date: new Date().toISOString().slice(0, 10),
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (items?.length) {
    const rows = items.map((item, i) => ({
      estimate_id: estimate.id,
      sort_order: i,
      description: item.description,
      quantity: item.qty,
      unit: item.unit,
      unit_price: item.unit_price,
      total: +(item.qty * item.unit_price).toFixed(2),
    }));
    await adminClient.from("estimate_items").insert(rows);
  }

  return NextResponse.json({ estimate }, { status: 201 });
}
