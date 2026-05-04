import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminClient } from "@/lib/supabase/admin";

async function isAdmin() {
  const c = await cookies();
  return c.get("scl_admin_session")?.value === process.env.ADMIN_SECRET;
}

export async function POST(req: NextRequest) {
  if (!await isAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const { data, error } = await adminClient.from("interactions").insert(body).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Update client last_contact_at
  await adminClient.from("clients").update({ last_contact_at: new Date().toISOString() }).eq("id", body.client_id);

  return NextResponse.json(data, { status: 201 });
}
