// PHASE 2 — HR
import { requireAdmin } from "@/lib/adminAuth";
import { adminClient } from "@/lib/supabase/admin";
import TimeHubClient from "./TimeHubClient";

export default async function TimeHubPage() {
  await requireAdmin();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: timeEntries } = await (adminClient as any)
    .from("time_entries")
    .select(`
      id, clock_in, clock_out, regular_hours, overtime_hours, status, job_reference, notes,
      employee:employees(id, first_name, last_name)
    `)
    .order("clock_in", { ascending: false })
    .limit(100);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: timeOffRequests } = await (adminClient as any)
    .from("time_off_requests")
    .select(`
      id, type, start_date, end_date, hours_requested, reason, status, reviewer_notes,
      employee:employees(id, first_name, last_name)
    `)
    .order("created_at", { ascending: false })
    .limit(100);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: downtimeForms } = await (adminClient as any)
    .from("downtime_forms")
    .select(`
      id, truck_id, reason, start_time, end_time, hours, notes,
      employee:employees(id, first_name, last_name)
    `)
    .order("start_time", { ascending: false })
    .limit(100);

  return (
    <TimeHubClient
      timeEntries={timeEntries ?? []}
      timeOffRequests={timeOffRequests ?? []}
      downtimeForms={downtimeForms ?? []}
    />
  );
}
