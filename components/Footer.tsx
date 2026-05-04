import Link from "next/link";
import { Phone, Mail, MapPin, Truck, Clock } from "lucide-react";
import { shopInfo } from "@/lib/shopInfo";

export default function Footer() {
  return (
    <footer className="bg-[#1a2744] text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 bg-[#e8600a] rounded flex items-center justify-center">
                <Truck size={20} className="text-white" />
              </div>
              <div>
                <div className="font-bold text-sm leading-tight">Silver Creek Logistics LLC</div>
                <div className="text-xs text-gray-400">Twin Falls, Idaho</div>
              </div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Reliable aggregate delivery across Magic Valley. Topsoil, gravel, road base, and more — delivered on time.
            </p>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wider text-gray-300 mb-4">Materials</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/pricing#topsoil" className="hover:text-white transition-colors">Screened Topsoil</Link></li>
              <li><Link href="/pricing#fill-dirt" className="hover:text-white transition-colors">Fill Dirt</Link></li>
              <li><Link href="/pricing#road-base" className="hover:text-white transition-colors">Road Base</Link></li>
              <li><Link href="/pricing#gravel" className="hover:text-white transition-colors">Gravel</Link></li>
              <li><Link href="/pricing#sand" className="hover:text-white transition-colors">Sand</Link></li>
              <li><Link href="/pricing#rip-rap" className="hover:text-white transition-colors">Rip Rap</Link></li>
            </ul>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wider text-gray-300 mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/calculator" className="hover:text-white transition-colors">Material Calculator</Link></li>
              <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Get a Quote</Link></li>
              <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/disclaimer" className="hover:text-white transition-colors">Disclaimer</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wider text-gray-300 mb-4">Contact</h3>
            <ul className="space-y-3 text-sm text-gray-400">
              <li className="flex items-start gap-2">
                <Phone size={15} className="text-[#e8600a] mt-0.5 shrink-0" />
                <a href={`tel:${shopInfo.phone.replace(/\D/g, "")}`} className="hover:text-white transition-colors">
                  {shopInfo.phone}
                </a>
              </li>
              <li className="flex items-start gap-2">
                <Mail size={15} className="text-[#e8600a] mt-0.5 shrink-0" />
                <a href={`mailto:${shopInfo.email}`} className="hover:text-white transition-colors break-all">
                  {shopInfo.email}
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin size={15} className="text-[#e8600a] mt-0.5 shrink-0" />
                <span>{shopInfo.address}</span>
              </li>
              <li className="flex items-start gap-2">
                <Clock size={15} className="text-[#e8600a] mt-0.5 shrink-0" />
                <div>
                  <div>{shopInfo.hours.weekdays}</div>
                  <div>{shopInfo.hours.saturday}</div>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Service area */}
        <div className="border-t border-white/10 mt-10 pt-8">
          <p className="text-gray-400 text-xs mb-1 uppercase tracking-wider font-medium">Service Area</p>
          <p className="text-gray-500 text-sm">{shopInfo.serviceArea.join(" · ")}</p>
        </div>

        {/* Bottom */}
        <div className="border-t border-white/10 mt-6 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <p>© {new Date().getFullYear()} Silver Creek Logistics LLC. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/terms" className="hover:text-gray-300 transition-colors">Terms</Link>
            <Link href="/privacy" className="hover:text-gray-300 transition-colors">Privacy</Link>
            <Link href="/disclaimer" className="hover:text-gray-300 transition-colors">Disclaimer</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
