import type { Metadata } from "next";
import Link from "next/link";
import { Info, Phone, Calculator } from "lucide-react";
import { materials, deliveryZones, truckingRates, specialServices } from "@/lib/materials";
import { shopInfo } from "@/lib/shopInfo";

export const metadata: Metadata = {
  title: "Aggregate Pricing — Delivered Rates Magic Valley Idaho",
  description:
    "Current aggregate delivery pricing for Twin Falls and Magic Valley, Idaho. Topsoil, gravel, road base, fill dirt, sand — pit prices and delivered rates listed.",
};

export default function PricingPage() {
  return (
    <div className="bg-white">
      {/* Header */}
      <div className="bg-[#1a2744] text-white py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-extrabold mb-3">Materials & Pricing</h1>
          <p className="text-gray-300 max-w-2xl">
            Transparent pricing — pit cost, our delivered price, and load sizes. All delivered prices are based on
            Twin Falls area delivery. Distance surcharges may apply beyond 20 miles.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Info notice */}
        <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-lg p-4 mb-10">
          <Info size={18} className="text-blue-500 shrink-0 mt-0.5" />
          <p className="text-sm text-blue-700">
            Prices reflect current market conditions and may change without notice. Delivery pricing is based on Twin
            Falls as the origin point. Call for a firm quote on your specific job site location.
          </p>
        </div>

        {/* Main pricing table */}
        <div className="rounded-xl border border-gray-200 overflow-hidden mb-12">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#1a2744] text-white">
                <th className="px-4 py-3 text-left font-semibold">Material</th>
                <th className="px-4 py-3 text-left font-semibold hidden sm:table-cell">Category</th>
                <th className="px-4 py-3 text-right font-semibold">Pit Price</th>
                <th className="px-4 py-3 text-right font-semibold">Delivered*</th>
                <th className="px-4 py-3 text-right font-semibold hidden md:table-cell">Unit</th>
                <th className="px-4 py-3 text-right font-semibold hidden lg:table-cell">Min Load</th>
              </tr>
            </thead>
            <tbody>
              {materials.map((m, i) => (
                <tr
                  key={m.id}
                  id={m.id}
                  className={`border-t border-gray-100 ${i % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-[#f5f0eb] transition-colors`}
                >
                  <td className="px-4 py-4">
                    <div className="font-semibold text-[#1a2744]">{m.name}</div>
                    <div className="text-xs text-gray-400 mt-0.5 max-w-xs">{m.description.slice(0, 60)}…</div>
                  </td>
                  <td className="px-4 py-4 text-gray-500 hidden sm:table-cell">{m.category}</td>
                  <td className="px-4 py-4 text-right text-gray-500">
                    ${m.pitPrice}/{m.unit}
                  </td>
                  <td className="px-4 py-4 text-right">
                    <span className="font-bold text-[#e8600a] text-base">${m.deliveredPrice}</span>
                    <span className="text-gray-400">/{m.unit}</span>
                  </td>
                  <td className="px-4 py-4 text-right text-gray-500 hidden md:table-cell capitalize">{m.unit}</td>
                  <td className="px-4 py-4 text-right text-gray-500 hidden lg:table-cell">{m.minLoad} tons</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Delivery pricing */}
        <section className="mb-12">
          <h2 className="text-2xl font-extrabold text-[#1a2744] mb-6">Delivery Pricing</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#f5f0eb] rounded-xl p-6">
              <h3 className="font-bold text-[#1a2744] mb-4">Delivery Zones</h3>
              <div className="space-y-3 text-sm">
                {deliveryZones.map((zone) => (
                  <div key={zone.label} className="flex justify-between">
                    <span className="text-gray-600">{zone.label}</span>
                    <span className="font-semibold text-[#1a2744]">${zone.fee}</span>
                  </div>
                ))}
                <div className="pt-2 border-t border-gray-200 text-xs text-gray-400">
                  Delivery fee is in addition to the material price. Call for exact distance to your site.
                </div>
              </div>
            </div>
            <div className="bg-[#f5f0eb] rounded-xl p-6">
              <h3 className="font-bold text-[#1a2744] mb-4">Truck Capacity</h3>
              <div className="space-y-3 text-sm">
                {shopInfo.trucks.map((truck) => (
                  <div key={truck.name} className="flex justify-between">
                    <span className="text-gray-600">{truck.name}</span>
                    <span className="font-semibold text-[#1a2744]">{truck.capacity}</span>
                  </div>
                ))}
                <div className="pt-2 border-t border-gray-200 text-xs text-gray-400">
                  {truckingRates.description}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Equipment Hauling */}
        <section className="mb-12">
          <h2 className="text-2xl font-extrabold text-[#1a2744] mb-6">Equipment Hauling</h2>
          <div className="rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#1a2744] text-white">
                  <th className="px-4 py-3 text-left font-semibold">Service</th>
                  <th className="px-4 py-3 text-left font-semibold hidden sm:table-cell">What We Move</th>
                  <th className="px-4 py-3 text-right font-semibold">Rate</th>
                </tr>
              </thead>
              <tbody>
                {specialServices.map((svc) => (
                  <tr key={svc.id} className="border-t border-gray-100 bg-white hover:bg-[#f5f0eb] transition-colors">
                    <td className="px-4 py-4">
                      <div className="font-semibold text-[#1a2744]">{svc.name}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{svc.description.slice(0, 60)}…</div>
                    </td>
                    <td className="px-4 py-4 text-gray-500 hidden sm:table-cell">
                      {svc.uses.join(", ")}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <span className="font-bold text-[#e8600a] text-base">${svc.rate}</span>
                      <span className="text-gray-400">/{svc.rateUnit}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-400 mt-3">Call to confirm equipment fit and availability before booking.</p>
        </section>

        {/* Example estimates */}
        <section className="mb-12">
          <h2 className="text-2xl font-extrabold text-[#1a2744] mb-2">Example Project Estimates</h2>
          <p className="text-gray-500 text-sm mb-6">Rough estimates for common projects delivered within 10 miles of Twin Falls.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { project: "Standard Driveway (200 ft × 12 ft, 4\" deep)", material: "Road Base", qty: "~30 tons", est: "$1,100–1,300" },
              { project: "Small Driveway (100 ft × 12 ft, 4\" deep)", material: "Road Base", qty: "~15 tons", est: "$595–700" },
              { project: "Lawn Topsoil (2,000 sq ft, 4\" deep)", material: "Screened Topsoil", qty: "~25 yds", est: "$1,130–1,300" },
              { project: "Backyard Fill (40 × 60 ft, 12\" deep)", material: "Fill Dirt", qty: "~90 yds", est: "$2,600–3,100" },
              { project: "Gravel Parking Pad (30 × 40 ft, 4\" deep)", material: "3/4\" Gravel", qty: "~20 tons", est: "$885–1,000" },
              { project: "French Drain (150 ft trench)", material: "Pea Gravel", qty: "~8 tons", est: "$455–520" },
            ].map(({ project, material, qty, est }) => (
              <div key={project} className="border border-gray-200 rounded-lg p-4">
                <div className="font-semibold text-[#1a2744] text-sm mb-1">{project}</div>
                <div className="text-xs text-gray-500 mb-2">{material} · {qty}</div>
                <div className="text-lg font-extrabold text-[#e8600a]">{est}</div>
                <div className="text-xs text-gray-400">estimated total</div>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-4">
            * All estimates are approximate. Use our <Link href="/calculator" className="text-[#e8600a] underline">material calculator</Link> or call for a precise quote.
          </p>
        </section>

        {/* CTA */}
        <div className="bg-[#1a2744] text-white rounded-xl p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-bold mb-1">Ready to place an order?</h3>
            <p className="text-gray-300 text-sm">Call us for a firm quote on your specific project and location.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <a
              href={`tel:${shopInfo.phone.replace(/\D/g, "")}`}
              className="inline-flex items-center gap-2 px-5 py-3 bg-[#e8600a] hover:bg-[#c4500a] text-white font-bold rounded-lg transition-colors"
            >
              <Phone size={16} />
              {shopInfo.phone}
            </a>
            <Link
              href="/calculator"
              className="inline-flex items-center gap-2 px-5 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg transition-colors"
            >
              <Calculator size={16} />
              Calculator
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
