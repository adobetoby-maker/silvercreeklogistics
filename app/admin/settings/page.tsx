import { requireAdmin } from "@/lib/adminAuth";
import { cookies } from "next/headers";
import Link from "next/link";
import { Settings, Link2, CheckCircle, AlertCircle } from "lucide-react";
import { shopInfo } from "@/lib/shopInfo";

export default async function SettingsPage({ searchParams }: { searchParams: Promise<{ qb?: string }> }) {
  await requireAdmin();
  const { qb } = await searchParams;
  const cookieStore = await cookies();
  const qbConnected = !!cookieStore.get("qb_realm_id")?.value || qb === "connected";

  return (
    <div className="p-8 max-w-3xl">
      <h1 className="text-2xl font-extrabold text-[#1a2744] mb-8 flex items-center gap-2">
        <Settings size={22} /> Settings
      </h1>

      {/* Shop info */}
      <section className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h2 className="font-bold text-[#1a2744] mb-4">Business Info</h2>
        <div className="text-sm space-y-2 text-gray-600">
          <div><span className="font-medium text-gray-700">Name:</span> {shopInfo.name}</div>
          <div><span className="font-medium text-gray-700">Phone:</span> {shopInfo.phone}</div>
          <div><span className="font-medium text-gray-700">Email:</span> {shopInfo.email}</div>
          <div><span className="font-medium text-gray-700">Address:</span> {shopInfo.address}</div>
        </div>
        <p className="text-xs text-gray-400 mt-3">Edit in <code className="bg-gray-100 px-1 rounded">lib/shopInfo.ts</code></p>
      </section>

      {/* QuickBooks */}
      <section className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h2 className="font-bold text-[#1a2744] mb-1 flex items-center gap-2">
          <Link2 size={16} /> QuickBooks Online
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          Connect your QuickBooks account to sync clients and invoices automatically.
        </p>

        {qbConnected ? (
          <div className="flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-sm font-semibold">
            <CheckCircle size={16} /> QuickBooks Connected
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-start gap-2 bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-3 text-sm text-yellow-800">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <div>
                <strong>Setup required:</strong> Add <code>QB_CLIENT_ID</code>, <code>QB_CLIENT_SECRET</code>, and <code>QB_REDIRECT_URI</code> to your Vercel environment variables first.
                <br />Set <code>QB_ENVIRONMENT</code> to <code>sandbox</code> for testing or <code>production</code> for live data.
              </div>
            </div>
            <a href="/api/quickbooks/connect"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#2ca01c] hover:bg-[#238c16] text-white font-bold rounded-lg transition-colors text-sm">
              Connect QuickBooks
            </a>
          </div>
        )}
      </section>

      {/* Portal URL */}
      <section className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="font-bold text-[#1a2744] mb-2">Client Portal</h2>
        <p className="text-sm text-gray-500 mb-2">Clients access their invoices at:</p>
        <div className="font-mono text-sm bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-[#1a2744]">
          {process.env.NEXT_PUBLIC_SITE_URL ?? "https://silvercreeklogistics.worker-bee.app"}/portal
        </div>
        <p className="text-xs text-gray-400 mt-2">
          Invite clients to the portal from their <Link href="/admin/clients" className="text-[#e8600a] underline">client page</Link>.
        </p>
      </section>
    </div>
  );
}
