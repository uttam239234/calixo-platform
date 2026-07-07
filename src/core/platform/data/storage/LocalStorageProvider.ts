/**
 * Calixo Platform - Local Storage Provider
 *
 * The one REAL, working `StorageProvider` this phase ships: an in-process
 * byte store (no disk/network I/O, consistent with every other in-memory
 * engine in this platform). It genuinely stores and retrieves the bytes it's
 * given for the lifetime of the process — this is not a stub.
 */
import type { StorageObjectMeta } from "../types";
import type { StorageProvider, StorageUploadInput } from "./types";

interface StoredObject {
  buffer: Buffer;
  meta: StorageObjectMeta;
}

export class LocalStorageProvider implements StorageProvider {
  readonly kind = "local" as const;
  readonly isReal = true;
  private objects = new Map<string, StoredObject>();

  async upload(input: StorageUploadInput): Promise<StorageObjectMeta> {
    const buffer = Buffer.isBuffer(input.content) ? input.content : Buffer.from(input.content, "utf-8");
    const meta: StorageObjectMeta = {
      key: input.key,
      provider: "local",
      contentType: input.contentType,
      sizeBytes: buffer.byteLength,
      organizationId: input.organizationId,
      workspaceId: input.workspaceId,
      category: input.category,
      createdAt: new Date().toISOString(),
    };
    this.objects.set(input.key, { buffer, meta });
    return meta;
  }

  async download(key: string): Promise<Buffer | null> {
    return this.objects.get(key)?.buffer ?? null;
  }

  async delete(key: string): Promise<boolean> {
    return this.objects.delete(key);
  }

  async exists(key: string): Promise<boolean> {
    return this.objects.has(key);
  }

  getUrl(key: string): string {
    return `local://storage/${key}`;
  }

  count(): number {
    return this.objects.size;
  }
}

export const localStorageProvider = new LocalStorageProvider();
