"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Settings, Building2, Link2, Mail, Users, AlertTriangle,
  CheckCircle, AlertCircle, UserPlus, Shield, Eye,
} from "lucide-react";
import type { AdminUser } from "@/lib/types/db";

type TabId = "business" | "quickbooks" | "email" | "users" | "danger";

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: "business", label: "Business Info", icon: <Building2 size={14} /> },
  { id: "quickbooks", label: "QuickBooks", icon: <Link2 size={14} /> },
  { id: "email", label: "Email", icon: <Mail size={14} /> },
  { id: "users", label: "Admin Users", icon: <Users size={14} /> },
  { id: "danger", label: "Danger Zone", icon: <AlertTriangle size={14} /> },
];

const ROLE_LABELS: Record<string, string> = {
  owner: "Owner",
  admin: "Admin",
  dispatcher: "Dispatcher",
  viewer: "Viewer",
};

const ROLE_STYLES: Record<string, string> = {
  owner: "bg-[#1a2744] text-white",
  admin: "bg-orange-100 text-orange-700",
  dispatcher: "bg-blue-100 text-blue-700",
  viewer: "bg-gray-100 text-gray-600",
};

type ShopInfo = {
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
};

export default function SettingsClient({
  shopInfo,
  qbConnected,
  resendConfigured,
  adminUsers: initialUsers,
  initialTab,
}: {
  shopInfo: ShopInfo;
  qbConnected: boolean;
  resendConfigured: boolean;
  adminUsers: AdminUser[];
  initialTab: string;
}) {
  const [tab, setTab] = useState<TabId>((initialTab as TabId) ?? "business");
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>(initialUsers);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [inviteForm, setInviteForm] = useState({ email: "", name: "", role: "viewer" });
  const [inviting, setSaving] = useState(false);

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/admin-users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(inviteForm),
    });
    if (res.ok) {
      const { user } = await res.json() as { user: AdminUser };
      setAdminUsers((prev) => [...prev, user]);
      setShowInviteModal(false);
      setInviteForm({ email: "", name: "", role: "viewer" });
    }
    setSaving(false);
  }

  return (
    <div className="p-8 max-w-3xl">
      <h1 className="text-2xl font-extrabold text-[#1a2744] mb-6 flex items-center gap-2">
        <Settings size={22} /> Settings
      </h1>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-xl w-full overflow-x-auto">
        {TABS.map(({ id, label, icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              tab === id
                ? "bg-white text-[#1a2744] shadow-sm font-semibold"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {icon} {label}
          </button>
        ))}
      </div>

      {/* Business Info */}
      {tab === "business" && (
        <section className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="font-bold text-[#1a2744] mb-4">Business Info</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-0.5">Company Name</p>
              <p className="text-gray-800 font-medium">{shopInfo.name}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-0.5">Phone</p>
              <p className="text-gray-800">{shopInfo.phone}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-0.5">Email</p>
              <p className="text-gray-800">{shopInfo.email}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-0.5">City / State</p>
              <p className="text-gray-800">{shopInfo.city}, {shopInfo.state}</p>
            </div>
            <div className="col-span-2">
              <p className="text-xs font-semibold text-gray-500 mb-0.5">Address</p>
              <p className="text-gray-800">{shopInfo.address}</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-400">
              To update business info, edit{" "}
              <code className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">lib/shopInfo.ts</code>{" "}
              and redeploy.
            </p>
          </div>
        </section>
      )}

      {/* QuickBooks */}
      {tab === "quickbooks" && (
        <section className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-2 mb-2">
            <Link2 size={16} className="text-[#1a2744]" />
            <h2 className="font-bold text-[#1a2744]">QuickBooks Online</h2>
          </div>
          <p className="text-sm text-gray-500 mb-5">
            Connect QuickBooks to sync clients and invoices automatically.
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
                  <strong>Setup required:</strong> Add{" "}
                  <code className="bg-yellow-100 px-1 rounded">QB_CLIENT_ID</code>,{" "}
                  <code className="bg-yellow-100 px-1 rounded">QB_CLIENT_SECRET</code>, and{" "}
                  <code className="bg-yellow-100 px-1 rounded">QB_REDIRECT_URI</code> to your Vercel environment variables.
                </div>
              </div>
              <a
                href="/api/quickbooks/connect"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#2ca01c] hover:bg-[#238c16] text-white font-bold rounded-lg transition-colors text-sm"
              >
                Connect QuickBooks
              </a>
            </div>
          )}

          <div className="mt-6 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-400">
              After connecting, invoices and clients sync bidirectionally.
              View sync log in{" "}
              <Link href="/admin/invoices" className="text-[#e8600a] hover:underline">Invoices</Link>.
            </p>
          </div>
        </section>
      )}

      {/* Email */}
      {tab === "email" && (
        <section className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <Mail size={16} className="text-[#1a2744]" />
            <h2 className="font-bold text-[#1a2744]">Email Configuration</h2>
          </div>

          <div className="space-y-5">
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-2">Resend API Status</p>
              {resendConfigured ? (
                <div className="flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-sm font-semibold">
                  <CheckCircle size={16} /> Resend API configured
                </div>
              ) : (
                <div className="flex items-start gap-2 bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-600">
                  <AlertCircle size={16} className="shrink-0 mt-0.5 text-gray-400" />
                  <span>
                    <code className="bg-gray-100 px-1 rounded">RESEND_API_KEY</code> not configured.
                    Add it to Vercel env vars to enable email sending.
                  </span>
                </div>
              )}
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-500 mb-2">From Address</p>
              <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm font-mono text-gray-700">
                invoices@silvercreeklogistics.com
              </div>
              <p className="text-xs text-gray-400 mt-1.5">
                Set <code className="bg-gray-100 px-1 rounded">RESEND_FROM_EMAIL</code> env var to override.
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-500 mb-2">Client Portal URL</p>
              <div className="font-mono text-sm bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-[#1a2744] break-all">
                https://silvercreeklogistics.worker-bee.app/portal
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Admin Users */}
      {tab === "users" && (
        <section className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Shield size={16} className="text-[#1a2744]" />
              <h2 className="font-bold text-[#1a2744]">Admin Users</h2>
            </div>
            <button
              onClick={() => setShowInviteModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#e8600a] text-white text-xs font-semibold rounded-lg hover:bg-[#c4500a] transition-colors"
            >
              <UserPlus size={13} /> Invite User
            </button>
          </div>

          {adminUsers.length === 0 ? (
            <div className="p-10 text-center text-gray-400">
              <Users size={32} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm font-medium">No admin users yet</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-left">
                  <th className="px-6 py-3 font-semibold text-gray-600">Name</th>
                  <th className="px-6 py-3 font-semibold text-gray-600 hidden sm:table-cell">Email</th>
                  <th className="px-6 py-3 font-semibold text-gray-600">Role</th>
                  <th className="px-6 py-3 font-semibold text-gray-600 hidden md:table-cell">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {adminUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50">
                    <td className="px-6 py-3 font-medium text-[#1a2744]">{u.name}</td>
                    <td className="px-6 py-3 text-gray-500 hidden sm:table-cell">{u.email}</td>
                    <td className="px-6 py-3">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${ROLE_STYLES[u.role] ?? "bg-gray-100 text-gray-600"}`}>
                        {ROLE_LABELS[u.role] ?? u.role}
                      </span>
                    </td>
                    <td className="px-6 py-3 hidden md:table-cell">
                      <span className={`flex items-center gap-1 text-xs font-medium ${u.active ? "text-green-600" : "text-gray-400"}`}>
                        <Eye size={11} />
                        {u.active ? "Active" : "Inactive"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      )}

      {/* Danger Zone */}
      {tab === "danger" && (
        <section className="bg-white rounded-xl shadow-sm p-6 border border-red-100">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={16} className="text-red-500" />
            <h2 className="font-bold text-red-600">Danger Zone</h2>
          </div>
          <div>
            <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
              <div>
                <p className="font-semibold text-red-700 text-sm">Reset Demo Data</p>
                <p className="text-xs text-red-500 mt-0.5">
                  Clears all test data from the database. This action cannot be undone.
                </p>
              </div>
              <button
                onClick={() => setShowResetModal(true)}
                className="px-3 py-2 bg-red-600 text-white text-xs font-bold rounded-lg hover:bg-red-700 transition-colors shrink-0 ml-4"
              >
                Reset Data
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Invite User Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-[#1a2744] flex items-center gap-2">
                <UserPlus size={18} /> Invite Admin User
              </h2>
            </div>
            <form onSubmit={handleInvite} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Full Name *</label>
                <input
                  required
                  value={inviteForm.name}
                  onChange={(e) => setInviteForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Jane Smith"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#e8600a]/30"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Email *</label>
                <input
                  required
                  type="email"
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="jane@example.com"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#e8600a]/30"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Role</label>
                <select
                  value={inviteForm.role}
                  onChange={(e) => setInviteForm((f) => ({ ...f, role: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#e8600a]/30"
                >
                  <option value="viewer">Viewer — read-only access</option>
                  <option value="dispatcher">Dispatcher — manage jobs and dispatch</option>
                  <option value="admin">Admin — full access except billing</option>
                  <option value="owner">Owner — full access</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowInviteModal(false)} className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-50">
                  Cancel
                </button>
                <button type="submit" disabled={inviting} className="flex-1 px-4 py-2 bg-[#e8600a] text-white text-sm font-semibold rounded-lg hover:bg-[#c4500a] disabled:opacity-60">
                  {inviting ? "Inviting…" : "Send Invite"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Demo Confirm Modal */}
      {showResetModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center shrink-0">
                <AlertTriangle size={20} className="text-red-600" />
              </div>
              <div>
                <h2 className="font-bold text-[#1a2744]">Reset Demo Data?</h2>
                <p className="text-sm text-gray-500">This cannot be undone.</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-6">
              All test clients, invoices, jobs, and other demo data will be permanently deleted.
              Production data and settings will not be affected.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowResetModal(false)} className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-50">
                Cancel
              </button>
              <button
                onClick={() => setShowResetModal(false)}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-400 text-sm font-semibold rounded-lg cursor-not-allowed"
                title="Not available in this environment"
              >
                Reset (unavailable)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
