/**
 * Calixo Platform - Credit Pack Platform API
 */
import { creditPackEngine } from "./CreditPackEngine";
import type { CreditPackDefinition } from "./types";

export class CreditPackPlatformAPI {
  register(pack: CreditPackDefinition): CreditPackDefinition {
    return creditPackEngine.register(pack);
  }

  list(opts: { activeOnly?: boolean } = {}): CreditPackDefinition[] {
    return creditPackEngine.list(opts);
  }

  setActive(id: string, isActive: boolean): CreditPackDefinition {
    return creditPackEngine.setActive(id, isActive);
  }

  reorder(id: string, direction: "up" | "down"): CreditPackDefinition[] {
    return creditPackEngine.reorder(id, direction);
  }
}

export const creditPackPlatformAPI = new CreditPackPlatformAPI();
