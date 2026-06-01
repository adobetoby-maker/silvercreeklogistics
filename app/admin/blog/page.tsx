import { requireAdmin } from "@/lib/adminAuth";
import { adminClient } from "@/lib/supabase/admin";
import BlogClient from "./BlogClient";

export const dynamic = "force-dynamic";

type BlogPost = {
  id: string;
  created_at: string;
  title: string;
  slug: string | null;
  content: string | null;
  excerpt: string | null;
  status: string;
  published_at: string | null;
  tags: string[];
  ai_generated: boolean;
  word_count: number | null;
};

export default async function BlogPage() {
  await requireAdmin();

  const { data } = await adminClient
    .from("blog_posts")
    .select("id,created_at,title,slug,content,excerpt,status,published_at,tags,ai_generated,word_count")
    .order("created_at", { ascending: false });

  return <BlogClient posts={(data ?? []) as BlogPost[]} />;
}
