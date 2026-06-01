import { requireAdmin } from "@/lib/adminAuth";
import { adminClient } from "@/lib/supabase/admin";
import type { Referral, Client } from "@/lib/types/db";
import ReferralsClient from "./ReferralsClient";

export const dynamic = "force-dynamic";

export default async function ReferralsPage() {
  await requireAdmin();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: referrals } = await (adminClient as any)
    .from("referrals")
    .select(`
      *,
      referrer:referrer_client_id(id, name, phone)
    `)
    .order("created_at", { ascending: false });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: clients } = await (adminClient as any)
    .from("clients")
    .select("id, name")
    .eq("status", "active")
    .order("name");

  return (
    <ReferralsClient
      referrals={(referrals ?? []) as Referral[]}
      clients={(clients ?? []) as Pick<Client, "id" | "name">[]}
    />
  );
}
