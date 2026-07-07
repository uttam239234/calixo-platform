/** Calixo Platform - Platform Metadata Service. Reuses `@/config`'s `APP` constant and the existing `ModuleRegistry` rather than duplicating version/module info. */
import { APP } from "@/config";
import { ModuleRegistry } from "@/core/modules";

export interface PlatformMetadataSnapshot {
  name: string;
  tagline: string;
  version: string;
  moduleCount: number;
  modules: { id: string; category: string; enabled: boolean }[];
}

export class PlatformMetadataService {
  getSnapshot(): PlatformMetadataSnapshot {
    return {
      name: APP.NAME,
      tagline: APP.TAGLINE,
      version: APP.VERSION,
      moduleCount: ModuleRegistry.getModuleCount(),
      modules: ModuleRegistry.getAll().map(m => ({ id: m.id, category: m.category, enabled: m.enabled })),
    };
  }
}

export const platformMetadataService = new PlatformMetadataService();
