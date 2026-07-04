/** Calixo Platform — Library Engine (Consumes AssetEngine) */
import { AssetEngine } from "@/core/assets/AssetEngine";
import type { AssetEntry } from "@/core/assets/types";
import type { LibraryFilter, LibrarySearchResult, SortField, SortOrder } from "./types";

export const LibraryEngine = {
  search(query: string, filters: LibraryFilter = {}, sort: { field: SortField; order: SortOrder } = { field: "updatedAt", order: "desc" }): LibrarySearchResult {
    let assets = query ? AssetEngine.search(query) : AssetEngine.getAll();
    if (filters.brand) assets = assets.filter(a => (a.brand ?? "") === filters.brand);
    if (filters.campaign) assets = assets.filter(a => (a.campaign ?? "") === filters.campaign);
    if (filters.assetType) assets = assets.filter(a => a.type === filters.assetType);
    if (filters.createdBy) assets = assets.filter(a => a.createdBy === filters.createdBy);
    if (filters.collectionId) assets = assets.filter(a => a.collectionIds.includes(filters.collectionId!));
    assets.sort((a, b) => {
      const va = a[sort.field] ?? "", vb = b[sort.field] ?? "";
      return sort.order === "asc" ? String(va).localeCompare(String(vb)) : String(vb).localeCompare(String(va));
    });
    return { assets, totalCount: assets.length, query, filters, sort };
  },
  getAsset(id: string): AssetEntry | undefined { return AssetEngine.get(id); },
  getRelationships(assetId: string) { return AssetEngine.getRelationships(assetId); },
  getVersions(assetId: string) { return AssetEngine.getVersions(assetId); },
  getCollections() { return AssetEngine.getCollections(); },
  getByBrand(brand: string) { return AssetEngine.getByBrand(brand); },
  getByCampaign(campaign: string) { return AssetEngine.getByCampaign(campaign); },
  getRecent(limit = 20): AssetEntry[] { return AssetEngine.getAll().sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, limit); },
  getFavorites(): AssetEntry[] { return AssetEngine.getAll().filter(a => a.approvalStatus === "approved").slice(0, 20); },
  countByType() { return AssetEngine.typeCounts(); },
  count() { return AssetEngine.count(); },
};