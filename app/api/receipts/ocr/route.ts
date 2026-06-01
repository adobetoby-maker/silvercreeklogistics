import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminClient } from "@/lib/supabase/admin";
import Anthropic from "@anthropic-ai/sdk";

async function isAdmin() {
  const c = await cookies();
  return c.get("scl_admin_session")?.value === process.env.ADMIN_SECRET;
}

export async function POST(req: NextRequest) {
  if (!await isAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { receipt_id } = await req.json() as { receipt_id: string };
  if (!receipt_id) return NextResponse.json({ error: "receipt_id required" }, { status: 400 });

  // Fetch the receipt record
  const { data: receiptRow, error: fetchError } = await adminClient
    .from("receipt_inbox")
    .select("id, file_url")
    .eq("id", receipt_id)
    .single();

  if (fetchError || !receiptRow) {
    return NextResponse.json({ error: "Receipt not found" }, { status: 404 });
  }

  const fileUrl: string | null = receiptRow.file_url;
  if (!fileUrl) {
    return NextResponse.json({ error: "No file URL on this receipt" }, { status: 400 });
  }

  // Fetch the image for base64 encoding
  let imageBase64: string;
  let mediaType: "image/jpeg" | "image/png" | "image/gif" | "image/webp";
  try {
    const imgRes = await fetch(fileUrl);
    if (!imgRes.ok) throw new Error("Failed to fetch image");
    const contentType = imgRes.headers.get("content-type") ?? "image/jpeg";
    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    mediaType = (validTypes.includes(contentType) ? contentType : "image/jpeg") as typeof mediaType;
    const buffer = Buffer.from(await imgRes.arrayBuffer());
    imageBase64 = buffer.toString("base64");
  } catch {
    return NextResponse.json({ error: "Could not fetch receipt image" }, { status: 500 });
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

  const message = await client.messages.create({
    model: "claude-haiku-4-5",
    max_tokens: 512,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: { type: "base64", media_type: mediaType, data: imageBase64 },
          },
          {
            type: "text",
            text: `Extract the following fields from this receipt image and return ONLY valid JSON with no extra text:
{
  "vendor": "store or merchant name, or null",
  "amount": total amount as a number (no currency symbol), or null,
  "date": "YYYY-MM-DD format date of purchase, or null",
  "category": "one of: fuel, supplies, maintenance, meals, lodging, equipment, other — or null"
}`,
          },
        ],
      },
    ],
  });

  let extracted: {
    vendor: string | null;
    amount: number | null;
    date: string | null;
    category: string | null;
  } = { vendor: null, amount: null, date: null, category: null };

  try {
    const text = message.content[0].type === "text" ? message.content[0].text : "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      extracted = JSON.parse(jsonMatch[0]);
    }
  } catch {
    // Leave defaults
  }

  // Update the receipt row
  const { data: updated, error: updateError } = await adminClient
    .from("receipt_inbox")
    .update({
      vendor: extracted.vendor,
      amount: extracted.amount,
      receipt_date: extracted.date,
      category: extracted.category,
      status: "review",
    })
    .eq("id", receipt_id)
    .select()
    .single();

  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 });

  return NextResponse.json({ receipt: updated });
}
