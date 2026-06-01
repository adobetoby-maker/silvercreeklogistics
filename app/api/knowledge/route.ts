import { NextRequest, NextResponse } from "next/server";
import { adminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/adminAuth";

export async function GET() {
  await requireAdmin();
  const { data, error } = await adminClient
    .from("business_knowledge")
    .select("*")
    .order("sort_order")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  await requireAdmin();
  const body = await req.json() as {
    category: string;
    question: string;
    answer: string;
    sort_order?: number;
  };

  const { data, error } = await adminClient
    .from("business_knowledge")
    .insert({
      category: body.category,
      question: body.question,
      answer: body.answer,
      sort_order: body.sort_order ?? 0,
      enabled: true,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  await requireAdmin();
  const body = await req.json() as { id: string; enabled: boolean };

  const { data, error } = await adminClient
    .from("business_knowledge")
    .update({ enabled: body.enabled })
    .eq("id", body.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(req: NextRequest) {
  await requireAdmin();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const { error } = await adminClient
    .from("business_knowledge")
    .delete()
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
