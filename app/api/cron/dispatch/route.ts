import { NextRequest, NextResponse } from "next/server";
import { adminClient } from "@/lib/supabase/admin";
import nodemailer from "nodemailer";
import { dispatchRecipients } from "@/lib/drivers";

const mailer = nodemailer.createTransport({
  service: "gmail",
  auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD },
});

async function sendSms(to: string, body: string) {
  // Twilio SMS — set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM in Vercel env vars
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

function formatRequest(r: Record<string, string>) {
  return `
    <table style="font-family:sans-serif;font-size:14px;border-collapse:collapse;width:100%;max-width:600px">
      <tr><td style="padding:8px 0;color:#888;width:140px">Customer</td><td style="padding:8px 0;font-weight:600">${r.customer_name}</td></tr>
      <tr><td style="padding:8px 0;color:#888">Phone</td><td style="padding:8px 0"><a href="tel:${r.customer_phone.replace(/\D/g, "")}">${r.customer_phone}</a></td></tr>
      ${r.customer_email ? `<tr><td style="padding:8px 0;color:#888">Email</td><td style="padding:8px 0">${r.customer_email}</td></tr>` : ""}
      <tr><td style="padding:8px 0;color:#888">Material</td><td style="padding:8px 0;font-weight:600">${r.material_name}</td></tr>
      <tr><td style="padding:8px 0;color:#888">Quantity</td><td style="padding:8px 0">${r.quantity} ${r.unit}s</td></tr>
      <tr><td style="padding:8px 0;color:#888">Address</td><td style="padding:8px 0">${r.delivery_address}${r.delivery_city ? `, ${r.delivery_city}` : ""}</td></tr>
      ${r.delivery_notes ? `<tr><td style="padding:8px 0;color:#888">Notes</td><td style="padding:8px 0">${r.delivery_notes}</td></tr>` : ""}
      ${r.requested_date ? `<tr><td style="padding:8px 0;color:#888">Requested Date</td><td style="padding:8px 0">${r.requested_date}</td></tr>` : ""}
      <tr><td style="padding:8px 0;color:#888">Submitted</td><td style="padding:8px 0">${new Date(r.created_at).toLocaleString("en-US", { timeZone: "America/Boise" })}</td></tr>
    </table>
  `;
}

export async function GET(req: NextRequest) {
  // Vercel cron sends Authorization: Bearer <CRON_SECRET>
  const auth = req.headers.get("authorization");
  if (process.env.CRON_SECRET && auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Find all unnotified requests
  const { data: requests, error } = await adminClient
    .from("service_requests")
    .select("*")
    .is("notification_sent_at", null)
    .neq("status", "cancelled");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!requests?.length) return NextResponse.json({ sent: 0 });

  for (const r of requests) {
    const subject = `🚛 NEW LOAD REQUEST — ${r.material_name} to ${r.delivery_city || r.delivery_address}`;
    const smsText = `Silver Creek Logistics — New load request!\n${r.customer_name} · ${r.customer_phone}\n${r.quantity} ${r.unit}s of ${r.material_name}\n${r.delivery_address}${r.delivery_city ? `, ${r.delivery_city}` : ""}\n${r.requested_date ? `Requested: ${r.requested_date}` : ""}`;

    const html = `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
        <div style="background:#1a2744;padding:20px 24px;border-radius:8px 8px 0 0">
          <h2 style="color:#fff;margin:0;font-size:18px">🚛 New Load Request</h2>
          <p style="color:#e8600a;margin:4px 0 0;font-size:13px">Silver Creek Logistics Dispatch</p>
        </div>
        <div style="background:#fff;padding:24px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px">
          ${formatRequest(r)}
          <div style="margin-top:20px">
            <a href="tel:${r.customer_phone.replace(/\D/g, "")}"
               style="background:#e8600a;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;font-weight:bold;font-size:14px">
              Call ${r.customer_name}
            </a>
            <a href="${process.env.NEXT_PUBLIC_SITE_URL}/admin/dispatch"
               style="background:#1a2744;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;font-weight:bold;font-size:14px;margin-left:10px">
              Open Dispatch Board
            </a>
          </div>
        </div>
      </div>
    `;

    // Email all dispatch recipients
    for (const recipient of dispatchRecipients) {
      if (!recipient.email) continue;
      await mailer.sendMail({
        from: `"Silver Creek Dispatch" <${process.env.GMAIL_USER}>`,
        to: recipient.email,
        subject,
        html,
      });
    }

    // SMS dispatch recipients who have phones set
    // Add TWILIO_DISPATCH_PHONES as comma-separated numbers in Vercel env vars
    const phones = (process.env.TWILIO_DISPATCH_PHONES ?? "").split(",").filter(Boolean);
    for (const phone of phones) {
      await sendSms(phone.trim(), smsText);
    }

    // Mark notified
    await adminClient
      .from("service_requests")
      .update({ notification_sent_at: new Date().toISOString() })
      .eq("id", r.id);
  }

  return NextResponse.json({ sent: requests.length });
}
