import type { Metadata } from "next";
import MaterialCalculator from "@/components/MaterialCalculator";
import Link from "next/link";
import { Phone } from "lucide-react";
import { shopInfo } from "@/lib/shopInfo";

export const metadata: Metadata = {
  title: "Material Calculator — How Much Do You Need?",
  description:
    "Free aggregate calculator for Magic Valley, Idaho projects. Calculate cubic yards and tons of topsoil, gravel, road base, sand, and fill dirt for driveways, patios, lawns, and more.",
};

export default function CalculatorPage() {
  return (
    <div className="bg-[#f5f0eb] min-h-screen">
      {/* Header */}
      <div className="bg-[#1a2744] text-white py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-extrabold mb-3">Material Calculator</h1>
          <p className="text-gray-300 max-w-2xl">
            Enter your project dimensions below to estimate how much material you need. We'll show you cubic yards,
            tons, number of truck loads, and a price estimate.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <MaterialCalculator />

        {/* After calculator CTA */}
        <div className="mt-12 bg-[#1a2744] text-white rounded-xl p-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <h2 className="text-xl font-bold mb-1">Got your numbers? Call us to order.</h2>
              <p className="text-gray-300 text-sm">
                We'll confirm availability and get a delivery scheduled — same-day often available.
              </p>
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
                href="/contact"
                className="inline-flex items-center justify-center px-5 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg transition-colors"
              >
                Send a Message
              </Link>
            </div>
          </div>
        </div>

        {/* Reference table */}
        <div className="mt-10 bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-[#1a2744] mb-4">Quick Reference — Common Projects</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="pb-2 text-left text-gray-500 font-medium">Project</th>
                  <th className="pb-2 text-right text-gray-500 font-medium">Depth</th>
                  <th className="pb-2 text-right text-gray-500 font-medium">Cu Yards</th>
                  <th className="pb-2 text-right text-gray-500 font-medium">Tons (gravel)</th>
                  <th className="pb-2 text-right text-gray-500 font-medium">Tons (topsoil)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {[
                  { project: "10×10 patio", depth: '4"', cy: "1.2", gravel: "1.7", topsoil: "1.1" },
                  { project: "20×20 patio", depth: '4"', cy: "4.9", gravel: "6.9", topsoil: "4.4" },
                  { project: "Short driveway (50×12 ft)", depth: '4"', cy: "7.4", gravel: "10.4", topsoil: "6.7" },
                  { project: "Standard driveway (200×12 ft)", depth: '4"', cy: "29.6", gravel: "41.4", topsoil: "26.7" },
                  { project: "500 sq ft lawn topsoil", depth: '4"', cy: "6.2", gravel: "—", topsoil: "5.5" },
                  { project: "1,000 sq ft lawn topsoil", depth: '4"', cy: "12.3", gravel: "—", topsoil: "11.1" },
                  { project: "Parking pad (20×30 ft)", depth: '6"', cy: "11.1", gravel: "15.5", topsoil: "—" },
                ].map((row) => (
                  <tr key={row.project} className="hover:bg-gray-50">
                    <td className="py-2.5 font-medium text-[#1a2744]">{row.project}</td>
                    <td className="py-2.5 text-right text-gray-500">{row.depth}</td>
                    <td className="py-2.5 text-right text-gray-700">{row.cy} CY</td>
                    <td className="py-2.5 text-right text-gray-700">{row.gravel}</td>
                    <td className="py-2.5 text-right text-gray-700">{row.topsoil}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-400 mt-4">
            Includes 10–15% overage. Gravel density: 1.4 tons/CY · Topsoil: 0.9 tons/CY.
          </p>
        </div>
      </div>
    </div>
  );
}
