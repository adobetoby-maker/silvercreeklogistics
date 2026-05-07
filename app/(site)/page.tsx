import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  Phone,
  Calculator,
  MapPin,
  CheckCircle,
  ArrowRight,
  Truck,
  Package,
  Clock,
  Shield,
} from "lucide-react";
import { shopInfo } from "@/lib/shopInfo";
import { materials } from "@/lib/materials";

export const metadata: Metadata = {
  title: "Aggregate Delivery — Twin Falls, Idaho",
  description:
    "Aggregate hauling across Magic Valley, Idaho. Topsoil, gravel, road base, sand, fill dirt — delivered by our Mack super dump and side dump. Call today for a free quote.",
};

const services = [
  { icon: Package, label: "Topsoil & Fill Dirt", desc: "Screened topsoil and general fill for any project" },
  { icon: Truck, label: "Road Base & Pit Run", desc: "Compactable base for driveways, roads, and pads" },
  { icon: Package, label: "Sand & Gravel", desc: "Utility sand, pea gravel, and crushed gravel" },
  { icon: Shield, label: "Rip Rap & Rock", desc: "Erosion control and channel lining rock" },
  { icon: Truck, label: "Equipment Hauling", desc: "Track hoes, dozers, and heavy equipment — $165/hr" },
];

const popularMaterials = materials.filter((m) => m.popular);

