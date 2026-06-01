"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Truck, Radio, ClipboardList, FileText,
  Users, MessageSquare, Megaphone, Settings, LogOut,
  Clock, UserCheck, Star, MapPin, Calendar,
  Bot, BarChart3, BookOpen, Rss,
  Inbox, MessageCircle, Mail, Bell,
  FolderOpen, Receipt, FileSignature, TrendingDown,
  Image, Gift, ThumbsUp, Briefcase,
  ChevronDown, ChevronRight,
} from "lucide-react";
import { useState } from "react";

type NavItem = { href: string; label: string; icon: React.ElementType };
type NavSection = {
  label: string;
  color: string;
  bg: string;
  phase: string;
  items: NavItem[];
};

const sections: NavSection[] = [
  {
    label: "Core Ops",
    color: "#3b82f6",
    bg: "rgba(59,130,246,0.15)",
    phase: "P1",
    items: [
      { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
      { href: "/admin/fleet", label: "Fleet", icon: Truck },
      { href: "/admin/dispatch", label: "Dispatch", icon: Radio },
      { href: "/admin/work-orders", label: "Work Orders", icon: ClipboardList },
      { href: "/admin/invoices", label: "Invoices", icon: FileText },
      { href: "/admin/estimates", label: "Estimates", icon: FileSignature },
      { href: "/admin/clients", label: "Clients", icon: Users },
      { href: "/admin/crm", label: "CRM", icon: MessageSquare },
      { href: "/admin/marketing", label: "Marketing", icon: Megaphone },
    ],
  },
  {
    label: "HR & Crew",
    color: "#22c55e",
    bg: "rgba(34,197,94,0.15)",
    phase: "P2",
    items: [
      { href: "/admin/employees", label: "Employees", icon: Users },
      { href: "/admin/time-hub", label: "Time Hub", icon: Clock },
      { href: "/admin/scorecard", label: "Scorecards", icon: Star },
      { href: "/admin/jobs-map", label: "Jobs Map", icon: MapPin },
    ],
  },
  {
    label: "AI Tools",
    color: "#a855f7",
    bg: "rgba(168,85,247,0.15)",
    phase: "P3",
    items: [
      { href: "/admin/ai-assistant", label: "AI Assistant", icon: Bot },
      { href: "/admin/ai-reports", label: "AI Reports", icon: BarChart3 },
      { href: "/admin/knowledge-hub", label: "Knowledge Hub", icon: BookOpen },
      { href: "/admin/blog", label: "Blog", icon: Rss },
    ],
  },
  {
    label: "Communications",
    color: "#f97316",
    bg: "rgba(249,115,22,0.15)",
    phase: "P4",
    items: [
      { href: "/admin/chat", label: "Chat Inbox", icon: Inbox },
      { href: "/admin/sms-log", label: "SMS Log", icon: MessageCircle },
      { href: "/admin/email-monitor", label: "Email Monitor", icon: Mail },
    ],
  },
  {
    label: "Documents",
    color: "#14b8a6",
    bg: "rgba(20,184,166,0.15)",
    phase: "P5",
    items: [
      { href: "/admin/document-vault", label: "Doc Vault", icon: FolderOpen },
      { href: "/admin/receipt-inbox", label: "Receipts", icon: Receipt },
      { href: "/admin/ar-report", label: "AR Report", icon: TrendingDown },
    ],
  },
  {
    label: "Advanced",
    color: "#ef4444",
    bg: "rgba(239,68,68,0.15)",
    phase: "P6",
    items: [
      { href: "/admin/projects", label: "Projects", icon: Briefcase },
      { href: "/admin/gallery", label: "Gallery", icon: Image },
      { href: "/admin/referrals", label: "Referrals", icon: Gift },
      { href: "/admin/surveys", label: "Surveys", icon: ThumbsUp },
      { href: "/admin/settings", label: "Settings", icon: Settings },
    ],
  },
];

export default function AdminSidebar() {
  const path = usePathname();
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const toggle = (label: string) =>
    setCollapsed((prev) => ({ ...prev, [label]: !prev[label] }));

  const isActive = (href: string) =>
    href === "/admin" ? path === "/admin" : path.startsWith(href);

  const sectionHasActive = (items: NavItem[]) =>
    items.some((i) => isActive(i.href));

  async function logout() {
    await fetch("/api/auth", { method: "DELETE" });
    window.location.href = "/admin/login";
  }

  return (
    <aside className="w-60 shrink-0 bg-[#1a2744] text-white flex flex-col min-h-screen overflow-y-auto">
      {/* Logo */}
      <div className="p-4 border-b border-white/10 flex items-center gap-2.5 sticky top-0 bg-[#1a2744] z-10">
        <div className="w-9 h-9 bg-[#e8600a] rounded-lg flex items-center justify-center shrink-0">
          <Truck size={18} />
        </div>
        <div>
          <div className="font-bold text-sm leading-tight">Silver Creek</div>
          <div className="text-xs text-gray-400">Admin Portal</div>
        </div>
      </div>

      {/* Nav sections */}
      <nav className="flex-1 py-2 overflow-y-auto">
        {sections.map((section) => {
          const open = !collapsed[section.label];
          const hasActive = sectionHasActive(section.items);

          return (
            <div key={section.label} className="mb-1">
              {/* Section header */}
              <button
                onClick={() => toggle(section.label)}
                className="w-full flex items-center justify-between px-3 py-1.5 text-left hover:bg-white/5 transition-colors group"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                    style={{ backgroundColor: section.bg, color: section.color }}
                  >
                    {section.phase}
                  </span>
                  <span
                    className="text-xs font-semibold uppercase tracking-wider"
                    style={{ color: hasActive ? section.color : "rgba(255,255,255,0.45)" }}
                  >
                    {section.label}
                  </span>
                </div>
                {open ? (
                  <ChevronDown size={12} className="text-white/30" />
                ) : (
                  <ChevronRight size={12} className="text-white/30" />
                )}
              </button>

              {/* Section items */}
              {open && (
                <div className="space-y-0.5 px-2 pb-1">
                  {section.items.map(({ href, label, icon: Icon }) => {
                    const active = isActive(href);
                    return (
                      <Link
                        key={href}
                        href={href}
                        className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                          active
                            ? "text-white font-semibold"
                            : "text-gray-400 hover:text-white hover:bg-white/8"
                        }`}
                        style={active ? { backgroundColor: section.color + "30", color: section.color === "#3b82f6" ? "#e8600a" : section.color } : {}}
                      >
                        <Icon size={15} className="shrink-0" />
                        {label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-white/10 sticky bottom-0 bg-[#1a2744]">
        <button
          onClick={logout}
          className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-sm text-gray-400 hover:bg-white/10 hover:text-white transition-colors"
        >
          <LogOut size={15} />
          Log Out
        </button>
      </div>
    </aside>
  );
}
