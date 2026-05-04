import type { Metadata } from "next";
import ContactForm from "@/components/ContactForm";
import { Phone, Mail, MapPin, Clock, CheckCircle } from "lucide-react";
import { shopInfo } from "@/lib/shopInfo";

export const metadata: Metadata = {
  title: "Contact — Get a Quote",
  description:
    "Contact Silver Creek Logistics LLC to schedule an aggregate delivery in Magic Valley, Idaho. Call or message us for a free quote on topsoil, gravel, road base, sand, and fill dirt.",
};

export default function ContactPage() {
  return (
    <div className="bg-white">
      {/* Header */}
      <div className="bg-[#1a2744] text-white py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-extrabold mb-3">Get a Quote</h1>
          <p className="text-gray-300 max-w-2xl">
            Tell us what you need and where, and we'll get back to you with availability and pricing. Same-day
            scheduling is often available.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

          {/* Contact info */}
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-[#1a2744] mb-4">Get in Touch</h2>
              <div className="space-y-4">
                <a
                  href={`tel:${shopInfo.phone.replace(/\D/g, "")}`}
                  className="flex items-start gap-3 p-4 bg-[#f5f0eb] rounded-xl hover:bg-[#eee5dc] transition-colors group"
                >
                  <div className="w-10 h-10 bg-[#e8600a] rounded-lg flex items-center justify-center shrink-0">
                    <Phone size={18} className="text-white" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 uppercase tracking-wide font-medium">Call or Text</div>
                    <div className="font-bold text-[#1a2744] group-hover:text-[#e8600a] transition-colors">
                      {shopInfo.phone}
                    </div>
                  </div>
                </a>

                <a
                  href={`mailto:${shopInfo.email}`}
                  className="flex items-start gap-3 p-4 bg-[#f5f0eb] rounded-xl hover:bg-[#eee5dc] transition-colors group"
                >
                  <div className="w-10 h-10 bg-[#e8600a] rounded-lg flex items-center justify-center shrink-0">
                    <Mail size={18} className="text-white" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 uppercase tracking-wide font-medium">Email</div>
                    <div className="font-bold text-[#1a2744] group-hover:text-[#e8600a] transition-colors text-sm break-all">
                      {shopInfo.email}
                    </div>
                  </div>
                </a>

                <div className="flex items-start gap-3 p-4 bg-[#f5f0eb] rounded-xl">
                  <div className="w-10 h-10 bg-[#1a2744] rounded-lg flex items-center justify-center shrink-0">
                    <MapPin size={18} className="text-white" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 uppercase tracking-wide font-medium">Based in</div>
                    <div className="font-bold text-[#1a2744]">{shopInfo.address}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-[#f5f0eb] rounded-xl">
                  <div className="w-10 h-10 bg-[#1a2744] rounded-lg flex items-center justify-center shrink-0">
                    <Clock size={18} className="text-white" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-1">Hours</div>
                    <div className="text-sm text-gray-700 space-y-0.5">
                      <div>{shopInfo.hours.weekdays}</div>
                      <div>{shopInfo.hours.saturday}</div>
                      <div className="text-gray-400">{shopInfo.hours.sunday}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* What to have ready */}
            <div className="border border-gray-200 rounded-xl p-5">
              <h3 className="font-bold text-[#1a2744] mb-3">Helpful to have ready:</h3>
              <ul className="space-y-2">
                {[
                  "Type of material needed",
                  "Approximate quantity (or project dimensions)",
                  "Delivery address and access notes",
                  "Preferred delivery date/time",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-gray-600">
                    <CheckCircle size={14} className="text-[#e8600a] shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-2">
            <ContactForm />
          </div>
        </div>
      </div>
    </div>
  );
}
