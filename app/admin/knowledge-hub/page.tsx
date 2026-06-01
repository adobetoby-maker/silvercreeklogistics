import { requireAdmin } from "@/lib/adminAuth";
import { adminClient } from "@/lib/supabase/admin";
import KnowledgeHubClient from "./KnowledgeHubClient";

export const dynamic = "force-dynamic";

type KnowledgeEntry = {
  id: string;
  created_at: string;
  category: string;
  question: string;
  answer: string;
  enabled: boolean;
  sort_order: number;
};

export default async function KnowledgeHubPage() {
  await requireAdmin();

  const { data } = await adminClient
    .from("business_knowledge")
    .select("*")
    .order("sort_order")
    .order("created_at", { ascending: false });

  return <KnowledgeHubClient entries={(data ?? []) as KnowledgeEntry[]} />;
}
