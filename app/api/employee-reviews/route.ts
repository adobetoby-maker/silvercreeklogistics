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
    review_period: body.review_period,
    reviewer_id: body.reviewer_id ?? null,
    attendance_score: body.attendance_score ?? null,
    performance_score: body.performance_score ?? null,
    safety_score: body.safety_score ?? null,
    customer_score: body.customer_score ?? null,
    overall_score: body.overall_score ?? null,
    strengths: body.strengths ?? null,
    improvements: body.improvements ?? null,
    goals: body.goals ?? null,
    notes: body.notes ?? null,
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (adminClient as any)
    .from("employee_reviews")
    .insert(payload)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
