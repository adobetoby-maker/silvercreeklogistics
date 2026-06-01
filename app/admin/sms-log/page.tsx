import { requireAdmin } from "@/lib/adminAuth";
import { adminClient } from "@/lib/supabase/admin";
import { MessageSquare } from "lucide-react";

export const dynamic = "force-dynamic";

type SmsLog = {
  id: string;
  to_phone: string;
  body: string;
  status: string;
  created_at: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  client: any;
};

function statusBadge(status: string) {
  const styles: Record<string, string> = {
    sent: "bg-green-100 text-green-700",
    failed: "bg-red-100 text-red-700",
    queued: "bg-yellow-100 text-yellow-700",
  };
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-semibold capitalize ${styles[status] ?? "bg-gray-100 text-gray-500"}`}>
      {status}
    </span>
  );
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
  });
}

export default async function SmsLogPage() {
  await requireAdmin();

  const { data } = await adminClient
    .from("sms_log")
    .select("*, client:clients(name)")
    .order("created_at", { ascending: false })
    .limit(200);

  const logs = (data ?? []) as SmsLog[];

  return (
    <div className="p-8">
      <div className="flex items-center gap-3 mb-6">
        <MessageSquare size={22} className="text-[#e8600a]" />
        <h1 className="text-2xl font-extrabold text-[#1a2744]">SMS Log</h1>
        <span className="ml-auto text-sm text-gray-400">{logs.length} messages</span>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-left">
              <th className="px-4 py-3 font-semibold text-gray-600">To</th>
              <th className="px-4 py-3 font-semibold text-gray-600">Client</th>
              <th className="px-4 py-3 font-semibold text-gray-600">Message</th>
              <th className="px-4 py-3 font-semibold text-gray-600">Status</th>
              <th className="px-4 py-3 font-semibold text-gray-600 text-right">Sent</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 font-mono text-xs text-gray-600">{log.to_phone}</td>
                <td className="px-4 py-3 text-[#1a2744] font-medium">{log.client?.name ?? "—"}</td>
                <td className="px-4 py-3 text-gray-600">
                  {log.body.length > 80 ? log.body.slice(0, 80) + "…" : log.body}
                </td>
                <td className="px-4 py-3">{statusBadge(log.status)}</td>
                <td className="px-4 py-3 text-right text-gray-400 text-xs whitespace-nowrap">
                  {fmtDate(log.created_at)}
                </td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-gray-400">
                  No SMS messages logged yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
