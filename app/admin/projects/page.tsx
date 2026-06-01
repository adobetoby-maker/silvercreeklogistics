import { requireAdmin } from "@/lib/adminAuth";
import { adminClient } from "@/lib/supabase/admin";
import type { CommercialProject, Client } from "@/lib/types/db";
import ProjectsClient from "./ProjectsClient";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  await requireAdmin();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: projects } = await (adminClient as any)
    .from("commercial_projects")
    .select(`
      *,
      client:client_id(id, name),
      phases:project_phases(id, status)
    `)
    .neq("status", "cancelled")
    .order("created_at", { ascending: false });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: clients } = await (adminClient as any)
    .from("clients")
    .select("id, name")
    .eq("status", "active")
    .order("name");

  return (
    <ProjectsClient
      projects={(projects ?? []) as CommercialProject[]}
      clients={(clients ?? []) as Pick<Client, "id" | "name">[]}
    />
  );
}
