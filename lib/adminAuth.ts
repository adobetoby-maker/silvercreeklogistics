import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const COOKIE = "scl_admin_session";

export async function requireAdmin() {
  const cookieStore = await cookies();
  const session = cookieStore.get(COOKIE)?.value;
  if (session !== process.env.ADMIN_SECRET) {
    redirect("/admin/login");
  }
}

export async function isAdminLoggedIn(): Promise<boolean> {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE)?.value === process.env.ADMIN_SECRET;
}
