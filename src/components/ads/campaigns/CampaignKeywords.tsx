"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Plus } from "lucide-react";
import type { Campaign } from "@/features/ads/types";

export function CampaignKeywords({ campaign }: { campaign: Campaign }) {
  return (
    <Card>
      <CardHeader
        title="Keywords"
        description="Search terms and match types"
        action={<button className="text-primary hover:text-primary/80"><Plus size={18} /></button>}
      />
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {campaign.keywords.map((x, i) => (
            <span key={x} className="rounded-xl border border-border/50 bg-card/50 px-3 py-2 text-xs text-foreground">
              {x}
              <span className="ml-2 text-success">{7 + i}/10</span>
            </span>
          ))}
        </div>
        <p className="mt-4 text-xs text-muted-foreground">Broad match · AI bidding enabled</p>
      </CardContent>
    </Card>
  );
}