import { NextRequest, NextResponse } from "next/server";
import { adminClient } from "@/lib/supabase/admin";
import { cookies } from "next/headers";

async function isAdmin() {
  const c = await cookies();
  return c.get("scl_admin_session")?.value === process.env.ADMIN_SECRET;
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await isAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await req.json();

  const updates: Record<string, unknown> = {};
  const allowed = ["status", "driver_name", "driver_email", "driver_phone",
    "scheduled_date", "scheduled_time", "internal_notes"];
  for (const key of allowed) {
    if (key in body) updates[key] = body[key];
  }

  if (body.status === "in_transit" && !updates.dispatched_at) {
    updates.dispatched_at = new Date().toISOString();
  }
  if (body.status === "delivered" && !updates.delivered_at) {
    updates.delivered_at = new Date().toISOString();
  }

  const { data, error } = await adminClient
    .from("service_requests")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await isAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const { error } = await adminClient.from("service_requests").update({ status: "cancelled" }).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
