"use client";

import { useState } from "react";
import {
  BarChart3, TrendingUp, Truck, Loader2, RefreshCw, ChevronRight,
} from "lucide-react";

type ReportType = "business_summary" | "revenue_analysis" | "fleet_performance";

type ReportCard = {
  type: ReportType;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
};

const REPORT_CARDS: ReportCard[] = [
  {
    type: "business_summary",
    title: "Business Summary",
    description: "High-level overview of operations, revenue, and key metrics from recent activity.",
    icon: <BarChart3 size={24} />,
    color: "#1a2744",
  },
  {
    type: "revenue_analysis",
    title: "Revenue Analysis",
    description: "Detailed breakdown of invoices, outstanding AR, and revenue trends.",
    icon: <TrendingUp size={24} />,
    color: "#e8600a",
  },
  {
    type: "fleet_performance",
    title: "Fleet Performance",
    description: "Delivery volume, material trends, status breakdown, and operational insights.",
    icon: <Truck size={24} />,
    color: "#0ea5e9",
  },
];

function MarkdownBlock({ content }: { content: string }) {
  // Simple markdown rendering for common patterns
  const lines = content.split("\n");
  return (
    <div className="prose prose-sm max-w-none">
      {lines.map((line, i) => {
        if (line.startsWith("# ")) {
          return <h1 key={i} className="text-xl font-bold text-[#1a2744] mt-4 mb-2">{line.slice(2)}</h1>;
        }
        if (line.startsWith("## ")) {
          return <h2 key={i} className="text-lg font-bold text-[#1a2744] mt-4 mb-2 border-b border-gray-200 pb-1">{line.slice(3)}</h2>;
        }
        if (line.startsWith("### ")) {
          return <h3 key={i} className="text-base font-semibold text-gray-800 mt-3 mb-1">{line.slice(4)}</h3>;
        }
        if (line.startsWith("- ") || line.startsWith("* ")) {
          return (
            <div key={i} className="flex gap-2 mb-1">
              <span className="text-[#e8600a] shrink-0">•</span>
              <span className="text-sm text-gray-700">{line.slice(2)}</span>
            </div>
          );
        }
        if (line.startsWith("**") && line.endsWith("**") && line.length > 4) {
          return <p key={i} className="font-bold text-gray-800 text-sm mb-1">{line.slice(2, -2)}</p>;
        }
        if (line.trim() === "") {
          return <div key={i} className="h-2" />;
        }
        // Handle inline bold
        const parts = line.split(/\*\*(.*?)\*\*/g);
        return (
          <p key={i} className="text-sm text-gray-700 mb-1 leading-relaxed">
            {parts.map((part, j) =>
              j % 2 === 1 ? <strong key={j}>{part}</strong> : part
            )}
          </p>
        );
      })}
    </div>
  );
}

export default function AIReportsClient() {
  const [selectedReport, setSelectedReport] = useState<ReportType | null>(null);
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState<string>("");
  const [error, setError] = useState<string>("");

  const generate = async (type: ReportType) => {
    setSelectedReport(type);
    setContent("");
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
      });

      if (res.status === 503) {
        setError("AI is not configured. Please add ANTHROPIC_API_KEY to your environment.");
        return;
      }

      const data = await res.json() as { content?: string; error?: string };
      if (data.error) {
        setError(data.error);
      } else {
        setContent(data.content ?? "");
      }
    } catch {
      setError("Failed to generate report. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const selectedCard = REPORT_CARDS.find((c) => c.type === selectedReport);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1a2744]">AI Reports</h1>
        <p className="text-gray-500 text-sm mt-1">Generate intelligent reports from your business data using AI.</p>
      </div>

      {/* Report cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {REPORT_CARDS.map((card) => (
          <button
            key={card.type}
            onClick={() => generate(card.type)}
            disabled={loading}
            className={`text-left p-5 rounded-xl border-2 transition-all cursor-pointer group ${
              selectedReport === card.type
                ? "border-[#e8600a] bg-orange-50"
                : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
            } disabled:opacity-60`}
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-white mb-4"
              style={{ backgroundColor: card.color }}
            >
              {card.icon}
            </div>
            <h3 className="font-semibold text-gray-900 mb-1.5 flex items-center gap-1">
              {card.title}
              <ChevronRight size={14} className="text-gray-400 group-hover:text-[#e8600a] transition-colors ml-auto" />
            </h3>
            <p className="text-xs text-gray-500 leading-relaxed">{card.description}</p>
            {selectedReport === card.type && loading && (
              <div className="flex items-center gap-1.5 mt-3 text-[#e8600a] text-xs font-medium">
                <Loader2 size={12} className="animate-spin" />
                Generating...
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Report output */}
      {(loading || content || error) && (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
            <div className="flex items-center gap-3">
              {selectedCard && (
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0"
                  style={{ backgroundColor: selectedCard.color }}
                >
                  {selectedCard.icon}
                </div>
              )}
              <div>
                <h2 className="font-semibold text-gray-900">{selectedCard?.title}</h2>
                <p className="text-xs text-gray-400">
                  Generated {new Date().toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                </p>
              </div>
            </div>
            {!loading && content && (
              <button
                onClick={() => selectedReport && generate(selectedReport)}
                className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-[#e8600a] transition-colors cursor-pointer"
              >
                <RefreshCw size={12} />
                Regenerate
              </button>
            )}
          </div>

          <div className="p-6 max-h-[60vh] overflow-y-auto">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <Loader2 size={28} className="text-[#e8600a] animate-spin" />
                <p className="text-gray-500 text-sm">Analyzing your business data...</p>
                <p className="text-gray-400 text-xs">This may take a few seconds</p>
              </div>
            ) : error ? (
              <div className="text-red-600 bg-red-50 border border-red-200 rounded-lg p-4 text-sm">
                {error}
              </div>
            ) : (
              <MarkdownBlock content={content} />
            )}
          </div>
        </div>
      )}

      {!loading && !content && !error && (
        <div className="text-center py-12 text-gray-400">
          <BarChart3 size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">Select a report type above to get started</p>
        </div>
      )}
    </div>
  );
}
