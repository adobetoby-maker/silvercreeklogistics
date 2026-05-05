import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Phone, CheckCircle, MapPin, Clock, ArrowRight } from "lucide-react";
import { shopInfo } from "@/lib/shopInfo";
import { specialServices } from "@/lib/materials";

export const metadata: Metadata = {
  title: "Equipment Hauling — Twin Falls & Magic Valley | Silver Creek Logistics",
  description:
    "Equipment hauling in Twin Falls, Idaho. We move track hoes, excavators, dozers, skid steers, and farm equipment across Magic Valley. $165/hr. Call Silver Creek Logistics.",
};

const svc = specialServices[0];

const whatWeMoveItems = [
  { label: "Track Hoes & Excavators", detail: "Compact to full-size machines" },
  { label: "Dozers & Graders", detail: "Site prep and road equipment" },
  { label: "Skid Steers & Loaders", detail: "Bobcats, Cats, and similar" },
  { label: "Farm Equipment", detail: "Tractors, implements, attachments" },
];

export default function EquipmentHaulingPage() {
  return (
    <div className="bg-white">
      {/* Header */}
      <div className="bg-[#1a2744] text-white py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 bg-[#e8600a]/20 border border-[#e8600a]/30 rounded-full px-4 py-1.5 text-sm text-[#f4a46a] mb-5">
            <MapPin size={13} />
            Serving Magic Valley, Idaho
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-4">Equipment Hauling</h1>
          <p className="text-gray-300 max-w-2xl text-lg leading-relaxed">
            Need to move a track hoe, dozer, or skid steer across Magic Valley? We haul it. Flat hourly rate —
            no hidden fees, no broker markup.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 mt-8">
            <a
              href={`tel:${shopInfo.phone.replace(/\D/g, "")}`}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[#e8600a] hover:bg-[#c4500a] text-white font-bold rounded-lg transition-colors"
            >
              <Phone size={18} />
              Call {shopInfo.phone}
            </a>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold rounded-lg transition-colors"
            >
              Send a Message
            </Link>
          </div>
        </div>
      </div>

      {/* Rate callout */}
      <div className="bg-[#e8600a] text-white py-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-3xl font-extrabold">${svc.rate}/hr</div>
              <div className="text-sm text-white/80">Flat hourly rate</div>
            </div>
            <div>
              <div className="text-3xl font-extrabold">50 mi</div>
              <div className="text-sm text-white/80">Service radius</div>
            </div>
            <div>
              <div className="text-3xl font-extrabold">Same-day</div>
              <div className="text-sm text-white/80">Often available — call to confirm</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">

        {/* Photo + description */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="relative h-72 lg:h-96 rounded-xl overflow-hidden shadow-lg">
            <Image
              src={svc.image}
              alt="Silver Creek Logistics equipment hauling — track hoe at Magic Valley job site"
              fill
              className="object-cover"
            />
          </div>
          <div>
            <h2 className="text-3xl font-extrabold text-[#1a2744] mb-5">We Own Our Trucks</h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>
                When you book equipment hauling through Silver Creek Logistics, you're dealing directly with the operator —
                no broker, no middleman, no markup. We're based in Twin Falls and haul throughout the Magic Valley region.
              </p>
              <p>
                Our rate is ${svc.rate}/hr portal-to-portal. We'll confirm your equipment fits our configuration before
                we book — just give us a call and tell us what you're moving and where it's going.
              </p>
              <p>
                We work with contractors, landscapers, farmers, and construction crews across Twin Falls, Jerome,
                Burley, Gooding, and surrounding areas.
              </p>
            </div>
            <a
              href={`tel:${shopInfo.phone.replace(/\D/g, "")}`}
              className="inline-flex items-center gap-2 mt-6 px-5 py-3 bg-[#e8600a] hover:bg-[#c4500a] text-white font-bold rounded-lg transition-colors"
            >
              <Phone size={16} />
              Call to Book — {shopInfo.phone}
            </a>
          </div>
        </section>

        {/* What we move */}
        <section>
          <h2 className="text-2xl font-extrabold text-[#1a2744] mb-6">What We Move</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {whatWeMoveItems.map(({ label, detail }) => (
              <div key={label} className="flex items-start gap-4 bg-[#f5f0eb] rounded-xl p-5">
                <CheckCircle size={20} className="text-[#e8600a] shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-[#1a2744]">{label}</div>
                  <div className="text-sm text-gray-500 mt-0.5">{detail}</div>
                </div>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-400 mt-4">
            Not sure if your equipment fits? Call us — we'll tell you right away.
          </p>
        </section>

        {/* How it works */}
        <section>
          <h2 className="text-2xl font-extrabold text-[#1a2744] mb-8">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                icon: Phone,
                title: "Call us first",
                desc: `Tell us what you're moving, where from, and where to. We'll confirm it fits and give you a time estimate.`,
              },
              {
                step: "02",
                icon: Clock,
                title: "Schedule a time",
                desc: "We'll set a pickup window that works for your schedule. Same-day service is often available.",
              },
              {
                step: "03",
                icon: MapPin,
                title: "We show up and haul it",
                desc: `We load, transport, and set down your equipment. Billing is portal-to-portal at $${svc.rate}/hr.`,
              },
            ].map(({ step, title, desc, icon: Icon }) => (
              <div key={step} className="relative">
                <div className="text-7xl font-extrabold text-[#e8600a]/10 absolute -top-3 -left-2 leading-none select-none">
                  {step}
                </div>
                <div className="relative pt-8">
                  <div className="w-12 h-12 bg-[#1a2744] rounded-lg flex items-center justify-center mb-4">
                    <Icon size={22} className="text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-[#1a2744] mb-2">{title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Service area */}
        <section>
          <h2 className="text-2xl font-extrabold text-[#1a2744] mb-3">Service Area</h2>
          <p className="text-gray-500 mb-6">We haul equipment within approximately 50 miles of Twin Falls.</p>
          <div className="flex flex-wrap gap-2">
            {shopInfo.serviceArea.map((city) => (
              <span key={city} className="flex items-center gap-1.5 bg-[#f5f0eb] rounded-full px-3 py-1.5 text-sm text-[#1a2744]">
                <MapPin size={12} className="text-[#e8600a]" />
                {city}
              </span>
            ))}
          </div>
        </section>

        {/* Also haul aggregate CTA */}
        <section className="bg-[#f5f0eb] rounded-xl p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-xl font-bold text-[#1a2744] mb-1">Need aggregate delivered too?</h2>
            <p className="text-gray-500 text-sm">
              We also haul topsoil, gravel, road base, sand, and fill dirt — delivered by the load.
            </p>
          </div>
          <Link
            href="/services"
            className="shrink-0 inline-flex items-center gap-2 px-5 py-3 bg-[#1a2744] text-white font-bold rounded-lg hover:bg-[#253359] transition-colors"
          >
            View All Materials <ArrowRight size={16} />
          </Link>
        </section>

        {/* Final CTA */}
        <section className="bg-[#e8600a] text-white rounded-xl p-8 text-center">
          <h2 className="text-2xl font-bold mb-2">Ready to schedule a haul?</h2>
          <p className="text-white/80 mb-6 max-w-md mx-auto text-sm">
            Call us and we'll confirm availability, get the details, and put you on the schedule.
          </p>
          <a
            href={`tel:${shopInfo.phone.replace(/\D/g, "")}`}
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-[#e8600a] font-bold rounded-lg text-lg hover:bg-gray-100 transition-colors"
          >
            <Phone size={20} />
            {shopInfo.phone}
          </a>
        </section>

      </div>
    </div>
  );
}
