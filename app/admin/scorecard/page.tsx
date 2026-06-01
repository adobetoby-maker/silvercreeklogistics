// PHASE 2 — HR
import { requireAdmin } from "@/lib/adminAuth";
import { adminClient } from "@/lib/supabase/admin";
import ScorecardClient from "./ScorecardClient";

export default async function ScorecardPage() {
  await requireAdmin();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: employees } = await (adminClient as any)
    .from("employees")
    .select("id, first_name, last_name, role")
    .eq("active", true)
    .order("last_name");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: reviews } = await (adminClient as any)
    .from("employee_reviews")
    .select(`
      id, review_period, attendance_score, performance_score,
      safety_score, customer_score, overall_score,
      strengths, improvements, goals, notes, created_at,
      employee:employees!employee_reviews_employee_id_fkey(id, first_name, last_name)
    `)
    .order("created_at", { ascending: false });

  return (
    <ScorecardClient
      employees={employees ?? []}
      reviews={reviews ?? []}
    />
  );
}
