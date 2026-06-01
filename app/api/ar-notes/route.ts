import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminClient } from "@/lib/supabase/admin";

async function isAdmin() {
  const c = await cookies();
  return c.get("scl_admin_session")?.value === process.env.ADMIN_SECRET;
}

export async function POST(req: NextRequest) {
  if (!await isAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { invoice_id, note } = await req.json() as { invoice_id: string; note: string };
  if (!invoice_id || !note?.trim()) {
    return NextResponse.json({ error: "invoice_id and note are required" }, { status: 400 });
  }

  const { data, error } = await adminClient
    .from("ar_collection_notes")
    .insert({
      invoice_id,
      note: note.trim(),
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ note: data }, { status: 201 });
}
