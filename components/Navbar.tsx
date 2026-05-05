"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, Phone, Truck } from "lucide-react";
import { shopInfo } from "@/lib/shopInfo";

const navLinks = [
  { label: "Services", href: "/services" },
  { label: "Pricing", href: "/pricing" },
  { label: "Calculator", href: "/calculator" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="bg-[#1a2744] text-white sticky top-0 z-50 shadow-lg">
      {/* Top bar */}
      <div className="bg-[#e8600a] py-1.5 px-4 text-center text-sm font-medium">
        <a href={`tel:${shopInfo.phone.replace(/\D/g, "")}`} className="flex items-center justify-center gap-2 hover:underline">
          <Phone size={14} />
          Call to schedule a delivery: {shopInfo.phone}
        </a>
      </div>

      {/* Main nav */}
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 bg-[#e8600a] rounded flex items-center justify-center group-hover:bg-[#c4500a] transition-colors">
              <Truck size={20} className="text-white" />
            </div>
            <div>
              <div className="font-bold text-base leading-tight">Silver Creek Logistics</div>
              <div className="text-xs text-gray-400 leading-tight">Twin Falls, Idaho</div>
            </div>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/10 rounded transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/order"
              className="ml-3 px-4 py-2 bg-[#e8600a] hover:bg-[#c4500a] text-white text-sm font-semibold rounded transition-colors"
            >
              Order a Load
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2 text-gray-300 hover:text-white"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="md:hidden border-t border-white/10 py-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="block px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/10 rounded transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-2 px-4">
              <Link
                href="/order"
                onClick={() => setOpen(false)}
                className="block text-center px-4 py-2 bg-[#e8600a] hover:bg-[#c4500a] text-white text-sm font-semibold rounded transition-colors"
              >
                Order a Load
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
