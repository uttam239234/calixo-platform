"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Archive, Copy, Download, Grid2X2, List, MoreHorizontal, Pause, Play, Search, SlidersHorizontal, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/button";
import { platforms } from "@/features/ads/mock-data";
import { defaultCampaignFilters, exportCampaignsCsv, filterCampaigns, sortCampaigns, type CampaignAction, type CampaignFilterState } from "@/features/ads/campaign-utils";
import { useCampaigns } from "@/features/ads/CampaignProvider";
import { CampaignFilters } from "./campaigns/CampaignFilters";
import { CampaignCard } from "./campaigns/CampaignCard";
import { campaignStatusStyle } from "./campaigns/CampaignRow";

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const platformNames = Object.fromEntries(platforms.map((platform) => [platform.id, platform.name]));
const VIEW_KEY = "calixo-campaign-view";

export function CampaignTable() {
  const { campaigns, actOnCampaigns, showToast } = useCampaigns();
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<CampaignFilterState>(defaultCampaignFilters);
  const [showFilters, setShowFilters] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [view, setView] = useState<"table"|"card">("table");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (!active) return;
      if (localStorage.getItem(VIEW_KEY) === "card") setView("card");
      setMounted(true);
    });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (mounted) localStorage.setItem(VIEW_KEY, view);
  }, [mounted, view]);

  const objectives = useMemo(() => [...new Set(campaigns.map(c => c.objective))].sort(), [campaigns]);
  const owners = useMemo(() => [...new Set(campaigns.map(c => c.owner))].sort(), [campaigns]);
  const rows = useMemo(() => sortCampaigns(filterCampaigns(campaigns, query, filters, platformNames), filters.sort, filters.direction), [campaigns, query, filters]);
  const visibleView = mounted ? view : "table";

  const runAction = (action: CampaignAction | "Export", ids = selected) => {
    if (action === "Export") exportCampaignsCsv(campaigns.filter(c => ids.includes(c.id)));
    else {
      if (action === "Delete" && !window.confirm(`Delete ${ids.length} selected campaign${ids.length === 1 ? "" : "s"}?`)) return;
      actOnCampaigns(ids, action);
    }
    showToast(`${action === "Export" ? "Exported" : action} ${ids.length} campaign${ids.length === 1 ? "" : "s"}.`);
    setSelected([]);
  };

  const toggleView = (next: "table"|"card") => {
    setView(next);
    localStorage.setItem(VIEW_KEY, next);
  };

  return (
    <Card className="overflow-hidden p-0">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-border p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Campaigns</h2>
          <p className="mt-1 text-xs text-muted-foreground">Performance across all connected ad accounts</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <label className="flex h-9 min-w-0 items-center gap-2 rounded-xl border border-border bg-card/50 px-3 text-muted-foreground">
            <Search size={15} />
            <input
              value={query}
              onChange={event => setQuery(event.target.value)}
              placeholder="Search campaigns"
              className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/50 sm:w-44"
            />
          </label>
          <Button onClick={() => setShowFilters(value => !value)} variant="outline" size="sm">
            <SlidersHorizontal size={14} />
            Filter
          </Button>
          <div className="flex rounded-xl border border-border bg-card p-1">
            <button onClick={() => toggleView("table")} aria-label="Table view" className={`rounded-lg p-1.5 transition-colors ${visibleView === "table" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"}`}>
              <List size={16} />
            </button>
            <button onClick={() => toggleView("card")} aria-label="Card view" className={`rounded-lg p-1.5 transition-colors ${visibleView === "card" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"}`}>
              <Grid2X2 size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="border-b border-border p-4">
          <CampaignFilters filters={filters} onChange={setFilters} objectives={objectives} owners={owners} />
        </div>
      )}

      {/* Bulk Actions */}
      {selected.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 border-b border-primary/20 bg-primary/5 px-5 py-3">
          <span className="mr-2 text-sm font-medium text-foreground">{selected.length} selected</span>
          {([["Pause", Pause], ["Resume", Play], ["Duplicate", Copy], ["Archive", Archive], ["Delete", Trash2], ["Export", Download]] as const).map(([label, Icon]) => (
            <button
              key={label}
              onClick={() => runAction(label as CampaignAction | "Export")}
              className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            >
              <Icon size={13} />
              {label}
            </button>
          ))}
        </div>
      )}

      {/* Table View */}
      {visibleView === "table" ? (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1120px] text-left text-sm">
            <thead className="bg-surface/50 text-[11px] uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-5 py-3">
                  <input
                    type="checkbox"
                    aria-label="Select all visible campaigns"
                    checked={rows.length > 0 && rows.every(c => selected.includes(c.id))}
                    onChange={() => setSelected(current =>
                      rows.every(c => current.includes(c.id))
                        ? current.filter(id => !rows.some(c => c.id === id))
                        : [...new Set([...current, ...rows.map(c => c.id)])]
                    )}
                    className="size-4 accent-primary"
                  />
                </th>
                {["Platform", "Campaign name", "Objective", "Budget", "Spend", "Status", "Conversions", "CTR", "ROAS", "Actions"].map(head => (
                  <th key={head} className="px-5 py-3 font-medium">{head}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {rows.map(campaign => {
                const platform = platforms.find(item => item.id === campaign.platformId)!;
                return (
                  <tr key={campaign.id} className="group transition hover:bg-accent/30">
                    <td className="px-5 py-4">
                      <input
                        type="checkbox"
                        checked={selected.includes(campaign.id)}
                        onChange={() => setSelected(current =>
                          current.includes(campaign.id)
                            ? current.filter(id => id !== campaign.id)
                            : [...current, campaign.id]
                        )}
                        className="size-4 accent-primary"
                      />
                    </td>
                    <td className="px-5 py-4">
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg text-[11px] font-bold" style={{ backgroundColor: `${platform.color}20`, color: platform.color }}>
                        {platform.shortName}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <Link href={`/dashboard/ads/campaigns/${campaign.id}`} className="font-medium text-foreground hover:text-primary transition-colors">
                        {campaign.name}
                      </Link>
                    </td>
                    <td className="px-5 py-4 text-muted-foreground">{campaign.objective}</td>
                    <td className="px-5 py-4 tabular-nums text-foreground">{currency.format(campaign.budget)}</td>
                    <td className="px-5 py-4 tabular-nums text-foreground">{currency.format(campaign.spend)}</td>
                    <td className="px-5 py-4">
                      <span className={`rounded-full px-2.5 py-1 text-xs ${campaignStatusStyle[campaign.status]}`}>{campaign.status}</span>
                    </td>
                    <td className="px-5 py-4 tabular-nums text-foreground">{campaign.conversions}</td>
                    <td className="px-5 py-4 tabular-nums text-foreground">{campaign.ctr.toFixed(2)}%</td>
                    <td className="px-5 py-4 font-medium tabular-nums text-success">{campaign.roas.toFixed(1)}x</td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => runAction(campaign.status === "Paused" ? "Resume" : "Pause", [campaign.id])}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                        aria-label="More actions"
                      >
                        <MoreHorizontal size={17} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-3">
          {rows.map(c => (
            <CampaignCard
              key={c.id}
              campaign={c}
              platform={platforms.find(p => p.id === c.platformId)!}
              selected={selected.includes(c.id)}
              onSelect={() => setSelected(current =>
                current.includes(c.id) ? current.filter(id => id !== c.id) : [...current, c.id]
              )}
              onAction={action =>
                action === "View"
                  ? location.assign(`/dashboard/ads/campaigns/${c.id}`)
                  : action === "Edit"
                  ? location.assign(`/dashboard/ads/campaigns/${c.id}?edit=true`)
                  : runAction(action as CampaignAction, [c.id])
              }
            />
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-border px-5 py-4 text-xs text-muted-foreground">
        <span>Showing {rows.length} of {campaigns.length} campaigns</span>
        <Link href="/dashboard/ads/campaigns" className="text-primary hover:underline">
          Manage all campaigns
        </Link>
      </div>
    </Card>
  );
}