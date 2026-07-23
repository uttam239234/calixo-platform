"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Sparkles, Clock } from "lucide-react";
import { ModuleHeader } from "@/components/enterprise/module";
import { Button } from "@/components/ui/button";
import { SimpleDialog } from "@/components/settings/users/SimpleDialog";
import { useSettingsContext } from "@/features/settings/SettingsProvider";
import { useIntegrations } from "@/hooks/useIntegrations";
import type { AppListing } from "@/features/settings/integrations/marketplace";
import { MARKETPLACE_CATEGORIES, CATEGORY_LABELS, POPULAR_CONNECTOR_IDS, FEATURE_LABELS, STARTER_INTEGRATION_SETS, iconForApp } from "@/features/settings/integrations/constants";

export default function AppMarketplacePage() {
  const router = useRouter();
  const { tenantContext, canManageIntegrations } = useSettingsContext();
  const organizationId = tenantContext.organizationId;
  const integrations = useIntegrations(organizationId);

  const [category, setCategory] = useState<string>("all");
  const [learnMore, setLearnMore] = useState<AppListing | null>(null);
  const [applyingStarter, setApplyingStarter] = useState(false);
  const [applyingStarterId, setApplyingStarterId] = useState<string | null>(null);
  const [connectingId, setConnectingId] = useState<string | null>(null);

  const filtered = useMemo(() => (category === "all" ? integrations.marketplace : integrations.marketplace.filter(l => l.category === category)), [integrations.marketplace, category]);

  const applyStarter = async (starterId: string) => {
    const starter = STARTER_INTEGRATION_SETS.find(s => s.id === starterId);
    if (!starter) return;
    setApplyingStarterId(starterId);
    for (const connectorId of starter.connectorIds) {
      const listing = integrations.marketplace.find(l => l.connectorId === connectorId);
      if (!listing || listing.installState === "installed" || listing.isComingSoon) continue;
      await integrations.installOnly(connectorId);
    }
    await integrations.refresh();
    setApplyingStarterId(null);
    setApplyingStarter(false);
  };

  return (
    <div>
      <ModuleHeader
        title="App Marketplace"
        description="Browse and connect the tools your organization uses."
        quickActions={
          canManageIntegrations && (
            <Button variant="outline" onClick={() => setApplyingStarter(true)}>
              <Sparkles size={16} />
              Starter Integrations
            </Button>
          )
        }
      />

      <div className="mb-5 flex flex-wrap gap-1.5">
        <button
          onClick={() => setCategory("all")}
          className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${category === "all" ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:text-foreground"}`}
        >
          All
        </button>
        {MARKETPLACE_CATEGORIES.map(c => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${category === c ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:text-foreground"}`}
          >
            {CATEGORY_LABELS[c]}
          </button>
        ))}
      </div>

      {integrations.loading ? (
        <p className="text-sm text-muted-foreground">Loading the marketplace…</p>
      ) : filtered.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">No apps in this category yet.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(listing => {
            const isInstalled = listing.installState === "installed";
            const isConnecting = connectingId === listing.connectorId;
            return (
              <div key={listing.connectorId} className="flex flex-col rounded-2xl border border-border bg-card p-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10 text-2xl">{iconForApp(listing.connectorId)}</div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate font-semibold text-foreground">{listing.name}</p>
                      {!listing.isComingSoon && POPULAR_CONNECTOR_IDS.has(listing.connectorId) && <span className="flex-shrink-0 rounded-full bg-info/10 px-2 py-0.5 text-[10px] font-semibold text-info">Popular</span>}
                    </div>
                    <p className="text-xs text-muted-foreground">{CATEGORY_LABELS[listing.category]}</p>
                  </div>
                </div>

                <p className="mt-3 flex-1 text-sm text-muted-foreground">{listing.description}</p>

                <div className="mt-4 flex items-center gap-2 border-t border-border pt-4">
                  {listing.isComingSoon ? (
                    <Button size="xs" variant="outline" className="flex-1" disabled>
                      <Clock size={12} /> Coming Soon
                    </Button>
                  ) : isInstalled ? (
                    <Button size="xs" variant="outline" className="flex-1" onClick={() => router.push("/dashboard/settings/integrations")}>
                      <CheckCircle2 size={12} /> Connected
                    </Button>
                  ) : (
                    canManageIntegrations && (
                      <Button
                        size="xs"
                        className="flex-1"
                        disabled={isConnecting}
                        onClick={async () => {
                          setConnectingId(listing.connectorId);
                          await integrations.connect(listing.connectorId, listing.name);
                        }}
                      >
                        {isConnecting ? "Connecting…" : "Connect"}
                      </Button>
                    )
                  )}
                  <Button size="xs" variant="outline" onClick={() => setLearnMore(listing)}>
                    Learn More
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {learnMore && (
        <SimpleDialog title={learnMore.name} description={learnMore.description} onClose={() => setLearnMore(null)}>
          {learnMore.isComingSoon ? (
            <p className="text-sm text-muted-foreground">This connector isn&apos;t built yet — it&apos;ll appear here as soon as it is.</p>
          ) : (
            <div>
              <p className="mb-2 text-xs font-medium text-muted-foreground">{learnMore.name} can:</p>
              <ul className="space-y-1 text-sm">
                {learnMore.features.map(feature => (
                  <li key={feature} className="text-foreground">
                    ✓ {FEATURE_LABELS[feature]}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </SimpleDialog>
      )}

      {applyingStarter && (
        <SimpleDialog title="Starter Integrations" description="Add a recommended set of apps in one click, then connect each from Connected Apps." onClose={() => setApplyingStarter(false)}>
          <div className="space-y-2">
            {STARTER_INTEGRATION_SETS.map(starter => (
              <button
                key={starter.id}
                type="button"
                disabled={applyingStarterId !== null}
                onClick={() => applyStarter(starter.id)}
                className="flex w-full items-start gap-3 rounded-xl border border-border p-3 text-left hover:bg-accent disabled:opacity-60"
              >
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Sparkles size={16} />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{starter.name}</p>
                  <p className="text-xs text-muted-foreground">{applyingStarterId === starter.id ? "Adding…" : starter.description}</p>
                </div>
              </button>
            ))}
          </div>
        </SimpleDialog>
      )}
    </div>
  );
}
