"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Users, FileText, MessageSquare,
  Megaphone, Settings, LogOut, Truck,
} from "lucide-react";

const nav = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/clients", label: "Clients", icon: Users },
  { href: "/admin/invoices", label: "Invoices", icon: FileText },
  { href: "/admin/crm", label: "CRM", icon: MessageSquare },
  { href: "/admin/marketing", label: "Marketing", icon: Megaphone },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminSidebar() {
  const path = usePathname();

  async function logout() {
    await fetch("/api/auth", { method: "DELETE" });
    window.location.href = "/admin/login";
  }

  return (
    <aside className="w-56 shrink-0 bg-[#1a2744] text-white flex flex-col min-h-screen">
      <div className="p-5 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#e8600a] rounded flex items-center justify-center">
            <Truck size={16} />
          </div>
          <div>
            <div className="font-bold text-sm leading-tight">Silver Creek</div>
            <div className="text-xs text-gray-400">Admin</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-0.5">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = href === "/admin" ? path === "/admin" : path.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                active ? "bg-[#e8600a] text-white font-semibold" : "text-gray-300 hover:bg-white/10"
              }`}
            >
              <Icon size={16} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-white/10">
        <button
          onClick={logout}
          className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-white/10 transition-colors"
        >
          <LogOut size={16} />
          Log Out
        </button>
      </div>
    </aside>
  );
}
