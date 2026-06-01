import { requireAdmin } from "@/lib/adminAuth";
import { adminClient } from "@/lib/supabase/admin";
import { Mail } from "lucide-react";

export const dynamic = "force-dynamic";

type EmailLog = {
  id: string;
  to_email: string;
  subject: string | null;
  template: string | null;
  status: string;
  opened_at: string | null;
  created_at: string;
};

function statusBadge(status: string) {
  const styles: Record<string, string> = {
    sent: "bg-green-100 text-green-700",
    failed: "bg-red-100 text-red-700",
    queued: "bg-yellow-100 text-yellow-700",
    opened: "bg-blue-100 text-blue-700",
    bounced: "bg-orange-100 text-orange-700",
  };
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-semibold capitalize ${styles[status] ?? "bg-gray-100 text-gray-500"}`}>
      {status}
    </span>
  );
}

function fmtDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-US", {
    month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
  });
}

export default async function EmailMonitorPage() {
  await requireAdmin();

  const { data } = await adminClient
    .from("email_log")
    .select("id, to_email, subject, template, status, opened_at, created_at")
    .order("created_at", { ascending: false })
    .limit(200);

  const logs = (data ?? []) as EmailLog[];

  return (
    <div className="p-8">
      <div className="flex items-center gap-3 mb-6">
        <Mail size={22} className="text-[#e8600a]" />
        <h1 className="text-2xl font-extrabold text-[#1a2744]">Email Monitor</h1>
        <span className="ml-auto text-sm text-gray-400">{logs.length} emails</span>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-left">
              <th className="px-4 py-3 font-semibold text-gray-600">To</th>
              <th className="px-4 py-3 font-semibold text-gray-600">Subject</th>
              <th className="px-4 py-3 font-semibold text-gray-600 hidden md:table-cell">Template</th>
              <th className="px-4 py-3 font-semibold text-gray-600">Status</th>
              <th className="px-4 py-3 font-semibold text-gray-600 hidden lg:table-cell">Opened</th>
              <th className="px-4 py-3 font-semibold text-gray-600 text-right">Sent</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 text-gray-600 text-xs font-mono">{log.to_email}</td>
                <td className="px-4 py-3 text-[#1a2744] font-medium">
                  {log.subject ?? <span className="text-gray-400 italic">No subject</span>}
                </td>
                <td className="px-4 py-3 text-gray-500 text-xs hidden md:table-cell">
                  {log.template ?? "—"}
                </td>
                <td className="px-4 py-3">{statusBadge(log.status)}</td>
                <td className="px-4 py-3 text-gray-400 text-xs hidden lg:table-cell">
                  {fmtDate(log.opened_at)}
                </td>
                <td className="px-4 py-3 text-right text-gray-400 text-xs whitespace-nowrap">
                  {fmtDate(log.created_at)}
                </td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-gray-400">
                  No emails logged yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
