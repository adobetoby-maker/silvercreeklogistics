import { requireAdmin } from "@/lib/adminAuth";
import { adminClient } from "@/lib/supabase/admin";
import type { CommercialProject, ProjectPhase, ProjectDailyLog } from "@/lib/types/db";
import { notFound } from "next/navigation";
import ProjectDetailClient from "./ProjectDetailClient";

export const dynamic = "force-dynamic";

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: project } = await (adminClient as any)
    .from("commercial_projects")
    .select(`
      *,
      client:client_id(id, name),
      phases:project_phases(*)
    `)
    .eq("id", id)
    .single();

  if (!project) notFound();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: logs } = await (adminClient as any)
    .from("project_daily_logs")
    .select(`
      *,
      employee:employee_id(id, first_name, last_name)
    `)
    .eq("project_id", id)
    .order("log_date", { ascending: false });

  return (
    <ProjectDetailClient
      project={project as CommercialProject}
      phases={(project.phases ?? []) as ProjectPhase[]}
      logs={(logs ?? []) as ProjectDailyLog[]}
    />
  );
}
