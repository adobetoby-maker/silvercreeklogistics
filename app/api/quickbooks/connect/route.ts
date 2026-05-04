import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import OAuthClient from "intuit-oauth";

async function isAdmin() {
  const c = await cookies();
  return c.get("scl_admin_session")?.value === process.env.ADMIN_SECRET;
}

export async function GET() {
  if (!await isAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const oauthClient = new OAuthClient({
    clientId: process.env.QB_CLIENT_ID!,
    clientSecret: process.env.QB_CLIENT_SECRET!,
    environment: (process.env.QB_ENVIRONMENT ?? "sandbox") as "sandbox" | "production",
    redirectUri: process.env.QB_REDIRECT_URI!,
  });

  const authUri = oauthClient.authorizeUri({
    scope: [OAuthClient.scopes.Accounting],
    state: "scl-qb-connect",
  });

  return NextResponse.redirect(authUri);
}
