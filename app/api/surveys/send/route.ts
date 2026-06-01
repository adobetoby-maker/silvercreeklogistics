import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

async function isAdmin() {
  const c = await cookies();
  return c.get("scl_admin_session")?.value === process.env.ADMIN_SECRET;
}

export async function POST(req: NextRequest) {
  if (!await isAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { client_id, email } = await req.json() as { client_id?: string; email: string };

  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  // TODO: integrate with Resend to send survey email
  // The survey link would be: /survey?token=<generated_token>&client_id=<client_id>
  console.log(`Survey send requested for ${email}, client ${client_id ?? "unknown"}`);

  return NextResponse.json({ success: true, message: `Survey queued for ${email}` });
}
