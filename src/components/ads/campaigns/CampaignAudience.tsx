"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Users, Globe2 } from "lucide-react";
import type { Campaign } from "@/features/ads/types";

export function CampaignAudience({ campaign }: { campaign: Campaign }) {
  return (
    <Card>
      <CardHeader title="Audience" description="Target demographics" />
      <CardContent>
        <div className="space-y-3">
          <div className="flex gap-3 rounded-2xl border border-border/50 bg-card/50 p-4">
            <Users size={19} className="text-primary shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-foreground">{campaign.audience}</p>
              <p className="mt-1 text-xs text-muted-foreground">Estimated reach: 1.2M–1.8M people</p>
            </div>
          </div>
          <div className="flex gap-3 rounded-2xl border border-border/50 bg-card/50 p-4">
            <Globe2 size={19} className="text-ai shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-foreground">India, United Kingdom, United States</p>
              <p className="mt-1 text-xs text-muted-foreground">English · Ages 24–54 · All devices</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}