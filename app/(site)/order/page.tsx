import type { Metadata } from "next";
import OrderRequestForm from "@/components/OrderRequestForm";
import { Phone, Clock, Calculator } from "lucide-react";
import { shopInfo } from "@/lib/shopInfo";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Request a Load — Order Aggregate Delivery",
  description: "Request a delivery of topsoil, gravel, road base, sand, or fill dirt to your site. Silver Creek Logistics serves all of Magic Valley, Idaho.",
};

export default function OrderPage() {
  return (
    <div className="bg-[#f5f0eb] min-h-screen">
      <div className="bg-[#1a2744] text-white py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-extrabold mb-3">Request a Load</h1>
          <p className="text-gray-300 max-w-2xl">
            Fill out the form and we'll confirm your delivery within 30 minutes. Same-day scheduling often available.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2">
            <OrderRequestForm />
          </div>

          <div className="space-y-5">
            <a href={`tel:${shopInfo.phone.replace(/\D/g, "")}`}
              className="flex items-start gap-3 p-5 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 group">
              <div className="w-10 h-10 bg-[#e8600a] rounded-lg flex items-center justify-center shrink-0">
                <Phone size={18} className="text-white" />
              </div>
              <div>
                <div className="text-xs text-gray-400 uppercase tracking-wide font-medium">Call or Text</div>
                <div className="font-bold text-[#1a2744] group-hover:text-[#e8600a] transition-colors">{shopInfo.phone}</div>
                <div className="text-xs text-gray-400 mt-0.5">Fastest way to get scheduled</div>
              </div>
            </a>

            <div className="flex items-start gap-3 p-5 bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="w-10 h-10 bg-[#1a2744] rounded-lg flex items-center justify-center shrink-0">
                <Clock size={18} className="text-white" />
              </div>
              <div>
                <div className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-1">Hours</div>
                <div className="text-sm text-gray-700">
                  <div>{shopInfo.hours.weekdays}</div>
                  <div>{shopInfo.hours.saturday}</div>
                  <div className="text-gray-400">{shopInfo.hours.sunday}</div>
                </div>
              </div>
            </div>

            <div className="bg-[#e8600a]/10 border border-[#e8600a]/20 rounded-xl p-5">
              <h3 className="font-bold text-[#1a2744] mb-2 text-sm">Not sure how much to order?</h3>
              <p className="text-xs text-gray-600 mb-3">Use our free calculator to figure out cubic yards, tons, and loads for your project.</p>
              <Link href="/calculator"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#e8600a] hover:underline">
                <Calculator size={14} /> Open Calculator
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
