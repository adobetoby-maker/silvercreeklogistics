import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Truck, CheckCircle, MapPin, Phone } from "lucide-react";
import { shopInfo } from "@/lib/shopInfo";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "A Twin Falls, Idaho trucking company built on showing up and doing the job right. We own our trucks — no broker, no middleman. Serving Magic Valley aggregate hauling needs.",
};

export default function AboutPage() {
  return (
    <div className="bg-white">
      {/* Header */}
      <div className="bg-[#1a2744] text-white py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-extrabold mb-3">About Silver Creek Logistics</h1>
          <p className="text-gray-300 max-w-2xl">
            A small Twin Falls trucking operation with big-job capability. We own our equipment, source from local pits,
            and deliver on time — no broker markup, no runaround.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

        {/* Story */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16 items-center">
          <div>
            <h2 className="text-3xl font-extrabold text-[#1a2744] mb-5">We Own Our Trucks</h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>
                Silver Creek Logistics is a Magic Valley aggregate hauling company based in Twin Falls, Idaho. We run a
                Mack super dump and a side dump — both operated and maintained by us, not farmed out to a broker.
              </p>
              <p>
                When you call us, you're talking to the people who drive the trucks and know the local pits. We source
                from suppliers like Premier Aggregates' Crystal Springs Pit in Filer and other Magic Valley sources, so
                we know what's available, what the quality looks like, and what makes sense for your project.
              </p>
              <p>
                We haul for landscapers, contractors, farmers, and homeowners across the Twin Falls area. Whether you
                need five tons of screened topsoil for a backyard project or a full super dump of road base for a new
                driveway, we'll get it there.
              </p>
            </div>
          </div>
          <div className="relative h-72 lg:h-96 rounded-xl overflow-hidden shadow-lg">
            <Image
              src="/images/about-fleet.jpg"
              alt="Silver Creek Logistics fleet at a Magic Valley job site"
              fill
              className="object-cover"
            />
          </div>
        </div>

        {/* Why us */}
        <div className="bg-[#f5f0eb] rounded-2xl p-8 mb-16">
          <h2 className="text-2xl font-extrabold text-[#1a2744] mb-6">Why Work With Us</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              "We own our equipment — no broker markup or middleman",
              "Local pit sourcing — we know the Crystal Springs and Magic Valley supply chain",
              "Two truck types — super dump for efficiency, side dump for larger or awkward loads",
              "Same-day scheduling often available",
              "Transparent pricing — what you see is what you pay",
              "Serving all of Magic Valley within a 50-mile radius",
            ].map((point) => (
              <div key={point} className="flex items-start gap-3 bg-white rounded-lg p-4">
                <CheckCircle size={16} className="text-[#e8600a] shrink-0 mt-0.5" />
                <span className="text-sm text-gray-700">{point}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Fleet */}
        <div className="mb-16">
          <h2 className="text-2xl font-extrabold text-[#1a2744] mb-6">Our Fleet</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {shopInfo.trucks.map((truck) => (
              <div key={truck.name} className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                <div className="relative h-52">
                  <Image src={truck.image} alt={truck.name} fill className="object-cover" />
                </div>
                <div className="p-5">
                  <div className="text-xs font-semibold uppercase tracking-wider text-[#e8600a] mb-1">
                    {truck.capacity} payload
                  </div>
                  <h3 className="text-xl font-bold text-[#1a2744] mb-2">{truck.name}</h3>
                  <p className="text-sm text-gray-500">{truck.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Service area */}
        <div className="mb-16">
          <h2 className="text-2xl font-extrabold text-[#1a2744] mb-3">Service Area</h2>
          <p className="text-gray-500 mb-6">
            We deliver within approximately 50 miles of Twin Falls — covering the full Magic Valley region.
          </p>
          <div className="flex flex-wrap gap-2">
            {shopInfo.serviceArea.map((city) => (
              <span key={city} className="flex items-center gap-1.5 bg-[#f5f0eb] rounded-full px-3 py-1.5 text-sm text-[#1a2744]">
                <MapPin size={12} className="text-[#e8600a]" />
                {city}
              </span>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="bg-[#e8600a] text-white rounded-xl p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-xl font-bold mb-1">Ready to get started?</h2>
            <p className="text-white/80 text-sm">Call or message us and we'll get your delivery on the calendar.</p>
          </div>
          <div className="flex gap-3 shrink-0">
            <a
              href={`tel:${shopInfo.phone.replace(/\D/g, "")}`}
              className="inline-flex items-center gap-2 px-5 py-3 bg-white text-[#e8600a] font-bold rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Phone size={16} />
              {shopInfo.phone}
            </a>
            <Link
              href="/contact"
              className="inline-flex items-center px-5 py-3 bg-[#1a2744] text-white font-semibold rounded-lg hover:bg-[#253359] transition-colors"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
