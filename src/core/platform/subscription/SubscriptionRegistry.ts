import { DEFAULT_SUBSCRIPTION_TIERS } from "./defaultTiers";
import type { SubscriptionTier, SubscriptionTierDefinition } from "./types";

/** Catalog of tier definitions — the single source of truth for what each `SubscriptionTier` unlocks. */
export class SubscriptionRegistry {
  private tiers = new Map<SubscriptionTier, SubscriptionTierDefinition>();

  register(definition: SubscriptionTierDefinition): void {
    this.tiers.set(definition.tier, definition);
  }

  registerAll(definitions: SubscriptionTierDefinition[]): void {
    definitions.forEach(d => this.register(d));
  }

  get(tier: SubscriptionTier): SubscriptionTierDefinition | undefined {
    return this.tiers.get(tier);
  }

  list(): SubscriptionTierDefinition[] {
    return Array.from(this.tiers.values());
  }

  count(): number {
    return this.tiers.size;
  }
}

export const subscriptionRegistry = new SubscriptionRegistry();

let registered = false;
export function registerDefaultTiers(): void {
  if (registered) return;
  subscriptionRegistry.registerAll(DEFAULT_SUBSCRIPTION_TIERS);
  registered = true;
}
