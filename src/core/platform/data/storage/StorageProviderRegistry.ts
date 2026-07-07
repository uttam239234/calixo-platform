/**
 * Calixo Platform - Storage Provider Registry
 *
 * Registers `LocalStorageProvider` (real) plus architecture-only extension
 * points for S3 / Azure Blob / GCS / MinIO / DigitalOcean Spaces —
 * interface-registered so `StoragePlatformAPI` can address them by kind,
 * but with `isReal: false` and every method throwing "not implemented",
 * exactly like the API Auth extension points from Track 1 Phase 3.
 */
import type { StorageObjectMeta, StorageProviderKind } from "../types";
import type { StorageProvider } from "./types";
import { localStorageProvider } from "./LocalStorageProvider";

function notImplemented(kind: StorageProviderKind): StorageProvider {
  const fail = (): never => {
    throw new Error(`Storage provider '${kind}' is registered as an architecture-only extension point — no real credentials/SDK are wired up this phase.`);
  };
  return {
    kind,
    isReal: false,
    upload: async (): Promise<StorageObjectMeta> => fail(),
    download: async () => fail(),
    delete: async () => fail(),
    exists: async () => fail(),
    getUrl: () => fail(),
  };
}

export class StorageProviderRegistry {
  private providers = new Map<StorageProviderKind, StorageProvider>([
    ["local", localStorageProvider],
    ["s3", notImplemented("s3")],
    ["azure_blob", notImplemented("azure_blob")],
    ["gcs", notImplemented("gcs")],
    ["minio", notImplemented("minio")],
    ["do_spaces", notImplemented("do_spaces")],
  ]);

  get(kind: StorageProviderKind): StorageProvider {
    const provider = this.providers.get(kind);
    if (!provider) throw new Error(`Unknown storage provider: ${kind}`);
    return provider;
  }

  list(): { kind: StorageProviderKind; isReal: boolean }[] {
    return Array.from(this.providers.values()).map(p => ({ kind: p.kind, isReal: p.isReal }));
  }

  count(): number {
    return this.providers.size;
  }
}

export const storageProviderRegistry = new StorageProviderRegistry();
