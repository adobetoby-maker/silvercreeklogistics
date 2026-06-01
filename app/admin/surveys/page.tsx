import { requireAdmin } from "@/lib/adminAuth";
import { adminClient } from "@/lib/supabase/admin";
import type { SurveyResult, Client } from "@/lib/types/db";
import SurveysClient from "./SurveysClient";

export const dynamic = "force-dynamic";

export default async function SurveysPage() {
  await requireAdmin();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: surveys } = await (adminClient as any)
    .from("survey_results")
    .select(`
      *,
      client:client_id(id, name, email)
    `)
    .order("responded_at", { ascending: false });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: clients } = await (adminClient as any)
    .from("clients")
    .select("id, name, email")
    .eq("status", "active")
    .order("name");

  return (
    <SurveysClient
      surveys={(surveys ?? []) as SurveyResult[]}
      clients={(clients ?? []) as Pick<Client, "id" | "name" | "email">[]}
    />
  );
}
