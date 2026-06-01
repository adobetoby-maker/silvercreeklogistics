// PHASE 2 — HR
import { requireAdmin } from "@/lib/adminAuth";
import { adminClient } from "@/lib/supabase/admin";
import EmployeesClient from "./EmployeesClient";

export default async function EmployeesPage() {
  await requireAdmin();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: employees } = await (adminClient as any)
    .from("employees")
    .select(`
      id, first_name, last_name, email, phone,
      role, hourly_rate, cdl, hire_date, active,
      crew:crews(id, name)
    `)
    .order("last_name");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: crews } = await (adminClient as any)
    .from("crews")
    .select("id, name")
    .eq("active", true)
    .order("name");

  return (
    <EmployeesClient
      employees={employees ?? []}
      crews={crews ?? []}
    />
  );
}
