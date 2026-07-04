/** Calixo Platform — Library Types */
import type { AssetEntry, AssetRelationship, AssetCollection } from "@/core/assets/types";

export type ViewMode = "grid" | "list" | "gallery" | "timeline" | "graph";
export type SortField = "name" | "createdAt" | "updatedAt" | "type";
export type SortOrder = "asc" | "desc";

export interface LibraryFilter {
  brand?: string; campaign?: string; platform?: string; creativeType?: string;
  approvalStatus?: string; assetType?: string; provider?: string; createdBy?: string;
  dateFrom?: string; dateTo?: string; collectionId?: string;
}

export interface LibrarySearchResult {
  assets: AssetEntry[]; totalCount: number; query: string; filters: LibraryFilter; sort: { field: SortField; order: SortOrder };
}

export interface LibraryState {
  viewMode: ViewMode; selectedAssetId: string | null; searchQuery: string;
  filters: LibraryFilter; sort: { field: SortField; order: SortOrder };
}