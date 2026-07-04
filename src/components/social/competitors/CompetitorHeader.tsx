"use client";
import Link from "next/link";
import {
  ArrowLeft,
  Download,
  FileSpreadsheet,
  FileText,
  Plus,
  RefreshCw,
  Search,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCompetitors } from "@/features/social/competitors/CompetitorProvider";

const filterCls =
  "h-9 rounded-xl border border-slate-700 bg-slate-900 px-3 text-xs text-slate-300 outline-none focus:border-cyan-500/50";

export function CompetitorHeader() {
  const {
    query,
    setQuery,
    filters,
    setFilters,
    resetFilters,
    openAdd,
    refreshAi,
    exportData,
  } = useCompetitors();

  const update = (key: keyof typeof filters, value: string) =>
    setFilters({ ...filters, [key]: value });

  const hasActiveFilters = Object.entries(filters).some(
    ([, value]) => Boolean(value)
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Link
            href="/dashboard/social"
            className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-cyan-300"
          >
            <ArrowLeft size={14} />
            Social Media Manager
          </Link>
          <p className="mt-4 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">
            Competitive intelligence
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-white">
            Competitor Intelligence
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Monitor competitors, compare performance, benchmark against your
            brand, and discover AI-powered growth opportunities.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            className="h-10 border-slate-700 bg-slate-900/70 text-slate-300"
            onClick={refreshAi}
          >
            <RefreshCw />
            Refresh AI
          </Button>
          <Button
            variant="outline"
            className="h-10 border-slate-700 bg-slate-900/70 text-slate-300"
            onClick={() => exportData("csv")}
          >
            <FileSpreadsheet />
            CSV
          </Button>
          <Button
            variant="outline"
            className="h-10 border-slate-700 bg-slate-900/70 text-slate-300"
            onClick={() => exportData("excel")}
          >
            <Download />
            Excel
          </Button>
          <Button
            variant="outline"
            className="h-10 border-slate-700 bg-slate-900/70 text-slate-300"
            onClick={() => exportData("pdf")}
          >
            <FileText />
            PDF
          </Button>
          <Button
            className="h-10 bg-cyan-400 px-4 text-slate-950 hover:bg-cyan-300"
            onClick={openAdd}
          >
            <Plus />
            Add Competitor
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 rounded-2xl border border-slate-800 bg-slate-950/55 p-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
          />
          <input
            type="text"
            placeholder="Search competitors..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-9 w-full rounded-xl border border-slate-700 bg-slate-900 pl-9 pr-8 text-xs text-slate-300 outline-none placeholder:text-slate-500 focus:border-cyan-500/50"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
            >
              <X size={14} />
            </button>
          )}
        </div>
        <select
          className={filterCls}
          value={filters.platform}
          onChange={(e) => update("platform", e.target.value)}
        >
          <option value="">All platforms</option>
          {[
            "Facebook",
            "Instagram",
            "LinkedIn",
            "X",
            "TikTok",
            "Pinterest",
            "Threads",
            "YouTube",
          ].map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
        <select
          className={filterCls}
          value={filters.industry}
          onChange={(e) => update("industry", e.target.value)}
        >
          <option value="">All industries</option>
          {[
            "Marketing Technology",
            "SaaS",
            "Digital Agency",
            "Social Media",
            "Creator Economy",
            "Analytics",
            "E-commerce",
            "AI Software",
          ].map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
        <select
          className={filterCls}
          value={filters.followers}
          onChange={(e) => update("followers", e.target.value)}
        >
          <option value="">All followers</option>
          <option value="under50">Under 50K</option>
          <option value="50to100">50K - 100K</option>
          <option value="100to250">100K - 250K</option>
          <option value="over250">250K+</option>
        </select>
        <select
          className={filterCls}
          value={filters.engagement}
          onChange={(e) => update("engagement", e.target.value)}
        >
          <option value="">All engagement</option>
          <option value="under3">Under 3%</option>
          <option value="3to5">3% - 5%</option>
          <option value="5to8">5% - 8%</option>
          <option value="over8">8%+</option>
        </select>
        <select
          className={filterCls}
          value={filters.country}
          onChange={(e) => update("country", e.target.value)}
        >
          <option value="">All countries</option>
          {[
            "United States",
            "India",
            "United Kingdom",
            "Singapore",
            "Canada",
            "Germany",
            "Australia",
            "France",
          ].map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="shrink-0 px-2 text-xs text-cyan-300 hover:text-cyan-200"
          >
            Reset
          </button>
        )}
      </div>
    </div>
  );
}