/**
 * Calixo Platform - Assets Platform API
 *
 * The sanctioned way another module reads Asset data — wraps `AssetEngine`
 * so Dashboard (and any future consumer) no longer needs to import it
 * directly (flagged as direct engine coupling by the Enterprise
 * Architecture Audit). `DashboardEngine` is redirected here as the
 * reference consumer, mirroring Analytics' `AnalyticsPlatformAPI` pattern.
 */
import { AssetEngine } from "../AssetEngine";
import type { AssetSummary } from "@/core/platform/contracts";
import type { AssetType } from "../types";

export interface MediaAssetSummary {
  id: string;
  name: string;
  type: "image" | "video";
  url: string;
}

export class AssetsPlatformAPI {
  /** A renderable-media-specific view (real `preview`/`thumbnail`/`fileUrl`, not part of the shared `AssetSummary` contract) — for pickers that need an actual URL, like Social Media's composer attaching from the real Asset Library instead of only local file upload. */
  listMediaAssets(type?: Extract<AssetType, "image" | "video">, query?: string): MediaAssetSummary[] {
    const assets = query ? AssetEngine.search(query) : AssetEngine.getAll();
    return assets
      .filter((asset): asset is typeof asset & { type: "image" | "video" } => (asset.type === "image" || asset.type === "video") && (!type || asset.type === type))
      .map(asset => ({ id: asset.id, name: asset.name, type: asset.type, url: asset.preview ?? asset.thumbnail ?? asset.fileUrl ?? "" }))
      .filter(asset => asset.url);
  }

  getAssetSummary(id: string): AssetSummary | undefined {
    const asset = AssetEngine.get(id);
    if (!asset) return undefined;
    return { id: asset.id, name: asset.name, type: asset.type, brand: asset.brand, approvalStatus: asset.approvalStatus };
  }

  listAssetSummaries(brand?: string): AssetSummary[] {
    const assets = brand ? AssetEngine.getByBrand(brand) : AssetEngine.getAll();
    return assets.map(a => ({ id: a.id, name: a.name, type: a.type, brand: a.brand, approvalStatus: a.approvalStatus }));
  }

  /** The fix for every "Save as Asset" dead button — a real create path, previously nonexistent (Assets was read-only). */
  saveGeneratedAsset(input: { name: string; type: AssetType; workspace: string; createdBy: string; fileUrl?: string; preview?: string; brand?: string; campaign?: string; tags?: string[] }): AssetSummary {
    const entry = AssetEngine.saveGeneratedAsset(input);
    return { id: entry.id, name: entry.name, type: entry.type, brand: entry.brand, approvalStatus: entry.approvalStatus };
  }

  /** The exact shape Dashboard's activity feed needs — replaces direct `AssetEngine.getHistory()`/`.get()` calls in `DashboardEngine`. */
  getRecentActivity(limit = 10): { assetId: string; assetName: string; action: string; timestamp: string }[] {
    return AssetEngine.getHistory()
      .slice(0, limit)
      .map(h => ({ assetId: h.assetId, assetName: AssetEngine.get(h.assetId)?.name ?? h.assetId, action: h.action, timestamp: h.timestamp }));
  }

  count(): number {
    return AssetEngine.count();
  }
}

export const assetsPlatformAPI = new AssetsPlatformAPI();
