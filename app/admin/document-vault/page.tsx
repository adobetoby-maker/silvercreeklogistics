import { requireAdmin } from "@/lib/adminAuth";
import { adminClient } from "@/lib/supabase/admin";
import DocumentVaultClient from "./DocumentVaultClient";

export const dynamic = "force-dynamic";

export default async function DocumentVaultPage() {
  await requireAdmin();

  const { data } = await adminClient
    .from("document_vault")
    .select("id, file_name, category, ocr_status, ocr_text, tags, created_at, file_url")
    .order("created_at", { ascending: false });

  const docs = (data ?? []) as {
    id: string;
    file_name: string;
    category: string | null;
    ocr_status: string | null;
    ocr_text: string | null;
    tags: string[] | null;
    created_at: string;
    file_url: string | null;
  }[];

  return <DocumentVaultClient docs={docs} />;
}
