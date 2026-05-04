import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminClient } from "@/lib/supabase/admin";
import nodemailer from "nodemailer";

async function isAdmin() {
  const c = await cookies();
  return c.get("scl_admin_session")?.value === process.env.ADMIN_SECRET;
}

export async function POST(req: NextRequest) {
  if (!await isAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { send, ...body } = await req.json();

  // Find recipients
  let query = adminClient.from("clients").select("id, name, email").eq("status", "active").not("email", "is", null);
  if (body.target_tags?.length > 0) {
    query = query.overlaps("tags", body.target_tags);
  }
  const { data: recipients } = await query;
  const recipientCount = recipients?.length ?? 0;

  const { data: campaign, error } = await adminClient
    .from("campaigns")
    .insert({ ...body, recipient_count: recipientCount, status: send ? "sent" : "draft", sent_at: send ? new Date().toISOString() : null })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Send emails if requested
  if (send && recipients?.length) {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD },
    });

    await Promise.allSettled(
      recipients.map((r) => {
        const personalBody = (body.body ?? "").replace(/\{name\}/g, r.name);
        return transporter.sendMail({
          from: `"Silver Creek Logistics" <${process.env.GMAIL_USER}>`,
          to: r.email!,
          subject: body.subject ?? body.name,
          text: personalBody,
          html: `<div style="font-family:sans-serif;max-width:600px;">${personalBody.replace(/\n/g, "<br>")}</div>`,
        });
      })
    );
  }

  return NextResponse.json(campaign, { status: 201 });
}
