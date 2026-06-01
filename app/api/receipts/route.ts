import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminClient } from "@/lib/supabase/admin";

async function isAdmin() {
  const c = await cookies();
  return c.get("scl_admin_session")?.value === process.env.ADMIN_SECRET;
}

export async function POST(req: NextRequest) {
  if (!await isAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const form = await req.formData();
  const file = form.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const fileName = `receipts/${Date.now()}-${file.name}`;

  const { error: uploadError } = await adminClient.storage
    .from("documents")
    .upload(fileName, buffer, { contentType: file.type, upsert: false });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const { data: urlData } = adminClient.storage
    .from("documents")
    .getPublicUrl(fileName);

  const fileUrl = urlData?.publicUrl ?? null;

  const { data: receipt, error } = await adminClient
    .from("receipt_inbox")
    .insert({
      file_url: fileUrl,
      status: "pending",
      vendor: null,
      amount: null,
      receipt_date: null,
      category: null,
      employee: null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ receipt }, { status: 201 });
}
