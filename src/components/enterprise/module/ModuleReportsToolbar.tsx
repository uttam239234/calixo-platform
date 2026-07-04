"use client";

import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { FileText, Download, RefreshCw } from "lucide-react";

interface ModuleReportsToolbarProps {
  onGenerateReport?: () => void;
  onExport?: () => void;
  onRefresh?: () => void;
  generatingReport?: boolean;
  reportTypes?: {
    label: string;
    onClick: () => void;
    icon?: ReactNode;
  }[];
  children?: ReactNode;
  className?: string;
}

export function ModuleReportsToolbar({
  onGenerateReport,
  onExport,
  onRefresh,
  generatingReport = false,
  reportTypes,
  children,
  className,
}: ModuleReportsToolbarProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-2",
        className
      )}
    >
      {/* Generate Report */}
      {onGenerateReport && (
        <Button
          size="sm"
          onClick={onGenerateReport}
          loading={generatingReport}
          className="h-9 gap-2"
        >
          <FileText size={14} />
          {generatingReport ? "Generating..." : "Generate Report"}
        </Button>
      )}

      {/* Report type dropdowns */}
      {reportTypes?.map((rt, i) => (
        <Button
          key={i}
          size="sm"
          variant="outline"
          onClick={rt.onClick}
          className="h-9 gap-1.5 border-slate-700 bg-slate-900/70 text-slate-300 hover:bg-slate-800"
        >
          {rt.icon ?? <FileText size={14} />}
          {rt.label}
        </Button>
      ))}

      {/* Export */}
      {onExport && (
        <Button
          size="sm"
          variant="outline"
          onClick={onExport}
          className="h-9 gap-1.5 border-slate-700 bg-slate-900/70 text-slate-300 hover:bg-slate-800"
        >
          <Download size={14} />
          Export
        </Button>
      )}

      {/* Refresh */}
      {onRefresh && (
        <Button
          size="sm"
          variant="ghost"
          onClick={onRefresh}
          className="h-9 gap-1.5 text-slate-400 hover:text-slate-200"
        >
          <RefreshCw size={14} />
          Refresh
        </Button>
      )}

      {children}
    </div>
  );
}