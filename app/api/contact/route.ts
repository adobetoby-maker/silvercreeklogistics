import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

const TO_EMAIL = "silvercreeklogistic@gmail.com";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, phone, email, material, quantity, deliveryAddress, preferredDate, message } = body;

  if (!name || !phone || !deliveryAddress) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  const subject = `New Quote Request — ${name} — ${material || "material TBD"}`;

  const html = `
    <div style="font-family: sans-serif; max-width: 600px;">
      <div style="background: #1a2744; color: white; padding: 20px 24px; border-radius: 8px 8px 0 0;">
        <h2 style="margin: 0; font-size: 20px;">New Quote Request</h2>
        <p style="margin: 4px 0 0; color: #9ca3af; font-size: 13px;">Silver Creek Logistics LLC</p>
      </div>
      <div style="border: 1px solid #e5e7eb; border-top: none; padding: 24px; border-radius: 0 0 8px 8px;">
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tr><td style="padding: 8px 0; color: #6b7280; width: 160px;">Name</td><td style="padding: 8px 0; font-weight: 600;">${name}</td></tr>
          <tr><td style="padding: 8px 0; color: #6b7280;">Phone</td><td style="padding: 8px 0; font-weight: 600;"><a href="tel:${phone}" style="color: #e8600a;">${phone}</a></td></tr>
          ${email ? `<tr><td style="padding: 8px 0; color: #6b7280;">Email</td><td style="padding: 8px 0;"><a href="mailto:${email}" style="color: #e8600a;">${email}</a></td></tr>` : ""}
          <tr><td style="padding: 8px 0; color: #6b7280;">Material</td><td style="padding: 8px 0;">${material || "Not specified"}</td></tr>
          <tr><td style="padding: 8px 0; color: #6b7280;">Quantity</td><td style="padding: 8px 0;">${quantity || "Not specified"}</td></tr>
          <tr><td style="padding: 8px 0; color: #6b7280;">Delivery Address</td><td style="padding: 8px 0;">${deliveryAddress}</td></tr>
          <tr><td style="padding: 8px 0; color: #6b7280;">Preferred Date</td><td style="padding: 8px 0;">${preferredDate || "Flexible"}</td></tr>
          ${message ? `<tr><td style="padding: 8px 0; color: #6b7280; vertical-align: top;">Notes</td><td style="padding: 8px 0;">${message}</td></tr>` : ""}
        </table>
      </div>
      <p style="font-size: 11px; color: #9ca3af; margin-top: 16px;">Submitted via silvercreeklogistics.worker-bee.app</p>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"Silver Creek Logistics" <${process.env.GMAIL_USER}>`,
      to: TO_EMAIL,
      replyTo: email || undefined,
      subject,
      html,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Email send error:", err);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}
