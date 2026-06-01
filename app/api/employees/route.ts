// PHASE 2 — HR
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminClient } from "@/lib/supabase/admin";

async function isAdmin() {
  const c = await cookies();
  return c.get("scl_admin_session")?.value === process.env.ADMIN_SECRET;
}

export async function POST(req: NextRequest) {
  if (!await isAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const body: Record<string, any> = await req.json();

  const payload = {
    first_name: body.first_name ?? "",
    last_name: body.last_name ?? "",
    email: body.email || null,
    phone: body.phone || null,
    role: body.role ?? "driver",
    hourly_rate: parseFloat(body.hourly_rate) || 0,
    hire_date: body.hire_date || null,
    cdl: Boolean(body.cdl),
    crew_id: body.crew_id || null,
    active: true,
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (adminClient as any)
    .from("employees")
    .insert(payload)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
