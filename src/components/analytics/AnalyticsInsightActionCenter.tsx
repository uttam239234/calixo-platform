"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/button";
import { SkeletonText } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { CheckCircle2, AlertCircle, AlertTriangle, Info, TrendingUp, Database } from "lucide-react";
import type { AnalyticsActionCenterCategory, AnalyticsActionCenterItem } from "@/core/analytics";

const SEVERITY_CONFIG: Record<AnalyticsActionCenterItem["severity"], { icon: typeof AlertCircle; className: string }> = {
  high: { icon: AlertCircle, className: "text-destructive bg-destructive/10 border-destructive/20" },
  medium: { icon: AlertTriangle, className: "text-warning bg-warning/10 border-warning/20" },
  low: { icon: Info, className: "text-primary bg-primary/10 border-primary/20" },
};

const CATEGORY_LABEL: Record<AnalyticsActionCenterCategory, string> = {
  risk: "Risk",
  anomaly: "Anomaly",
  opportunity: "Opportunity",
  "data-quality": "Data Quality",
  attribution: "Attribution",
};

interface RowProps {
  item: AnalyticsActionCenterItem;
  onInvestigate: (item: AnalyticsActionCenterItem) => void;
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

interface AnalyticsInsightActionCenterProps {
  items: AnalyticsActionCenterItem[];
  loading?: boolean;
  onScrollToWidget: (id: string) => void;
}

export default function AnalyticsInsightActionCenter({ items, loading = false, onScrollToWidget }: AnalyticsInsightActionCenterProps) {
  const router = useRouter();

  const handleInvestigate = (item: AnalyticsActionCenterItem) => {
    if (item.isExternalRoute) router.push(item.target);
    else onScrollToWidget(item.target);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader title="Insight & Action Center" description="Risks, anomalies, opportunities, data quality, and attribution" />
        <CardContent>
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <SkeletonText key={i} className="h-14 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (items.length === 0) {
    return (
      <Card>
        <CardHeader title="Insight & Action Center" description="Risks, anomalies, opportunities, data quality, and attribution" />
        <CardContent>
          <EmptyState icon={<CheckCircle2 size={32} />} title="Nothing needs attention" description="Performance, funnel health, and connector data are all clear." />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader title="Insight & Action Center" description={`${items.length} item${items.length === 1 ? "" : "s"} across risk, opportunity, and data quality`} />
      <CardContent>
        <div className="space-y-2">
          {items.map(item => (
            <ActionRow key={item.id} item={item} onInvestigate={handleInvestigate} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
