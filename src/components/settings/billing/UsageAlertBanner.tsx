"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usageAlertMessage } from "@/features/settings/billing/constants";

interface UsageAlertBannerProps {
  percentIncludedUsed: number;
  onBuyCredits: () => void;
  onUpgradePlan: () => void;
}

/** Never blocks — always explains what happened and offers a way forward, per the brief. */
export function UsageAlertBanner({ percentIncludedUsed, onBuyCredits, onUpgradePlan }: UsageAlertBannerProps) {
  const message = usageAlertMessage(percentIncludedUsed);
  if (!message) return null;

  const isExhausted = percentIncludedUsed >= 100;

  return (
    <div className={`mb-5 flex flex-col gap-3 rounded-2xl border p-4 sm:flex-row sm:items-center sm:justify-between ${isExhausted ? "border-destructive/30 bg-destructive/5" : "border-warning/30 bg-warning/5"}`}>
      <div className="flex items-center gap-2.5">
        <AlertTriangle size={18} className={isExhausted ? "text-destructive" : "text-warning"} />
        <p className="text-sm font-medium text-foreground">{message}</p>
      </div>
      <div className="flex flex-shrink-0 gap-2">
        <Button size="sm" onClick={onBuyCredits}>
          Buy Credits
        </Button>
        <Button size="sm" variant="outline" onClick={onUpgradePlan}>
          Upgrade Plan
        </Button>
      </div>
    </div>
  );
}
