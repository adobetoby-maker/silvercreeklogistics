import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle, Phone, Calculator, ArrowRight } from "lucide-react";
import Image from "next/image";
import { materials, categories, specialServices } from "@/lib/materials";
import { shopInfo } from "@/lib/shopInfo";

export const metadata: Metadata = {
  title: "Aggregate Materials & Hauling Services",
  description:
    "Full list of aggregate materials available for delivery in Magic Valley, Idaho — topsoil, fill dirt, road base, gravel, sand, rip rap, and more. Silver Creek Logistics LLC.",
};

export default function ServicesPage() {
  return (
    <div className="bg-white">
      {/* Page header */}
      <div className="bg-[#1a2744] text-white py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-extrabold mb-3">Materials & Services</h1>
          <p className="text-gray-300 max-w-2xl">
            We haul eight types of aggregate materials sourced from local Magic Valley pits. Every load is delivered
            direct to your job site — no middleman, no hassle.
          </p>
        </div>
      </div>

      {/* Materials by category */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
        {categories.map((cat) => {
          const catMaterials = materials.filter((m) => m.category === cat);
          return (
            <section key={cat}>
              <h2 className="text-2xl font-extrabold text-[#1a2744] mb-6 pb-3 border-b border-gray-200">
                {cat}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {catMaterials.map((m) => (
                  <div
                    key={m.id}
                    id={m.id}
                    className="border border-gray-200 rounded-xl p-6 hover:border-[#e8600a]/40 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <h3 className="text-lg font-bold text-[#1a2744]">{m.name}</h3>
                      <div className="text-right shrink-0">
                        <div className="text-xl font-extrabold text-[#e8600a]">
                          ${m.deliveredPrice}
                          <span className="text-sm font-normal text-gray-500">/{m.unit}</span>
                        </div>
                        <div className="text-xs text-gray-400">delivered</div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 mb-4">{m.description}</p>
                    <ul className="space-y-1.5 mb-4">
                      {m.uses.map((use) => (
                        <li key={use} className="flex items-center gap-2 text-sm text-gray-600">
                          <CheckCircle size={14} className="text-[#e8600a] shrink-0" />
                          {use}
                        </li>
                      ))}
                    </ul>
                    <div className="flex gap-3 text-xs text-gray-400 pt-3 border-t border-gray-100">
                      <span>Min load: {m.minLoad} tons</span>
                      <span>·</span>
                      <span>Super dump: {m.superDumpLoad} tons</span>
                      <span>·</span>
                      <span>Side dump: {m.sideDumpLoad} tons</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </div>

      {/* Equipment Hauling */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {specialServices.map((svc) => (
          <section key={svc.id} id={svc.id}>
            <h2 className="text-2xl font-extrabold text-[#1a2744] mb-6 pb-3 border-b border-gray-200">
              {svc.category}
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div className="relative h-64 rounded-xl overflow-hidden shadow-md">
                <Image src={svc.image} alt={svc.name} fill className="object-cover" />
              </div>
              <div>
                <div className="text-3xl font-extrabold text-[#e8600a] mb-1">
                  ${svc.rate}<span className="text-lg font-normal text-gray-500">/{svc.rateUnit}</span>
                </div>
                <h3 className="text-xl font-bold text-[#1a2744] mb-3">{svc.name}</h3>
                <p className="text-gray-500 mb-5">{svc.description}</p>
                <ul className="space-y-2">
                  {svc.uses.map((use) => (
                    <li key={use} className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle size={14} className="text-[#e8600a] shrink-0" />
                      {use}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        ))}
      </div>

      {/* Bottom CTAs */}
      <div className="bg-[#f5f0eb] py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 text-center">
              <Calculator size={28} className="text-[#e8600a] mx-auto mb-3" />
              <h3 className="font-bold text-[#1a2744] mb-2">Calculate your order</h3>
              <p className="text-sm text-gray-500 mb-4">Enter your project dimensions and we'll tell you exactly how much to order.</p>
              <Link href="/calculator" className="inline-flex items-center gap-1 text-[#e8600a] font-semibold text-sm hover:underline">
                Open Calculator <ArrowRight size={14} />
              </Link>
            </div>
            <div className="bg-white rounded-xl p-6 text-center">
              <Phone size={28} className="text-[#e8600a] mx-auto mb-3" />
              <h3 className="font-bold text-[#1a2744] mb-2">Call to order</h3>
              <p className="text-sm text-gray-500 mb-4">Talk to us directly. We'll confirm availability and schedule your delivery.</p>
              <a href={`tel:${shopInfo.phone.replace(/\D/g, "")}`} className="inline-flex items-center gap-1 text-[#e8600a] font-semibold text-sm hover:underline">
                {shopInfo.phone} <ArrowRight size={14} />
              </a>
            </div>
            <div className="bg-white rounded-xl p-6 text-center">
              <CheckCircle size={28} className="text-[#e8600a] mx-auto mb-3" />
              <h3 className="font-bold text-[#1a2744] mb-2">View full pricing</h3>
              <p className="text-sm text-gray-500 mb-4">See a complete breakdown of material and delivery pricing.</p>
              <Link href="/pricing" className="inline-flex items-center gap-1 text-[#e8600a] font-semibold text-sm hover:underline">
                Pricing Table <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
