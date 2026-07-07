/**
 * Calixo Platform - Health Platform API
 */
import { healthEngine, type CustomHealthCheck } from "./HealthEngine";
import type { UnifiedHealthSnapshot } from "./types";

export class HealthPlatformAPI {
  getSnapshot(): Promise<UnifiedHealthSnapshot> {
    return healthEngine.getSnapshot();
  }

  registerCustomCheck(name: string, check: CustomHealthCheck): void {
    healthEngine.registerCustomCheck(name, check);
  }
}

export const healthPlatformAPI = new HealthPlatformAPI();
