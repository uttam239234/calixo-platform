"use client";

import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface ErrorStateProps {
  title?: string;
  message?: string;
  error?: string | Error;
  icon?: ReactNode;
  onRetry?: () => void;
  onReset?: () => void;
  className?: string;
}

export function ModuleErrorState({
  title = "Something went wrong",
  message,
  error,
  icon,
  onRetry,
  onReset,
  className,
}: ErrorStateProps) {
  const errorMessage =
    message ??
    (typeof error === "string" ? error : error?.message) ??
    "An unexpected error occurred. Please try again later.";

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center px-6 py-20 text-center",
        className
      )}
    >
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive">
        {icon ?? <AlertTriangle size={28} />}
      </div>
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">{errorMessage}</p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        {onRetry && (
          <Button onClick={onRetry} className="gap-2">
            <RefreshCw size={14} />
            Retry
          </Button>
        )}
        {onReset && (
          <Button variant="outline" onClick={onReset}>
            Reset
          </Button>
        )}
        {!onRetry && !onReset && (
          <p className="text-xs text-muted-foreground">
            If the problem persists, please contact support.
          </p>
        )}
      </div>
    </div>
  );
}