/** Calixo Platform - Platform Health Service. A local health snapshot (registry counts + config) — not a networked health-check endpoint yet (no `src/app/api` exists; that's a later phase per the Definition of Done). */
import { platformConfigService } from "./PlatformConfigService";
import { platformRegistry } from "./PlatformRegistry";

export interface PlatformHealthSnapshot {
  status: "healthy" | "degraded";
  environment: string;
  registries: Record<string, { kind: string; count: number }>;
  checkedAt: string;
}

export class PlatformHealthService {
  getSnapshot(): PlatformHealthSnapshot {
    const registries = platformRegistry.snapshot();
    return {
      status: platformRegistry.count() > 0 ? "healthy" : "degraded",
      environment: platformConfigService.environment,
      registries,
      checkedAt: new Date().toISOString(),
    };
  }
}

export const platformHealthService = new PlatformHealthService();
