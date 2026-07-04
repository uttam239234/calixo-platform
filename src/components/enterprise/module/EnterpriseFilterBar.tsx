"use client";

import { ReactNode, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";
import { Search, Filter, X, ChevronDown, RotateCcw } from "lucide-react";

export interface FilterOption {
  id: string;
  label: string;
  value: string;
}

export interface FilterGroup {
  id: string;
  label: string;
  options: FilterOption[];
  value: string;
  onChange: (value: string) => void;
}

interface EnterpriseFilterBarProps {
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  filterGroups?: FilterGroup[];
  onClearAll?: () => void;
  children?: ReactNode;
  className?: string;
}

export function EnterpriseFilterBar({
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search...",
  filterGroups,
  onClearAll,
  children,
  className,
}: EnterpriseFilterBarProps) {
  const [showFilters, setShowFilters] = useState(false);
  const hasActiveFilters =
    filterGroups?.some((g) => g.value !== "all") || false;
  const hasAnyFilters =
    onSearchChange || (filterGroups && filterGroups.length > 0) || children;

  if (!hasAnyFilters) return null;

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        {onSearchChange && (
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
            />
            <Input
              placeholder={searchPlaceholder}
              value={searchValue ?? ""}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 bg-slate-900/60 border-slate-700/50 text-sm h-10"
            />
            {searchValue && (
              <button
                onClick={() => onSearchChange("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                <X size={14} />
              </button>
            )}
          </div>
        )}

        {/* Filter toggle */}
        {filterGroups && filterGroups.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "h-10 gap-2 border-slate-700 bg-slate-900/70 text-slate-300 hover:bg-slate-800",
              hasActiveFilters && "border-cyan-500/50 text-cyan-300"
            )}
          >
            <Filter size={14} />
            Filters
            {hasActiveFilters && (
              <span className="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-cyan-500/20 px-1.5 text-[10px] font-bold text-cyan-300">
                {filterGroups.filter((g) => g.value !== "all").length}
              </span>
            )}
            <ChevronDown size={12} />
          </Button>
        )}

        {/* Clear all */}
        {(hasActiveFilters || searchValue) && onClearAll && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearAll}
            className="h-10 gap-1.5 text-slate-400 hover:text-slate-200"
          >
            <RotateCcw size={14} />
            Clear
          </Button>
        )}

        {/* Custom children */}
        {children}
      </div>

      {/* Expanded filter groups */}
      {showFilters && filterGroups && filterGroups.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 p-3 rounded-xl border border-slate-700/50 bg-slate-900/40">
          {filterGroups.map((group) => (
            <div key={group.id} className="flex items-center gap-2">
              <label className="text-xs text-slate-500 whitespace-nowrap">
                {group.label}
              </label>
              <select
                value={group.value}
                onChange={(e) => group.onChange(e.target.value)}
                className="rounded-xl border border-slate-700/50 bg-slate-900/60 px-3 py-2 text-sm text-slate-300 h-10 outline-none focus:border-cyan-500/50 cursor-pointer"
              >
                <option value="all">All</option>
                {group.options.map((opt) => (
                  <option key={opt.id} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}