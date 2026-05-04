export type Material = {
  id: string;
  name: string;
  category: string;
  description: string;
  uses: string[];
  pitPrice: number;
  deliveredPrice: number;
  unit: "ton" | "yard";
  tonsPerYard: number;
  minLoad: number;
  superDumpLoad: number;
  sideDumpLoad: number;
  popular?: boolean;
};

// Pit prices sourced from Magic Valley / Twin Falls area benchmarks (2025).
// Crystal Springs Pit (Premier Aggregates, Filer ID) and BLM community pits are
// primary sources for the region. Delivered prices include our delivery to the
// Twin Falls area (Zone 1, 0–15 miles).
export const materials: Material[] = [
  {
    id: "topsoil-screened",
    name: "Screened Topsoil",
    category: "Soil",
    description:
      "Premium screened topsoil, free of rocks and debris. Ideal for lawns, gardens, and landscaping projects across Magic Valley.",
    uses: ["Lawn establishment", "Garden beds", "Landscaping fill", "Leveling yards"],
    pitPrice: 24,
    deliveredPrice: 48,
    unit: "ton",
    tonsPerYard: 0.9,
    minLoad: 5,
    superDumpLoad: 23,
    sideDumpLoad: 28,
    popular: true,
  },
  {
    id: "fill-dirt",
    name: "Fill Dirt",
    category: "Soil",
    description:
      "General-purpose fill dirt for grading, backfill, and site leveling. May contain clay and native soil.",
    uses: ["Site grading", "Backfill", "Raising low spots", "Foundation fill"],
    pitPrice: 8,
    deliveredPrice: 22,
    unit: "yard",
    tonsPerYard: 1.25,
    minLoad: 10,
    superDumpLoad: 18,
    sideDumpLoad: 23,
  },
  {
    id: "road-base",
    name: "Road Base (Crushed Gravel)",
    category: "Base Material",
    description:
      "Compactable crushed gravel — the standard base for driveways, parking lots, and roads in the Magic Valley region.",
    uses: ["Driveways", "Parking lots", "Road building", "Patio base"],
    pitPrice: 12,
    deliveredPrice: 32,
    unit: "ton",
    tonsPerYard: 1.5,
    minLoad: 10,
    superDumpLoad: 23,
    sideDumpLoad: 28,
    popular: true,
  },
  {
    id: "pit-run",
    name: "Pit Run",
    category: "Base Material",
    description:
      "Unprocessed native gravel with mixed sizing — the most economical base material for large grading and fill projects.",
    uses: ["Large fill projects", "Sub-base", "Rural roads", "Mass grading"],
    pitPrice: 7,
    deliveredPrice: 24,
    unit: "ton",
    tonsPerYard: 1.45,
    minLoad: 10,
    superDumpLoad: 23,
    sideDumpLoad: 28,
  },
  {
    id: "sand",
    name: "Concrete / Utility Sand",
    category: "Sand",
    description:
      "Coarse washed utility sand suitable for drainage, paver base, and general construction. ASTM C-33 spec available.",
    uses: ["Paver base", "Drainage", "Backfill", "Concrete work"],
    pitPrice: 24,
    deliveredPrice: 42,
    unit: "ton",
    tonsPerYard: 1.35,
    minLoad: 8,
    superDumpLoad: 23,
    sideDumpLoad: 28,
  },
  {
    id: "pea-gravel",
    name: "Pea Gravel",
    category: "Decorative",
    description:
      "Smooth, rounded pea-sized gravel. Comfortable underfoot, attractive, and great for drainage in Idaho landscapes.",
    uses: ["Walkways", "Playgrounds", "Drainage beds", "Landscaping"],
    pitPrice: 30,
    deliveredPrice: 52,
    unit: "ton",
    tonsPerYard: 1.4,
    minLoad: 8,
    superDumpLoad: 23,
    sideDumpLoad: 28,
    popular: true,
  },
  {
    id: "gravel-34",
    name: "3/4\" Crushed Gravel",
    category: "Gravel",
    description:
      "Clean crushed gravel in the 3/4\" sizing. Excellent drainage and a classic driveway surface — widely used across Magic Valley.",
    uses: ["Driveways", "Drainage", "French drains", "Landscaping"],
    pitPrice: 21,
    deliveredPrice: 42,
    unit: "ton",
    tonsPerYard: 1.4,
    minLoad: 8,
    superDumpLoad: 23,
    sideDumpLoad: 28,
  },
  {
    id: "rip-rap",
    name: "Rip Rap (Large Rock)",
    category: "Erosion Control",
    description:
      "Large angular rocks for erosion control, channel lining, and slope stabilization — common along Snake River corridors and irrigation ditches.",
    uses: ["Creek banks", "Slope stabilization", "Erosion control", "Culvert protection"],
    pitPrice: 40,
    deliveredPrice: 65,
    unit: "ton",
    tonsPerYard: 1.7,
    minLoad: 10,
    superDumpLoad: 21,
    sideDumpLoad: 26,
  },
];

export const categories = [...new Set(materials.map((m) => m.category))];

export function getMaterialById(id: string): Material | undefined {
  return materials.find((m) => m.id === id);
}

// Density factors for calculator (tons per cubic yard)
export const densityFactors: Record<string, number> = {
  gravel: 1.4,
  roadBase: 1.5,
  pitRun: 1.45,
  sand: 1.35,
  topsoil: 0.9,
  fillDirt: 1.25,
  peaGravel: 1.4,
  ripRap: 1.7,
};

export const deliveryZones = [
  { label: "Zone 1 — Twin Falls area (0–15 mi)", fee: 125 },
  { label: "Zone 2 — Magic Valley (15–30 mi)", fee: 225 },
  { label: "Zone 3 — Extended (30–50 mi)", fee: 375 },
];

export const truckingRates = {
  superDumpHourly: 165,
  sideDumpHourly: 165,
  minimumCharge: 60,
  description:
    "We own our trucks — no broker markup. Hauling rates reflect actual operating cost with no middleman.",
};
