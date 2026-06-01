import { requireAdmin } from "@/lib/adminAuth";
import AIAssistantClient from "./AIAssistantClient";

export const dynamic = "force-dynamic";

export default async function AIAssistantPage() {
  await requireAdmin();
  return <AIAssistantClient />;
}
