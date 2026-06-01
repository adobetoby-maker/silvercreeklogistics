import { requireAdmin } from "@/lib/adminAuth";
import { adminClient } from "@/lib/supabase/admin";
import type { GalleryPhoto } from "@/lib/types/db";
import GalleryClient from "./GalleryClient";

export const dynamic = "force-dynamic";

export default async function GalleryPage() {
  await requireAdmin();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: photos } = await (adminClient as any)
    .from("gallery_photos")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  return <GalleryClient photos={(photos ?? []) as GalleryPhoto[]} />;
}
