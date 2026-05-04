"use client";

import { useState, useMemo } from "react";
import { Calculator, Truck, Package, AlertCircle } from "lucide-react";
import { materials, deliveryZones } from "@/lib/materials";
import Link from "next/link";

type Shape = "rectangle" | "circle" | "triangle";

const shapeOptions: { value: Shape; label: string }[] = [
  { value: "rectangle", label: "Rectangle / Square" },
  { value: "circle", label: "Circle" },
  { value: "triangle", label: "Triangle" },
];

function calcCubicYards(shape: Shape, dims: Record<string, number>, depthIn: number): number {
  const depthFt = depthIn / 12;
  if (shape === "rectangle") {
    return (dims.length * dims.width * depthFt) / 27;
  }
  if (shape === "circle") {
    return (Math.PI * dims.radius * dims.radius * depthFt) / 27;
  }
  if (shape === "triangle") {
    return (0.5 * dims.base * dims.height * depthFt) / 27;
  }
  return 0;
}

export default function MaterialCalculator() {
  const [shape, setShape] = useState<Shape>("rectangle");
  const [materialId, setMaterialId] = useState(materials[0].id);
  const [zoneIdx, setZoneIdx] = useState(0);
  const [depth, setDepth] = useState("4");

  // Dimension state
  const [length, setLength] = useState("");
  const [width, setWidth] = useState("");
  const [radius, setRadius] = useState("");
  const [base, setBase] = useState("");
  const [triangleHeight, setTriangleHeight] = useState("");

  const selectedMaterial = materials.find((m) => m.id === materialId)!;
  const selectedZone = deliveryZones[zoneIdx];

  const results = useMemo(() => {
    const depthVal = parseFloat(depth) || 0;
    const dims: Record<string, number> = {
      length: parseFloat(length) || 0,
      width: parseFloat(width) || 0,
      radius: parseFloat(radius) || 0,
      base: parseFloat(base) || 0,
      height: parseFloat(triangleHeight) || 0,
    };

    const rawCY = calcCubicYards(shape, dims, depthVal);
    if (rawCY <= 0) return null;

    // Add 12% overage buffer
    const cy = rawCY * 1.12;
    const tons = cy * selectedMaterial.tonsPerYard;

    const superDumpLoads = Math.ceil(tons / selectedMaterial.superDumpLoad);
    const sideDumpLoads = Math.ceil(tons / selectedMaterial.sideDumpLoad);

    // Material cost
    let materialCost: number;
    if (selectedMaterial.unit === "ton") {
      materialCost = tons * selectedMaterial.deliveredPrice;
    } else {
      materialCost = cy * selectedMaterial.deliveredPrice;
    }

    const totalWithDelivery = materialCost + selectedZone.fee;

    return {
      rawCY,
      cy,
      tons,
      superDumpLoads,
      sideDumpLoads,
      materialCost,
      totalWithDelivery,
    };
  }, [shape, materialId, depth, length, width, radius, base, triangleHeight, zoneIdx, selectedMaterial, selectedZone]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Input panel */}
      <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
        <div className="flex items-center gap-2 text-[#1a2744] font-bold text-lg">
          <Calculator size={22} className="text-[#e8600a]" />
          Project Details
        </div>

        {/* Material */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Material</label>
          <select
            value={materialId}
            onChange={(e) => setMaterialId(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#e8600a] focus:border-transparent"
          >
            {materials.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} — ${m.deliveredPrice}/{m.unit} delivered
              </option>
            ))}
          </select>
        </div>

        {/* Shape */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Project Shape</label>
          <div className="flex gap-2 flex-wrap">
            {shapeOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setShape(opt.value)}
                className={`px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
                  shape === opt.value
                    ? "bg-[#e8600a] border-[#e8600a] text-white"
                    : "bg-white border-gray-300 text-gray-600 hover:border-[#e8600a]"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Dimensions */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Dimensions (feet)</label>
          <div className="grid grid-cols-2 gap-3">
            {shape === "rectangle" && (
              <>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Length (ft)</label>
                  <input
                    type="number"
                    min="0"
                    value={length}
                    onChange={(e) => setLength(e.target.value)}
                    placeholder="e.g. 200"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#e8600a]"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Width (ft)</label>
                  <input
                    type="number"
                    min="0"
                    value={width}
                    onChange={(e) => setWidth(e.target.value)}
                    placeholder="e.g. 12"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#e8600a]"
                  />
                </div>
              </>
            )}
            {shape === "circle" && (
              <div className="col-span-2">
                <label className="block text-xs text-gray-500 mb-1">Radius (ft)</label>
                <input
                  type="number"
                  min="0"
                  value={radius}
                  onChange={(e) => setRadius(e.target.value)}
                  placeholder="e.g. 10"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#e8600a]"
                />
              </div>
            )}
            {shape === "triangle" && (
              <>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Base (ft)</label>
                  <input
                    type="number"
                    min="0"
                    value={base}
                    onChange={(e) => setBase(e.target.value)}
                    placeholder="e.g. 30"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#e8600a]"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Height (ft)</label>
                  <input
                    type="number"
                    min="0"
                    value={triangleHeight}
                    onChange={(e) => setTriangleHeight(e.target.value)}
                    placeholder="e.g. 20"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#e8600a]"
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Depth */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Depth (inches)</label>
          <div className="flex gap-2 flex-wrap mb-2">
            {["2", "3", "4", "6", "8", "12"].map((d) => (
              <button
                key={d}
                onClick={() => setDepth(d)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                  depth === d
                    ? "bg-[#1a2744] border-[#1a2744] text-white"
                    : "bg-white border-gray-300 text-gray-600 hover:border-[#1a2744]"
                }`}
              >
                {d}&quot;
              </button>
            ))}
          </div>
          <input
            type="number"
            min="1"
            max="60"
            value={depth}
            onChange={(e) => setDepth(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#e8600a]"
          />
        </div>

        {/* Delivery zone */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Delivery Zone</label>
          <select
            value={zoneIdx}
            onChange={(e) => setZoneIdx(Number(e.target.value))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#e8600a]"
          >
            {deliveryZones.map((z, i) => (
              <option key={z.label} value={i}>
                {z.label} (+${z.fee} delivery)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Results panel */}
      <div className="space-y-4">
        {!results ? (
          <div className="bg-white rounded-xl shadow-sm p-8 flex flex-col items-center justify-center text-center min-h-64">
            <Package size={40} className="text-gray-300 mb-3" />
            <p className="text-gray-400 text-sm">Enter your project dimensions to see your estimate.</p>
          </div>
        ) : (
          <>
            {/* Volume + weight */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-bold text-[#1a2744] mb-4">Material Estimate</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#f5f0eb] rounded-lg p-4">
                  <div className="text-2xl font-extrabold text-[#1a2744]">
                    {results.cy.toFixed(1)}
                  </div>
                  <div className="text-sm text-gray-500">cubic yards</div>
                  <div className="text-xs text-gray-400 mt-0.5">({results.rawCY.toFixed(1)} CY + 12% buffer)</div>
                </div>
                <div className="bg-[#f5f0eb] rounded-lg p-4">
                  <div className="text-2xl font-extrabold text-[#1a2744]">
                    {results.tons.toFixed(1)}
                  </div>
                  <div className="text-sm text-gray-500">tons</div>
                  <div className="text-xs text-gray-400 mt-0.5">{selectedMaterial.tonsPerYard} tons/CY</div>
                </div>
              </div>
            </div>

            {/* Truck loads */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center gap-2 font-bold text-[#1a2744] mb-4">
                <Truck size={18} className="text-[#e8600a]" />
                Truck Loads Needed
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="text-2xl font-extrabold text-[#e8600a]">{results.superDumpLoads}</div>
                  <div className="text-sm font-semibold text-[#1a2744]">Super Dump</div>
                  <div className="text-xs text-gray-400">{selectedMaterial.superDumpLoad} tons/load</div>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="text-2xl font-extrabold text-[#e8600a]">{results.sideDumpLoads}</div>
                  <div className="text-sm font-semibold text-[#1a2744]">Side Dump</div>
                  <div className="text-xs text-gray-400">{selectedMaterial.sideDumpLoad} tons/load</div>
                </div>
              </div>
            </div>

            {/* Price estimate */}
            <div className="bg-[#1a2744] text-white rounded-xl p-6">
              <h3 className="font-bold mb-4">Estimated Cost</h3>
              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-300">
                    {selectedMaterial.name} ({results.cy.toFixed(1)} CY / {results.tons.toFixed(1)} T)
                  </span>
                  <span>${results.materialCost.toFixed(0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">{selectedZone.label.split("—")[0].trim()} delivery</span>
                  <span>${selectedZone.fee}</span>
                </div>
                <div className="border-t border-white/20 pt-2 flex justify-between font-bold text-lg">
                  <span>Estimated Total</span>
                  <span className="text-[#f4a46a]">${results.totalWithDelivery.toFixed(0)}</span>
                </div>
              </div>
              <div className="flex items-start gap-2 bg-white/10 rounded-lg p-3 text-xs text-gray-300">
                <AlertCircle size={14} className="shrink-0 mt-0.5" />
                Estimates are approximate. Actual pricing may vary based on site access, material availability, and
                exact haul distance. Call for a firm quote.
              </div>
            </div>

            <Link
              href="/contact"
              className="block w-full text-center py-4 bg-[#e8600a] hover:bg-[#c4500a] text-white font-bold rounded-xl text-lg transition-colors"
            >
              Order This Material →
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
