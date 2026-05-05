import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { adminClient } from "@/lib/supabase/admin";
import nodemailer from "nodemailer";
import { dispatchRecipients } from "@/lib/drivers";

export const runtime = "nodejs";

const mailer = nodemailer.createTransport({
  service: "gmail",
  auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD },
});

async function sendSms(to: string, body: string) {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM;
  if (!sid || !token || !from || !to) return;

  await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ To: to, From: from, Body: body }).toString(),
  });
}

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (process.env.CRON_SECRET && auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: requests, error } = await adminClient
    .from("service_requests")
    .select("*")
    .is("notification_sent_at", null)
    .neq("status", "cancelled")
    .order("created_at", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!requests?.length) return NextResponse.json({ sent: 0 });

  // Build a plain-text summary of every pending request for Haiku
  const now = new Date().toLocaleString("en-US", {
    timeZone: "America/Boise",
    dateStyle: "short",
    timeStyle: "short",
  });
  const todayStr = new Date().toLocaleDateString("en-US", {
    timeZone: "America/Boise",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const requestLines = requests
    .map((r, i) => {
      const urgent = r.requested_date === todayStr ? " ⚠️ SAME-DAY" : "";
      return `[${i + 1}]${urgent}
  Customer: ${r.customer_name} | ${r.customer_phone}${r.customer_email ? ` | ${r.customer_email}` : ""}
  Material: ${r.quantity} ${r.unit}s of ${r.material_name}
  Deliver to: ${r.delivery_address}${r.delivery_city ? `, ${r.delivery_city}` : ""}
  Requested date: ${r.requested_date ?? "flexible"}
  Submitted: ${new Date(r.created_at).toLocaleString("en-US", { timeZone: "America/Boise" })}${r.delivery_notes ? `\n  Customer notes: ${r.delivery_notes}` : ""}`;
    })
    .join("\n\n");

  // Haiku generates the dispatch report
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const aiResponse = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 700,
    messages: [
      {
        role: "user",
        content: `You are the dispatch coordinator for Silver Creek Logistics LLC — a small aggregate trucking company in Twin Falls, Idaho. We run a Mack super dump (20–25 tons) and a side dump (25–30 tons).

Current Mountain Time: ${now}
New load requests: ${requests.length}

Write a short, professional dispatch report. Plain text only — no markdown, no asterisks, no bullet symbols. Structure:

Line 1: One-sentence status summary.

Then for each request: name, what they need, where, date, and what to do next (call back, schedule, etc.). Flag same-day requests clearly.

Finish with "Next action:" and one concrete step for right now.

Keep it tight — this gets copied into an SMS.

Requests:
${requestLines}`,
      },
    ],
  });

  const reportText = (aiResponse.content[0] as { type: "text"; text: string }).text.trim();

  // Build HTML email
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://silvercreeklogistics.worker-bee.app";

  const requestCards = requests
    .map(
      (r) => `
      <div style="border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin-bottom:12px">
        <div style="font-weight:700;color:#1a2744;font-size:15px">${r.customer_name}</div>
        <a href="tel:${r.customer_phone.replace(/\D/g, "")}" style="color:#e8600a;font-weight:600;font-size:14px;text-decoration:none">${r.customer_phone}</a>
        <table style="font-size:13px;margin-top:10px;width:100%;border-collapse:collapse">
          <tr><td style="color:#888;padding:3px 10px 3px 0;width:110px;vertical-align:top">Material</td><td style="font-weight:600">${r.quantity} ${r.unit}s of ${r.material_name}</td></tr>
          <tr><td style="color:#888;padding:3px 10px 3px 0;vertical-align:top">Deliver to</td><td>${r.delivery_address}${r.delivery_city ? `, ${r.delivery_city}` : ""}</td></tr>
          ${r.requested_date ? `<tr><td style="color:#888;padding:3px 10px 3px 0">Requested</td><td>${r.requested_date}</td></tr>` : ""}
          ${r.delivery_notes ? `<tr><td style="color:#888;padding:3px 10px 3px 0;vertical-align:top">Notes</td><td>${r.delivery_notes}</td></tr>` : ""}
          <tr><td style="color:#888;padding:3px 10px 3px 0">Submitted</td><td>${new Date(r.created_at).toLocaleString("en-US", { timeZone: "America/Boise" })}</td></tr>
        </table>
        <div style="margin-top:14px">
          <a href="tel:${r.customer_phone.replace(/\D/g, "")}" style="background:#e8600a;color:#fff;padding:9px 18px;border-radius:5px;text-decoration:none;font-weight:700;font-size:13px">Call Now</a>
          <a href="${siteUrl}/admin/dispatch" style="background:#1a2744;color:#fff;padding:9px 18px;border-radius:5px;text-decoration:none;font-weight:700;font-size:13px;margin-left:8px">Dispatch Board</a>
        </div>
      </div>`
    )
    .join("");

  const html = `
    <div style="font-family:sans-serif;max-width:620px;margin:0 auto">
      <div style="background:#1a2744;padding:22px 28px;border-radius:8px 8px 0 0">
        <div style="color:#e8600a;font-size:11px;text-transform:uppercase;letter-spacing:1.5px;font-weight:700">Silver Creek Logistics · Dispatch Report</div>
        <h2 style="color:#fff;margin:6px 0 0;font-size:20px">🚛 ${requests.length} New Load${requests.length > 1 ? "s" : ""} Pending</h2>
        <div style="color:#9ca3af;font-size:12px;margin-top:4px">${now} Mountain Time</div>
      </div>
      <div style="background:#f5f0eb;padding:20px 28px;border-left:1px solid #e5e7eb;border-right:1px solid #e5e7eb">
        <div style="font-size:14px;line-height:1.7;color:#1a2744;white-space:pre-wrap">${reportText}</div>
      </div>
      <div style="background:#fff;padding:20px 28px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px">
        <div style="font-size:11px;color:#9ca3af;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;margin-bottom:14px">Request Details</div>
        ${requestCards}
      </div>
    </div>`;

  // Send email to dispatch recipients
  const subject = `🚛 ${requests.length} new load${requests.length > 1 ? "s" : ""} — Silver Creek Dispatch`;
  for (const recipient of dispatchRecipients) {
    if (!recipient.email) continue;
    await mailer.sendMail({
      from: `"Silver Creek Dispatch" <${process.env.GMAIL_USER}>`,
      to: recipient.email,
      subject,
      html,
    });
  }

  // SMS: Haiku's first paragraph + link (keep under 300 chars)
  const smsSummary = reportText.split("\n\n")[0] ?? reportText;
  const smsText = `Silver Creek Dispatch\n${smsSummary}\n${siteUrl}/admin/dispatch`.slice(0, 300);
  const phones = (process.env.TWILIO_DISPATCH_PHONES ?? "").split(",").filter(Boolean);
  for (const phone of phones) {
    await sendSms(phone.trim(), smsText);
  }

  // Mark all as notified
  await adminClient
    .from("service_requests")
    .update({ notification_sent_at: new Date().toISOString() })
    .in("id", requests.map((r) => r.id));

  return NextResponse.json({ sent: requests.length, report: reportText });
}
