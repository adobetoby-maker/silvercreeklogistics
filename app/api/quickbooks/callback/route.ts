import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import OAuthClient from "intuit-oauth";

export async function GET(req: NextRequest) {
  const oauthClient = new OAuthClient({
    clientId: process.env.QB_CLIENT_ID!,
    clientSecret: process.env.QB_CLIENT_SECRET!,
    environment: (process.env.QB_ENVIRONMENT ?? "sandbox") as "sandbox" | "production",
    redirectUri: process.env.QB_REDIRECT_URI!,
  });

  const url = req.url;
  const authResponse = await oauthClient.createToken(url);
  const token = authResponse.getJson();

  const cookieStore = await cookies();
  // Store QB tokens in httpOnly cookies (short-term; prod should use encrypted DB storage)
  cookieStore.set("qb_access_token", token.access_token, { httpOnly: true, maxAge: 3600, path: "/" });
  cookieStore.set("qb_refresh_token", token.refresh_token, { httpOnly: true, maxAge: 60 * 60 * 24 * 100, path: "/" });
  cookieStore.set("qb_realm_id", token.realmId, { httpOnly: true, maxAge: 60 * 60 * 24 * 100, path: "/" });

  return NextResponse.redirect(new URL("/admin/settings?qb=connected", req.url));
}
