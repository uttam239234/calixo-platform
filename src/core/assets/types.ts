/** Calixo Platform — Enterprise Asset Platform Types */

export type AssetType = "image" | "video" | "audio" | "document" | "spreadsheet" | "presentation" | "pdf" | "content-doc" | "creative-doc" | "template" | "prompt" | "brand-asset" | "campaign-resource" | "font" | "code" | "archive";
export type AssetPermission = "owner" | "editor" | "reviewer" | "viewer" | "public";
export type RelationshipType = "parent" | "child" | "reference" | "derived-from" | "variation" | "version-of" | "campaign-member" | "brand-resource" | "template-source";
export type CollectionType = "folder" | "smart" | "favorite" | "recent" | "archive" | "campaign" | "brand" | "shared";

export interface AssetVersion { id: string; assetId: string; version: number; label: string; notes: string; createdAt: string; createdBy: string; snapshot: Record<string, unknown>; isCurrent: boolean; }
export interface AssetRelationship { id: string; sourceId: string; targetId: string; type: RelationshipType; createdAt: string; metadata?: Record<string, unknown>; }
export interface AssetCollection { id: string; name: string; type: CollectionType; assetIds: string[]; parentId?: string; createdBy: string; createdAt: string; isSystem: boolean; }
export interface AssetEntry {
  id: string; type: AssetType; name: string; description: string; workspace: string; brand?: string; campaign?: string;
  owner: string; createdBy: string; updatedBy: string; createdAt: string; updatedAt: string;
  tags: string[]; categories: string[]; collectionIds: string[];
  currentVersion: number; approvalStatus: "draft" | "review" | "approved" | "rejected";
  permissions: { userId: string; role: AssetPermission }[];
  metadata: Record<string, unknown>; preview?: string; thumbnail?: string;
  sourceProvider?: string; aiHistory: string[];
  mimeType: string; fileSize: number; fileUrl?: string;
}