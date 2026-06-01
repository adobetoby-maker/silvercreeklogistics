import { requireAdmin } from "@/lib/adminAuth";
import AIReportsClient from "./AIReportsClient";

export const dynamic = "force-dynamic";

export default async function AIReportsPage() {
  await requireAdmin();
  return <AIReportsClient />;
}
