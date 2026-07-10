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
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              placeholder={searchPlaceholder}
              value={searchValue ?? ""}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 bg-surface/60 border-border text-sm h-10"
            />
            {searchValue && (
              <button
                onClick={() => onSearchChange("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
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
              "h-10 gap-2 border-border bg-surface/70 text-foreground hover:bg-surface",
              hasActiveFilters && "border-primary/50 text-primary"
            )}
          >
            <Filter size={14} />
            Filters
            {hasActiveFilters && (
              <span className="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary/20 px-1.5 text-[10px] font-bold text-primary">
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
            className="h-10 gap-1.5 text-muted-foreground hover:text-foreground"
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
        <div className="flex flex-wrap items-center gap-3 p-3 rounded-xl border border-border bg-surface/40">
          {filterGroups.map((group) => (
            <div key={group.id} className="flex items-center gap-2">
              <label className="text-xs text-muted-foreground whitespace-nowrap">
                {group.label}
              </label>
              <select
                value={group.value}
                onChange={(e) => group.onChange(e.target.value)}
                className="rounded-xl border border-border bg-surface/60 px-3 py-2 text-sm text-foreground h-10 outline-none focus:border-primary/50 cursor-pointer"
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