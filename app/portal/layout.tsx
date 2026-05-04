import Link from "next/link";
import { Truck, LogOut, FileText, LayoutDashboard } from "lucide-react";

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f5f0eb] flex flex-col">
      <header className="bg-[#1a2744] text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-14">
          <Link href="/portal/dashboard" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-[#e8600a] rounded flex items-center justify-center">
              <Truck size={14} />
            </div>
            <span className="font-bold text-sm">Client Portal</span>
          </Link>
          <nav className="flex items-center gap-1">
            <Link href="/portal/dashboard" className="flex items-center gap-1.5 px-3 py-1.5 rounded text-sm text-gray-300 hover:text-white hover:bg-white/10 transition-colors">
              <LayoutDashboard size={14} /> Dashboard
            </Link>
            <Link href="/portal/invoices" className="flex items-center gap-1.5 px-3 py-1.5 rounded text-sm text-gray-300 hover:text-white hover:bg-white/10 transition-colors">
              <FileText size={14} /> Invoices
            </Link>
            <form action="/api/portal/logout" method="POST">
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded text-sm text-gray-300 hover:text-white hover:bg-white/10 transition-colors">
                <LogOut size={14} /> Sign Out
              </button>
            </form>
          </nav>
        </div>
      </header>
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
