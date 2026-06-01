import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "AI not configured" }, { status: 503 });
  }

  const { topic } = await req.json() as { topic: string };

  const client = new Anthropic({ apiKey });

  const prompt = `Write an SEO-optimized blog post for Silver Creek Logistics, an aggregate and materials delivery company serving Twin Falls and the Magic Valley region of Idaho.

Topic: ${topic}

Requirements:
- 600-800 words
- Written for local construction contractors, farmers, and project managers in Magic Valley Idaho
- Include local references (Twin Falls, Jerome, Gooding, Blaine County, Magic Valley)
- Naturally mention aggregate materials: road base, gravel, sand, rip rap, crushed rock
- Professional but approachable tone
- Include a compelling intro, 2-3 main sections with H2 headings, and a call-to-action conclusion
- SEO-friendly structure

Return a JSON object with these exact fields:
{
  "title": "The blog post title (60 chars max)",
  "slug": "url-friendly-slug",
  "excerpt": "A 155-character meta description / excerpt",
  "content": "The full blog post in markdown format",
  "tags": ["tag1", "tag2", "tag3"]
}

Return ONLY the JSON object, no other text.`;

  const response = await client.messages.create({
    model: "claude-haiku-4-5",
    max_tokens: 2048,
    messages: [{ role: "user", content: prompt }],
  });

  const rawText = response.content[0].type === "text" ? response.content[0].text : "{}";

  try {
    // Strip markdown code fences if present
    const cleaned = rawText.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "").trim();
    const parsed = JSON.parse(cleaned) as {
      title: string;
      slug?: string;
      excerpt: string;
      content: string;
      tags?: string[];
    };

    return NextResponse.json({
      title: parsed.title ?? `Blog Post: ${topic}`,
      slug: parsed.slug ?? slugify(parsed.title ?? topic),
      excerpt: parsed.excerpt ?? "",
      content: parsed.content ?? "",
      tags: parsed.tags ?? [],
    });
  } catch {
    return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 });
  }
}
