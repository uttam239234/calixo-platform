import type { Campaign, CampaignSortKey, CampaignStatus } from "./types";

export type CampaignAction = "Pause" | "Resume" | "Archive" | "Duplicate" | "Delete";
export type SortDirection = "asc" | "desc";
export interface CampaignFilterState { status: string; platform: string; objective: string; budget: string; created: string; owner: string; sort: CampaignSortKey; direction: SortDirection; }
export const defaultCampaignFilters: CampaignFilterState = { status: "", platform: "", objective: "", budget: "", created: "", owner: "", sort: "spend", direction: "desc" };

export function filterCampaigns(campaigns: Campaign[], query: string, filters: CampaignFilterState, platformNames: Record<string, string>, now = new Date()) {
  const normalizedQuery = query.trim().toLowerCase();
  const createdAfter = filters.created ? new Date(now) : null;
  if (createdAfter) createdAfter.setDate(createdAfter.getDate() - Number(filters.created));
  return campaigns.filter((campaign) => {
    const searchable = `${campaign.name} ${platformNames[campaign.platformId] ?? ""} ${campaign.objective} ${campaign.status}`.toLowerCase();
    const budgetMatches = !filters.budget || (filters.budget === "under1" && campaign.budget < 1000) || (filters.budget === "1to5" && campaign.budget >= 1000 && campaign.budget < 5000) || (filters.budget === "5to10" && campaign.budget >= 5000 && campaign.budget < 10000) || (filters.budget === "10to25" && campaign.budget >= 10000 && campaign.budget < 25000) || (filters.budget === "over25" && campaign.budget >= 25000);
    const createdMatches = !createdAfter || new Date(`${campaign.createdAt}T00:00:00`) >= createdAfter;
    return searchable.includes(normalizedQuery) && (!filters.status || campaign.status === filters.status) && (!filters.platform || campaign.platformId === filters.platform) && (!filters.objective || campaign.objective === filters.objective) && budgetMatches && createdMatches && (!filters.owner || campaign.owner === filters.owner);
  });
}

export function createCampaignId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `campaign-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function applyCampaignAction(campaigns: Campaign[], ids: string[], action: CampaignAction): Campaign[] {
  if (action === "Delete") return campaigns.filter((campaign) => !ids.includes(campaign.id));
  if (action === "Duplicate") {
    const clones = campaigns.filter((campaign) => ids.includes(campaign.id)).map((campaign) => ({ ...campaign, id: createCampaignId(), name: `${campaign.name} Copy`, status: "Draft" as CampaignStatus, createdAt: new Date().toISOString().slice(0, 10) }));
    return [...campaigns, ...clones];
  }
  const status: CampaignStatus = action === "Pause" ? "Paused" : action === "Resume" ? "Running" : "Archived";
  return campaigns.map((campaign) => ids.includes(campaign.id) ? { ...campaign, status } : campaign);
}

export function sortCampaigns(campaigns: Campaign[], key: CampaignSortKey, direction: SortDirection) {
  return [...campaigns].sort((a, b) => {
    const comparison = key === "name" ? a.name.localeCompare(b.name) : key === "createdAt" ? a.createdAt.localeCompare(b.createdAt) : Number(a[key]) - Number(b[key]);
    return direction === "asc" ? comparison : -comparison;
  });
}

export function exportCampaignsCsv(campaigns: Campaign[]) {
  const columns: Array<[string, keyof Campaign]> = [["Campaign Name", "name"], ["Platform", "platformId"], ["Objective", "objective"], ["Status", "status"], ["Budget", "budget"], ["Spend", "spend"], ["Conversions", "conversions"], ["CTR", "ctr"], ["ROAS", "roas"], ["CPA", "cpa"], ["Created Date", "createdAt"]];
  const escape = (value: unknown) => `"${String(value).replaceAll('"', '""')}"`;
  const csv = [columns.map(([label]) => escape(label)).join(","), ...campaigns.map((campaign) => columns.map(([, key]) => escape(campaign[key])).join(","))].join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const anchor = document.createElement("a"); anchor.href = url; anchor.download = `calixo-campaigns-${new Date().toISOString().slice(0, 10)}.csv`; anchor.click(); URL.revokeObjectURL(url);
}
