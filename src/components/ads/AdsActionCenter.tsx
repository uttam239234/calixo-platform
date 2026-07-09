"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/EmptyState";
import { CheckCircle2, AlertCircle, AlertTriangle, TrendingUp, Database, Sparkles } from "lucide-react";
import { useCampaigns } from "@/features/ads/CampaignProvider";
import type { AdsActionCenterCategory, AdsActionCenterItem } from "@/core/ads";

const SEVERITY_CONFIG: Record<AdsActionCenterItem["severity"], { icon: typeof AlertCircle; className: string }> = {
  high: { icon: AlertCircle, className: "text-destructive bg-destructive/10 border-destructive/20" },
  medium: { icon: AlertTriangle, className: "text-warning bg-warning/10 border-warning/20" },
  low: { icon: Sparkles, className: "text-primary bg-primary/10 border-primary/20" },
};

const CATEGORY_LABEL: Record<AdsActionCenterCategory, string> = {
  "budget-risk": "Budget Risk",
  "creative-fatigue": "Creative Fatigue",
  opportunity: "Opportunity",
  attribution: "Attribution",
  "data-quality": "Data Quality",
};

interface RowProps {
  item: AdsActionCenterItem;
  onInvestigate: (item: AdsActionCenterItem) => void;
}

function ActionRow({ item, onInvestigate }: RowProps) {
  const severity = SEVERITY_CONFIG[item.severity];
  const SeverityIcon = item.category === "attribution" ? TrendingUp : item.category === "data-quality" ? Database : severity.icon;

  return (
    <div className="flex items-start justify-between gap-3 rounded-xl border border-border/50 bg-background/60 px-4 py-3 transition-all duration-150 hover:bg-accent/50 hover:border-border/80">
      <div className="flex items-start gap-3">
        <span className={`mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg border ${severity.className}`}>
          <SeverityIcon size={14} />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground">{item.title}</p>
          <p className="text-xs text-muted-foreground">{item.description}</p>
          <span className="mt-1 inline-block rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">{CATEGORY_LABEL[item.category]}</span>
        </div>
      </div>
      <Button variant="outline" size="sm" className="h-7 flex-shrink-0 px-2 text-xs" onClick={() => onInvestigate(item)}>
        {item.actionLabel}
      </Button>
    </div>
  );
}

export function AdsActionCenter() {
  const router = useRouter();
  const { actionCenterItems } = useCampaigns();

  const handleInvestigate = (item: AdsActionCenterItem) => {
    if (item.isExternalRoute) router.push(item.target);
    else document.getElementById(item.target)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  if (actionCenterItems.length === 0) {
    return (
      <Card>
        <CardHeader title="Ads Action & Insight Center" description="Budget risk, creative fatigue, opportunities, attribution, and data quality" />
        <CardContent>
          <EmptyState icon={<CheckCircle2 size={32} />} title="Nothing needs attention" description="Budget pacing, campaign performance, and connector data are all clear." />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader title="Ads Action & Insight Center" description={`${actionCenterItems.length} item${actionCenterItems.length === 1 ? "" : "s"} across budget, creative, opportunity, and data quality`} />
      <CardContent>
        <div className="space-y-2">
          {actionCenterItems.map(item => (
            <ActionRow key={item.id} item={item} onInvestigate={handleInvestigate} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
