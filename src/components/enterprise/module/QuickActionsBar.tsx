"use client";

import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Plus,
  RefreshCw,
  Download,
  FileText,
  Sparkles,
  Upload,
} from "lucide-react";

export type QuickAction =
  | "create"
  | "refresh"
  | "export"
  | "report"
  | "aiAnalysis"
  | "import"
  | "custom";

export interface QuickActionItem {
  type: QuickAction;
  label?: string;
  icon?: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "destructive";
}

interface QuickActionsBarProps {
  actions: QuickActionItem[];
  className?: string;
}

const defaultIcons: Record<QuickAction, ReactNode> = {
  create: <Plus size={14} />,
  refresh: <RefreshCw size={14} />,
  export: <Download size={14} />,
  report: <FileText size={14} />,
  aiAnalysis: <Sparkles size={14} />,
  import: <Upload size={14} />,
  custom: null,
};

const defaultLabels: Record<QuickAction, string> = {
  create: "Create",
  refresh: "Refresh",
  export: "Export",
  report: "Generate Report",
  aiAnalysis: "AI Analysis",
  import: "Import",
  custom: "Action",
};

export function QuickActionsBar({ actions, className }: QuickActionsBarProps) {
  if (!actions || actions.length === 0) return null;

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {actions.map((action, i) => {
        const isPrimary = action.type === "create";
        const variant = action.variant ?? (isPrimary ? "primary" : "outline");
        const label = action.label ?? defaultLabels[action.type];
        const icon = action.icon ?? defaultIcons[action.type];

        return (
          <Button
            key={i}
            size="sm"
            variant={variant}
            onClick={action.onClick}
            disabled={action.disabled}
            loading={action.loading}
            className={cn(
              "h-9",
              variant === "outline"
                ? "border-border bg-surface/70 text-foreground hover:bg-surface"
                : "",
              variant === "ghost"
                ? "text-muted-foreground hover:text-foreground hover:bg-surface/50"
                : ""
            )}
          >
            {icon}
            {label}
          </Button>
        );
      })}
    </div>
  );
}