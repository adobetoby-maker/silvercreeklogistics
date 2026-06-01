import { NextRequest, NextResponse } from "next/server";
import { adminClient } from "@/lib/supabase/admin";
import Anthropic from "@anthropic-ai/sdk";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "AI not configured" }, { status: 503 });
  }

  const { message, history = [] } = await req.json() as { message: string; history: Message[] };

  // Load business knowledge
  const { data: knowledge } = await adminClient
    .from("business_knowledge")
    .select("category, question, answer")
    .eq("enabled", true)
    .order("sort_order");

  const knowledgeText = (knowledge ?? [])
    .map((k) => `[${k.category.toUpperCase()}] Q: ${k.question}\nA: ${k.answer}`)
    .join("\n\n");

  const systemPrompt = `You are an AI assistant for Silver Creek Logistics, an aggregate and materials delivery company in Twin Falls, Idaho. You help the admin team manage work orders, clients, invoices, and deliveries.

BUSINESS KNOWLEDGE:
${knowledgeText || "No specific knowledge configured yet. Answer based on general trucking/logistics business context."}

CAPABILITIES:
- Answer questions about clients, invoices, work orders, and deliveries
- Help create work orders by extracting key details from natural language
- Summarize financial data when asked
- Provide scheduling assistance

WORK ORDER DETECTION:
If the user asks to create, schedule, or set up a delivery/work order, extract these fields and respond with a helpful confirmation. Then include a JSON action block at the very end of your response in this exact format:
<action>{"type":"create_work_order","data":{"customer_name":"...","customer_phone":"...","material_name":"...","quantity":0,"unit":"tons","delivery_address":"...","delivery_city":"...","requested_date":"YYYY-MM-DD","internal_notes":"..."}}</action>

Only include <action> if you have enough info to create a real work order. If key fields are missing (like customer name or address), ask for them instead.

Keep responses concise and professional. You're talking to the business owner or dispatcher.`;

  const client = new Anthropic({ apiKey });

  const anthropicMessages: Anthropic.MessageParam[] = [
    ...history.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
    { role: "user", content: message },
  ];

  const response = await client.messages.create({
    model: "claude-haiku-4-5",
    max_tokens: 1024,
    system: systemPrompt,
    messages: anthropicMessages,
  });

  const rawReply = response.content[0].type === "text" ? response.content[0].text : "";

  // Parse action if present
  const actionMatch = rawReply.match(/<action>([\s\S]*?)<\/action>/);
  let action: { type: string; data: Record<string, unknown> } | undefined;
  const reply = rawReply.replace(/<action>[\s\S]*?<\/action>/, "").trim();

  if (actionMatch) {
    try {
      action = JSON.parse(actionMatch[1]) as { type: string; data: Record<string, unknown> };
    } catch {
      // ignore parse error
    }
  }

  return NextResponse.json({ reply, action });
}
