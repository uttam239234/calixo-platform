/**
 * Calixo Platform - Storage Provider Contract
 *
 * One interface every storage backend (local, S3, Azure Blob, GCS, MinIO,
 * DigitalOcean Spaces) implements, so business modules (Assets, Reports, AI
 * generated files, Creative files) never talk to a specific provider's SDK
 * directly.
 */
import type { StorageObjectMeta, StorageProviderKind } from "../types";

export interface StorageUploadInput {
  key: string;
  content: Buffer | string;
  contentType: string;
  organizationId?: string;
  workspaceId?: string;
  category?: StorageObjectMeta["category"];
}

export interface StorageProvider {
  readonly kind: StorageProviderKind;
  readonly isReal: boolean;
  upload(input: StorageUploadInput): Promise<StorageObjectMeta>;
  download(key: string): Promise<Buffer | null>;
  delete(key: string): Promise<boolean>;
  getUrl(key: string): string;
  exists(key: string): Promise<boolean>;
}
