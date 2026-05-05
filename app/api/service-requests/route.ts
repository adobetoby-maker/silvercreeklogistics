import { NextRequest, NextResponse } from "next/server";
import { adminClient } from "@/lib/supabase/admin";
import { materials } from "@/lib/materials";

export async function GET() {
  const { data, error } = await adminClient
    .from("service_requests")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { customer_name, customer_phone, customer_email, material_id, quantity,
    delivery_address, delivery_city, delivery_notes, requested_date } = body;

  if (!customer_name || !customer_phone || !material_id || !quantity || !delivery_address) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const material = materials.find((m) => m.id === material_id);
  if (!material) return NextResponse.json({ error: "Unknown material" }, { status: 400 });

  const { data, error } = await adminClient.from("service_requests").insert({
    customer_name, customer_phone, customer_email: customer_email || null,
    material_id, material_name: material.name,
    quantity: parseFloat(quantity), unit: material.unit,
    delivery_address, delivery_city: delivery_city || null,
    delivery_notes: delivery_notes || null,
    requested_date: requested_date || null,
    status: "new",
  }).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
