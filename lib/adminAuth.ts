import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const COOKIE = "scl_admin_session";

// Fail closed: an unset/empty ADMIN_SECRET must never authenticate anyone.
// Without this guard, `undefined === undefined` silently opens the admin area
// whenever the env var is missing (root cause of the 2026-07-05 exposure).
function adminSecret(): string | null {
  const secret = process.env.ADMIN_SECRET;
  return secret && secret.length > 0 ? secret : null;
}

export async function requireAdmin() {
  const cookieStore = await cookies();
  const session = cookieStore.get(COOKIE)?.value;
  const secret = adminSecret();
  if (!secret || session !== secret) {
    redirect("/admin/login");
  }
}

export async function isAdminLoggedIn(): Promise<boolean> {
  const cookieStore = await cookies();
  const secret = adminSecret();
  return secret !== null && cookieStore.get(COOKIE)?.value === secret;
}
