import { NextRequest, NextResponse } from "next/server";
import { adminClient } from "@/lib/supabase/admin";
import Anthropic from "@anthropic-ai/sdk";

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "AI not configured" }, { status: 503 });
  }

  const { type } = await req.json() as { type: string };

  // Fetch context data
  const [ordersRes, invoicesRes] = await Promise.all([
    adminClient
      .from("service_requests")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(30),
    adminClient
      .from("invoices")
      .select("*, client:clients(name)")
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  const orders = ordersRes.data ?? [];
  const invoices = invoicesRes.data ?? [];

  const ordersText = orders
    .map(
      (o) =>
        `- ${o.material_name ?? "Unknown"} | ${o.quantity ?? 0} ${o.unit ?? "units"} | ${o.delivery_city ?? "Unknown city"} | Status: ${o.status} | Date: ${o.scheduled_date ?? o.requested_date ?? "TBD"}`
    )
    .join("\n");

  const invoicesText = invoices
    .map(
      (inv) =>
        `- Invoice #${inv.invoice_number} | ${(inv.client as { name?: string } | null)?.name ?? "Unknown"} | $${inv.total} | Status: ${inv.status} | Due: ${inv.due_date ?? "N/A"}`
    )
    .join("\n");

  const prompts: Record<string, string> = {
    business_summary: `You are an analytics assistant for Silver Creek Logistics. Based on the following recent business data, write a comprehensive Business Summary report in markdown format. Include sections for: Executive Summary, Operations Overview, Financial Health, and Key Takeaways. Be specific with numbers.

RECENT WORK ORDERS (last 30):
${ordersText || "No orders found."}

RECENT INVOICES (last 20):
${invoicesText || "No invoices found."}

Write a professional, concise report with clear sections and bullet points.`,

    revenue_analysis: `You are a financial analyst for Silver Creek Logistics. Analyze the following invoice data and write a Revenue Analysis report in markdown format. Include: Total Revenue, Average Invoice Size, Outstanding AR, Revenue by Status, and Recommendations to improve collections.

INVOICE DATA:
${invoicesText || "No invoices found."}

Be specific with dollar amounts and percentages.`,

    fleet_performance: `You are a fleet operations analyst for Silver Creek Logistics. Based on the following delivery data, write a Fleet Performance report in markdown format. Include: Delivery Volume, Status Breakdown, Popular Materials, Geographic Coverage, and Operational Recommendations.

DELIVERY DATA (last 30 orders):
${ordersText || "No orders found."}

Focus on efficiency metrics and operational insights.`,
  };

  const prompt = prompts[type];
  if (!prompt) {
    return NextResponse.json({ error: "Unknown report type" }, { status: 400 });
  }

  const client = new Anthropic({ apiKey });

  const response = await client.messages.create({
    model: "claude-haiku-4-5",
    max_tokens: 2048,
    messages: [{ role: "user", content: prompt }],
  });

  const content = response.content[0].type === "text" ? response.content[0].text : "";

  return NextResponse.json({ content });
}
