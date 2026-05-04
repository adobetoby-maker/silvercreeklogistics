import { requireAdmin } from "@/lib/adminAuth";
import { adminClient } from "@/lib/supabase/admin";
import CampaignForm from "@/components/admin/CampaignForm";

export default async function NewCampaignPage() {
  await requireAdmin();
  const { data: tags } = await adminClient.from("clients").select("tags");
  const allTags = [...new Set((tags ?? []).flatMap((r: { tags: string[] }) => r.tags))].filter(Boolean);
  return (
    <div className="p-8 max-w-3xl">
      <h1 className="text-2xl font-extrabold text-[#1a2744] mb-6">New Campaign</h1>
      <div className="bg-white rounded-xl shadow-sm p-6">
        <CampaignForm availableTags={allTags as string[]} />
      </div>
    </div>
  );
}
