import { requireAdmin } from "@/lib/adminAuth";
import { adminClient } from "@/lib/supabase/admin";
import Link from "next/link";
import { MessageSquare, Phone, Mail, Truck, FileText, StickyNote, Users } from "lucide-react";
import type { Interaction, Client } from "@/lib/types/db";
import AddInteractionForm from "@/components/admin/AddInteractionForm";

type InteractionRow = Interaction & { client: Client };

const TYPE_ICON: Record<string, React.ElementType> = {
  call: Phone, email: Mail, delivery: Truck, quote: FileText, note: StickyNote, meeting: Users,
};

export default async function CRMPage() {
  await requireAdmin();

  const [{ data: interactions }, { data: clients }] = await Promise.all([
    adminClient.from("interactions").select("*, client:clients(id, name)").order("created_at", { ascending: false }).limit(50),
    adminClient.from("clients").select("id, name").order("name"),
  ]);

  const upcoming = (interactions as InteractionRow[] ?? []).filter((i) => i.next_followup);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-extrabold text-[#1a2744]">CRM — Activity Log</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Add interaction */}
        <div className="bg-white rounded-xl shadow-sm p-5">
          <h2 className="font-bold text-[#1a2744] mb-4 flex items-center gap-2"><MessageSquare size={16} /> Log Interaction</h2>
          <AddInteractionForm clients={(clients ?? []) as Pick<Client, "id" | "name">[]} />
        </div>

        {/* Feed */}
        <div className="lg:col-span-2 space-y-3">
          {upcoming.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <h3 className="font-bold text-yellow-800 text-sm mb-2">Follow-ups due</h3>
              <div className="space-y-1.5">
                {upcoming.map((i) => (
                  <div key={i.id} className="flex items-center justify-between text-sm">
                    <span className="text-yellow-900">
                      <Link href={`/admin/clients/${i.client_id}`} className="font-semibold hover:underline">{i.client?.name}</Link>
                      {i.subject ? ` — ${i.subject}` : ""}
                    </span>
                    <span className="text-yellow-700 font-mono text-xs">{i.next_followup}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl shadow-sm divide-y divide-gray-100">
            {(interactions as InteractionRow[] ?? []).map((ia) => {
              const Icon = TYPE_ICON[ia.type] ?? StickyNote;
              return (
                <div key={ia.id} className="flex items-start gap-3 px-5 py-4">
                  <div className="w-8 h-8 bg-[#f5f0eb] rounded-full flex items-center justify-center shrink-0 mt-0.5">
                    <Icon size={14} className="text-[#e8600a]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <Link href={`/admin/clients/${ia.client_id}`} className="font-semibold text-sm text-[#1a2744] hover:text-[#e8600a]">
                        {ia.client?.name}
                      </Link>
                      <span className="text-xs text-gray-400 shrink-0">{new Date(ia.created_at).toLocaleDateString()}</span>
                    </div>
                    {ia.subject && <div className="text-sm text-gray-700">{ia.subject}</div>}
                    {ia.notes && <div className="text-xs text-gray-500 mt-0.5">{ia.notes}</div>}
                    {ia.next_followup && (
                      <div className="text-xs text-yellow-600 mt-1">Follow up: {ia.next_followup}</div>
                    )}
                  </div>
                </div>
              );
            })}
            {!interactions?.length && (
              <p className="px-5 py-8 text-center text-gray-400 text-sm">No interactions yet. Log a call, delivery, or note above.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
