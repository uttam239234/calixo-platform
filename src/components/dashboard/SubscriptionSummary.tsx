"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/button";
import { SkeletonText } from "@/components/ui/Skeleton";
import type { DashboardSubscriptionSummary } from "@/core/dashboard";

function UsageRow({ label, used, limit }: { label: string; used: number; limit: number }) {
  const pct = limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0;
  const barColor = pct >= 90 ? "bg-destructive" : pct >= 70 ? "bg-warning" : "bg-primary";

  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium text-foreground">
          {used.toLocaleString()} / {limit.toLocaleString()}
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div className={`h-full rounded-full ${barColor}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

interface SubscriptionSummaryProps {
  subscription: DashboardSubscriptionSummary | null;
  loading?: boolean;
}

export default function SubscriptionSummary({ subscription, loading = false }: SubscriptionSummaryProps) {
  const router = useRouter();

  if (loading || !subscription) {
    return (
      <Card>
        <CardHeader title="Subscription" description="Plan and usage" />
        <CardContent>
          <div className="space-y-3">
            <SkeletonText className="h-4 w-24" />
            <SkeletonText className="h-3 w-full" />
            <SkeletonText className="h-3 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader
        title="Subscription"
        description={`${subscription.tier.charAt(0).toUpperCase()}${subscription.tier.slice(1)} plan · ${subscription.status}`}
        action={
          <Button variant="outline" size="sm" onClick={() => router.push("/dashboard/settings")}>
            Manage plan
          </Button>
        }
      />
      <CardContent>
        <div className="space-y-3">
          <UsageRow label="Seats" used={subscription.seats.used} limit={subscription.seats.limit} />
          <UsageRow label="AI credits" used={subscription.aiCredits.used} limit={subscription.aiCredits.limit} />
          <UsageRow label="Storage (GB)" used={subscription.storageGB.used} limit={subscription.storageGB.limit} />
          <UsageRow label="Connectors" used={subscription.connectors.used} limit={subscription.connectors.limit} />
        </div>
        {subscription.renewsAt && <p className="mt-3 text-xs text-muted-foreground">Renews {new Date(subscription.renewsAt).toLocaleDateString()}</p>}
      </CardContent>
    </Card>
  );
}
