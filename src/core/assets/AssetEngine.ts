/** Calixo Platform — Asset Engine (Central orchestrator) */
import type { AssetEntry, AssetRelationship, AssetCollection, AssetVersion, AssetType, RelationshipType, CollectionType } from "./types";
import { MOCK_ASSETS, MOCK_RELATIONSHIPS, MOCK_COLLECTIONS, MOCK_VERSIONS } from "./mock-data";

const assets = new Map(MOCK_ASSETS.map(a => [a.id, a]));
const rels = [...MOCK_RELATIONSHIPS];
const cols = [...MOCK_COLLECTIONS];
const versions = [...MOCK_VERSIONS];

function clone<T>(v: T): T { return JSON.parse(JSON.stringify(v)); }

export const AssetEngine = {
  // Assets
  get(id: string): AssetEntry | undefined { return assets.has(id) ? clone(assets.get(id)!) : undefined; },
  getAll(): AssetEntry[] { return Array.from(assets.values()).map(clone); },
  getByType(type: AssetType): AssetEntry[] { return this.getAll().filter(a => a.type === type); },
  getByBrand(brand: string): AssetEntry[] { return this.getAll().filter(a => a.brand === brand); },
  getByCampaign(campaign: string): AssetEntry[] { return this.getAll().filter(a => a.campaign === campaign); },
  getByCollection(collectionId: string): AssetEntry[] { return this.getAll().filter(a => a.collectionIds.includes(collectionId)); },
  search(query: string): AssetEntry[] { const q = query.toLowerCase(); return this.getAll().filter(a => a.name.toLowerCase().includes(q) || a.tags.some(t => t.toLowerCase().includes(q)) || a.categories.some(c => c.toLowerCase().includes(q))); },
  count(): number { return assets.size; },
  typeCounts(): Record<string, number> { const c: Record<string, number> = {}; for (const a of assets.values()) { c[a.type] = (c[a.type] ?? 0) + 1; } return c; },

  // Relationships
  getRelationships(assetId: string): AssetRelationship[] { return rels.filter(r => r.sourceId === assetId || r.targetId === assetId).map(clone); },
  getAllRelationships(): AssetRelationship[] { return rels.map(clone); },

  // Collections
  getCollections(): AssetCollection[] { return cols.map(clone); },
  getCollection(id: string): AssetCollection | undefined { return cols.find(c => c.id === id) ? clone(cols.find(c => c.id === id)!) : undefined; },

  // Versions
  getVersions(assetId: string): AssetVersion[] { return versions.filter(v => v.assetId === assetId).map(clone); },
  getAllVersions(): AssetVersion[] { return versions.map(clone); },
  getCurrentVersion(assetId: string): AssetVersion | undefined { return this.getVersions(assetId).find(v => v.isCurrent); },

  // History
  getHistory(): { type: string; assetId: string; timestamp: string; action: string }[] { return versions.slice(0,100).map(v => ({ type: "version", assetId: v.assetId, timestamp: v.createdAt, action: `Created version ${v.version}` })); },

  // Create (generation modules saving an AI-generated output — e.g. Content Studio)
  saveGeneratedAsset(input: { name: string; type: AssetType; workspace: string; createdBy: string; fileUrl?: string; preview?: string; brand?: string; campaign?: string; tags?: string[]; metadata?: Record<string, unknown> }): AssetEntry {
    const now = new Date().toISOString();
    const entry: AssetEntry = {
      id: `asset-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      type: input.type,
      name: input.name,
      description: "",
      workspace: input.workspace,
      brand: input.brand,
      campaign: input.campaign,
      owner: input.createdBy,
      createdBy: input.createdBy,
      updatedBy: input.createdBy,
      createdAt: now,
      updatedAt: now,
      tags: input.tags ?? [],
      categories: [],
      collectionIds: [],
      currentVersion: 1,
      approvalStatus: "draft",
      permissions: [{ userId: input.createdBy, role: "owner" }],
      metadata: input.metadata ?? {},
      preview: input.preview,
      thumbnail: input.preview,
      sourceProvider: "content-studio",
      aiHistory: [],
      mimeType: input.type === "image" ? "image/png" : "text/plain",
      fileSize: 0,
      fileUrl: input.fileUrl,
    };
    assets.set(entry.id, entry);
    return clone(entry);
  },

  // Export
  export(format: string): string {
    switch (format) {
      case "json": return JSON.stringify({ assets: MOCK_ASSETS.slice(0,50), relationships: rels.slice(0,30), collections: cols.slice(0,15), versions: versions.slice(0,50) }, null, 2);
      case "manifest": return JSON.stringify({ totalAssets: assets.size, totalRelationships: rels.length, totalCollections: cols.length, totalVersions: versions.length, exportedAt: new Date().toISOString() }, null, 2);
      default: return JSON.stringify({ exported: true });
    }
  },
};