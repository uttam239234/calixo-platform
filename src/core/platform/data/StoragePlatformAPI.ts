/**
 * Calixo Platform - Storage Platform API
 *
 * Defaults to the real `LocalStorageProvider`; other provider kinds are
 * addressable but throw (architecture-only), matching `StorageProviderRegistry`.
 */
import type { StorageObjectMeta, StorageProviderKind } from "./types";
import type { StorageUploadInput } from "./storage/types";
import { storageProviderRegistry } from "./storage/StorageProviderRegistry";

export class StoragePlatformAPI {
  async upload(input: StorageUploadInput, provider: StorageProviderKind = "local"): Promise<StorageObjectMeta> {
    return storageProviderRegistry.get(provider).upload(input);
  }

  async download(key: string, provider: StorageProviderKind = "local"): Promise<Buffer | null> {
    return storageProviderRegistry.get(provider).download(key);
  }

  async delete(key: string, provider: StorageProviderKind = "local"): Promise<boolean> {
    return storageProviderRegistry.get(provider).delete(key);
  }

  getUrl(key: string, provider: StorageProviderKind = "local"): string {
    return storageProviderRegistry.get(provider).getUrl(key);
  }

  listProviders(): { kind: StorageProviderKind; isReal: boolean }[] {
    return storageProviderRegistry.list();
  }
}

export const storagePlatformAPI = new StoragePlatformAPI();
