"use client";

import { useRouter } from "next/navigation";
import Card from "@/components/dashboard/common/Card";
import { CheckCircle2, AlertCircle, AlertTriangle, TrendingUp, Database, Sparkles, ClipboardCheck } from "lucide-react";
import { useSocial } from "@/features/social/SocialProvider";
import type { SocialActionCenterCategory, SocialActionCenterItem } from "@/core/social";

const SEVERITY_CONFIG: Record<SocialActionCenterItem["severity"], { icon: typeof AlertCircle; className: string }> = {
  high: { icon: AlertCircle, className: "text-destructive bg-destructive/10" },
  medium: { icon: AlertTriangle, className: "text-warning bg-warning/10" },
  low: { icon: Sparkles, className: "text-primary bg-primary/10" },
};

const CATEGORY_LABEL: Record<SocialActionCenterCategory, string> = {
  risk: "Risk",
  opportunity: "Opportunity",
  attribution: "Attribution",
  "data-quality": "Data Quality",
  approval: "Approval",
};

function ActionRow({ item, onInvestigate }: { item: SocialActionCenterItem; onInvestigate: (item: SocialActionCenterItem) => void }) {
  const severity = SEVERITY_CONFIG[item.severity];
  const SeverityIcon = item.category === "attribution" ? TrendingUp : item.category === "data-quality" ? Database : item.category === "approval" ? ClipboardCheck : severity.icon;

  return (
    <div className="flex items-start justify-between gap-3 rounded-xl bg-surface/40 p-3">
      <div className="flex items-start gap-3">
        <span className={`mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg ${severity.className}`}>
          <SeverityIcon size={14} />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground">{item.title}</p>
          <p className="text-xs text-muted-foreground">{item.description}</p>
          <span className="mt-1 inline-block rounded-full bg-muted px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">{CATEGORY_LABEL[item.category]}</span>
        </div>
      </div>
      <button onClick={() => onInvestigate(item)} className="shrink-0 rounded-lg px-2 py-1 text-xs text-primary hover:bg-primary/10">
        {item.actionLabel}
      </button>
    </div>
  );
}

export function SocialActionCenter() {
  const router = useRouter();
  const { actionCenterItems } = useSocial();

  const handleInvestigate = (item: SocialActionCenterItem) => {
    if (item.isExternalRoute) router.push(item.target);
    else document.getElementById(item.target)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <Card className="p-5" hover={false}>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-primary">Social Action & Insight Center</p>
        <p className="mt-1 text-xs text-muted-foreground">{actionCenterItems.length > 0 ? `${actionCenterItems.length} item${actionCenterItems.length === 1 ? "" : "s"} across risk, opportunity, attribution, and approvals` : "Risk, opportunity, attribution, and data quality"}</p>
      </div>
      {actionCenterItems.length === 0 ? (
        <div className="mt-4 flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-8 text-center">
          <CheckCircle2 size={22} className="text-success" />
          <p className="mt-2 text-sm text-muted-foreground">Nothing needs attention.</p>
        </div>
      ) : (
        <div className="mt-4 space-y-2">
          {actionCenterItems.map(item => (
            <ActionRow key={item.id} item={item} onInvestigate={handleInvestigate} />
          ))}
        </div>
      )}
    </Card>
  );
}
