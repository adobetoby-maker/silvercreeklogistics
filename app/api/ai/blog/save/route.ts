import { NextRequest, NextResponse } from "next/server";
import { adminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/adminAuth";

function wordCount(text: string | null | undefined): number {
  if (!text) return 0;
  return text.trim().split(/\s+/).length;
}

export async function POST(req: NextRequest) {
  await requireAdmin();

  const body = await req.json() as {
    title: string;
    slug: string;
    content: string;
    excerpt: string;
    tags: string[];
  };

  const { data, error } = await adminClient
    .from("blog_posts")
    .insert({
      title: body.title,
      slug: body.slug,
      content: body.content,
      excerpt: body.excerpt,
      tags: body.tags ?? [],
      status: "draft",
      ai_generated: true,
      word_count: wordCount(body.content),
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data }, { status: 201 });
}
