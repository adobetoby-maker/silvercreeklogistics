import { requireAdmin } from "@/lib/adminAuth";
import { adminClient } from "@/lib/supabase/admin";
import { cookies } from "next/headers";
import type { AdminUser } from "@/lib/types/db";
import SettingsClient from "./SettingsClient";
import { shopInfo } from "@/lib/shopInfo";

export const dynamic = "force-dynamic";

export default async function SettingsPage({ searchParams }: { searchParams: Promise<{ qb?: string; tab?: string }> }) {
  await requireAdmin();
  const { qb, tab } = await searchParams;
  const cookieStore = await cookies();
  const qbConnected = !!cookieStore.get("qb_realm_id")?.value || qb === "connected";
  const resendConfigured = !!process.env.RESEND_API_KEY;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: adminUsers } = await (adminClient as any)
    .from("admin_users")
    .select("id, created_at, email, name, role, active, last_login_at")
    .order("created_at");

  return (
    <SettingsClient
      shopInfo={{
        name: shopInfo.name,
        phone: shopInfo.phone,
        email: shopInfo.email,
        address: shopInfo.address,
        city: shopInfo.city,
        state: shopInfo.state,
      }}
      qbConnected={qbConnected}
      resendConfigured={resendConfigured}
      adminUsers={(adminUsers ?? []) as AdminUser[]}
      initialTab={tab ?? "business"}
    />
  );
}
