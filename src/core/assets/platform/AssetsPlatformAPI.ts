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

export class AssetsPlatformAPI {
  getAssetSummary(id: string): AssetSummary | undefined {
    const asset = AssetEngine.get(id);
    if (!asset) return undefined;
    return { id: asset.id, name: asset.name, type: asset.type, brand: asset.brand, approvalStatus: asset.approvalStatus };
  }

  listAssetSummaries(brand?: string): AssetSummary[] {
    const assets = brand ? AssetEngine.getByBrand(brand) : AssetEngine.getAll();
    return assets.map(a => ({ id: a.id, name: a.name, type: a.type, brand: a.brand, approvalStatus: a.approvalStatus }));
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
