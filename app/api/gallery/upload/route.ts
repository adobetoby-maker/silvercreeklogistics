import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminClient } from "@/lib/supabase/admin";

async function isAdmin() {
  const c = await cookies();
  return c.get("scl_admin_session")?.value === process.env.ADMIN_SECRET;
}

export async function POST(req: NextRequest) {
  if (!await isAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  // Try Supabase Storage upload
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const ext = file.name.split(".").pop() ?? "jpg";
  const fileName = `gallery/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = adminClient as any;

  const { error: storageError } = await supabase.storage
    .from("photos")
    .upload(fileName, buffer, { contentType: file.type, upsert: false });

  let imageUrl: string;
  if (storageError) {
    // Fall back: store as public path reference
    imageUrl = `/images/${fileName.split("/").pop()}`;
  } else {
    const { data: urlData } = supabase.storage.from("photos").getPublicUrl(fileName);
    imageUrl = urlData.publicUrl;
  }

  const { data: photo, error: dbError } = await supabase
    .from("gallery_photos")
    .insert({
      title: file.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " "),
      image_url: imageUrl,
      category: "other",
      featured: false,
      sort_order: 0,
    })
    .select()
    .single();

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 });

  return NextResponse.json({ photo }, { status: 201 });
}
