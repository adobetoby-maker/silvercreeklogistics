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
    employee_id: body.employee_id,
    clock_in: body.clock_in,
    clock_out: body.clock_out ?? null,
    break_minutes: body.break_minutes ?? 0,
    regular_hours: body.regular_hours ?? null,
    overtime_hours: body.overtime_hours ?? 0,
    job_reference: body.job_reference ?? null,
    notes: body.notes ?? null,
    status: "active",
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (adminClient as any)
    .from("time_entries")
    .insert(payload)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  if (!await isAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const body: Record<string, any> = await req.json();
  const { id, status, table = "time_entries" } = body;

  if (!id || !status) {
    return NextResponse.json({ error: "id and status are required" }, { status: 400 });
  }

  const allowedTables = ["time_entries", "time_off_requests"];
  if (!allowedTables.includes(table)) {
    return NextResponse.json({ error: "Invalid table" }, { status: 400 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (adminClient as any)
    .from(table)
    .update({ status, [table === "time_off_requests" ? "reviewed_at" : "approved_at"]: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