export default function HomePage() {
  return (
    <>
      {/* ── Hero ── */}
      <section className="relative bg-[#1a2744] text-white overflow-hidden min-h-[580px] flex items-center">
        <div className="absolute inset-0">
          <Image
            src="/images/hero.jpg"
            alt="Silver Creek Logistics truck delivering topsoil at a Magic Valley job site"
            fill
            className="object-cover opacity-25"
            priority
          />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-[#e8600a]/20 border border-[#e8600a]/30 rounded-full px-4 py-1.5 text-sm text-[#f4a46a] mb-6">
              <MapPin size={14} />
              Serving Magic Valley, Idaho
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight mb-5">
              Aggregate Delivery
              <span className="block text-[#e8600a]">Done Right.</span>
            </h1>
            <p className="text-lg text-gray-300 mb-8 leading-relaxed">
              Silver Creek Logistics hauls topsoil, gravel, road base, sand, and fill dirt across Twin Falls and the
              entire Magic Valley region. Super dump and side dump available for any project size.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href={`tel:${shopInfo.phone.replace(/\D/g, "")}`}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[#e8600a] hover:bg-[#c4500a] text-white font-bold rounded-lg text-base transition-colors"
              >
                <Phone size={18} />
                Call {shopInfo.phone}
              </a>
              <Link
                href="/calculator"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold rounded-lg text-base transition-colors"
              >
                <Calculator size={18} />
                Material Calculator
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats bar ── */}
      <section className="bg-[#e8600a] text-white py-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            {[
              { value: "16–25", label: "Tons per load" },
              { value: "50 mi", label: "Delivery radius" },
              { value: "8+", label: "Materials available" },
              { value: "Same day", label: "Scheduling available" },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-2xl font-extrabold">{stat.value}</div>
                <div className="text-sm text-white/80">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Services overview ── */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-[#1a2744] mb-3">What We Haul</h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              We source materials from local Magic Valley pits and deliver direct to your job site — driveways,
              construction sites, farms, and landscaping projects.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {services.map(({ icon: Icon, label, desc }) => (
              <div key={label} className="bg-[#f5f0eb] rounded-xl p-6 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-[#e8600a]/10 rounded-lg flex items-center justify-center mb-4">
                  <Icon size={24} className="text-[#e8600a]" />
                </div>
                <h3 className="font-bold text-[#1a2744] mb-1">{label}</h3>
                <p className="text-sm text-gray-500">{desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/services" className="inline-flex items-center gap-1.5 text-[#e8600a] font-semibold hover:underline">
              View all materials <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Popular materials pricing ── */}
      <section className="py-16 bg-[#f5f0eb]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <h2 className="text-3xl font-extrabold text-[#1a2744] mb-2">Popular Materials</h2>
              <p className="text-gray-500">Delivered prices include hauling to Twin Falls area job sites.</p>
            </div>
            <Link href="/pricing" className="text-[#e8600a] font-semibold hover:underline flex items-center gap-1 shrink-0">
              Full price list <ArrowRight size={16} />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {popularMaterials.map((m) => (
              <div key={m.id} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="text-xs font-semibold uppercase tracking-wider text-[#e8600a] mb-2">{m.category}</div>
                <h3 className="text-lg font-bold text-[#1a2744] mb-2">{m.name}</h3>
                <p className="text-sm text-gray-500 mb-4">{m.description}</p>
                <div className="flex items-end justify-between">
                  <div>
                    <div className="text-2xl font-extrabold text-[#1a2744]">
                      ${m.deliveredPrice}
                      <span className="text-sm font-normal text-gray-500">/{m.unit}</span>
                    </div>
                    <div className="text-xs text-gray-400">delivered</div>
                  </div>
                  <Link href="/contact" className="px-3 py-1.5 bg-[#e8600a] hover:bg-[#c4500a] text-white text-sm font-semibold rounded transition-colors">
                    Order
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-[#1a2744] mb-3">How It Works</h2>
            <p className="text-gray-500">Three simple steps from call to delivery.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Tell us what you need",
                desc: "Call us or use the calculator to figure out what material and how much. We'll confirm availability from local pits.",
                icon: Phone,
              },
              {
                step: "02",
                title: "Schedule your delivery",
                desc: "We'll give you a delivery window that works with your project timeline. Same-day scheduling is often available.",
                icon: Clock,
              },
              {
                step: "03",
                title: "We deliver to your site",
                desc: "Our Mack super dump or side dump shows up on time and deposits your material exactly where you need it.",
                icon: Truck,
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
        </div>
      </section>

      {/* ── Calculator CTA ── */}
      <section className="py-16 bg-[#1a2744] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div>
              <h2 className="text-3xl font-extrabold mb-3">Not sure how much you need?</h2>
              <p className="text-gray-300 max-w-lg">
                Use our free material calculator. Enter your project dimensions and we'll tell you exactly how many tons
                or yards to order — and give you a rough price estimate.
              </p>
            </div>
            <Link
              href="/calculator"
              className="shrink-0 inline-flex items-center gap-2 px-8 py-4 bg-[#e8600a] hover:bg-[#c4500a] text-white font-bold rounded-lg text-lg transition-colors"
            >
              <Calculator size={22} />
              Open Calculator
            </Link>
          </div>
        </div>
      </section>

      {/* ── Trucks ── */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-[#1a2744] mb-3">Our Fleet</h2>
            <p className="text-gray-500">The right truck for every job — from single-yard landscaping fill to full-scale site prep.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {shopInfo.trucks.map((truck) => (
              <div key={truck.name} className="rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow">
                <div className="relative h-56">
                  <Image
                    src={truck.image}
                    alt={truck.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="bg-[#1a2744] text-white p-6">
                  <div className="text-xs font-semibold uppercase tracking-wider text-[#e8600a] mb-1">{truck.capacity} capacity</div>
                  <h3 className="text-xl font-bold mb-1">{truck.name}</h3>
                  <p className="text-gray-300 text-sm">{truck.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Service area ── */}
      <section className="py-16 bg-[#f5f0eb]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-extrabold text-[#1a2744] mb-3">Service Area</h2>
            <p className="text-gray-500">We deliver within ~50 miles of Twin Falls — the entire Magic Valley region.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {shopInfo.serviceArea.map((city) => (
              <div
                key={city}
                className="flex items-center gap-1.5 bg-white rounded-full px-4 py-2 text-sm font-medium text-[#1a2744] shadow-sm"
              >
                <CheckCircle size={14} className="text-[#e8600a]" />
                {city}
              </div>
            ))}
          </div>
          <p className="text-center text-gray-400 text-sm mt-6">
            Not on the list? Call us — we may still be able to help.
          </p>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="py-16 bg-[#e8600a] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-extrabold mb-3">Ready to order?</h2>
          <p className="text-white/80 mb-8 max-w-lg mx-auto">
            Call or send us a message and we'll get your delivery scheduled. Same-day service often available.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={`tel:${shopInfo.phone.replace(/\D/g, "")}`}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-[#e8600a] font-bold rounded-lg text-lg hover:bg-gray-100 transition-colors"
            >
              <Phone size={20} />
              {shopInfo.phone}
            </a>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#1a2744] text-white font-bold rounded-lg text-lg hover:bg-[#253359] transition-colors"
            >
              Send a Message
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
