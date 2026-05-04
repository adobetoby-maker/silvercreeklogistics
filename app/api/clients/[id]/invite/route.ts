import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminClient } from "@/lib/supabase/admin";

async function isAdmin() {
  const c = await cookies();
  return c.get("scl_admin_session")?.value === process.env.ADMIN_SECRET;
}

export async function POST(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await isAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const { data: client, error: clientError } = await adminClient
    .from("clients")
    .select("email, name")
    .eq("id", id)
    .single();

  if (clientError || !client?.email) {
    return NextResponse.json({ error: "Client not found or has no email" }, { status: 400 });
  }

  // Send magic-link invitation via Supabase Admin Auth
  const { data, error } = await adminClient.auth.admin.inviteUserByEmail(client.email, {
    data: { client_id: id },
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/portal/dashboard`,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Link the auth user to the client record
  if (data.user) {
    await adminClient
      .from("clients")
      .update({ portal_user_id: data.user.id })
      .eq("id", id);
  }

  return NextResponse.json({ success: true });
}
