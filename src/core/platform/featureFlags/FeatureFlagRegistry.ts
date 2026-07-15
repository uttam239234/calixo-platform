/**
 * Completes the existing `@/flags` framework (previously defined, zero
 * consumers anywhere — see the Enterprise Architecture Audit) rather than
 * duplicating it: `FLAG_REGISTRY`'s module-level flags are reused as-is;
 * this registry only adds the "feature" category flags subscription tiers
 * gate (see `../subscription/defaultTiers.ts`'s `featureGates` lists).
 */
import { FLAG_REGISTRY, type FeatureFlagDefinition } from "@/flags";

const DEFAULT_FEATURE_FLAGS: FeatureFlagDefinition[] = [
  { id: "custom-kpi-builder", label: "Custom KPI Builder", description: "Author custom analytics metrics", defaultEnabled: false, category: "subscription" },
  { id: "saved-segments", label: "Saved Segments", description: "Save and reuse audience/campaign segments", defaultEnabled: false, category: "subscription" },
  { id: "sso", label: "Single Sign-On", description: "SAML/OIDC single sign-on", defaultEnabled: false, category: "subscription" },
  { id: "audit-export", label: "Audit Log Export", description: "Export the full audit trail", defaultEnabled: false, category: "subscription" },
  { id: "white-label", label: "White Label", description: "Remove Calixo branding for end customers", defaultEnabled: false, category: "subscription" },
];

export class FeatureFlagRegistry {
  private extra = new Map<string, FeatureFlagDefinition>();

  register(definition: FeatureFlagDefinition): void {
    this.extra.set(definition.id, definition);
  }

  registerAll(definitions: FeatureFlagDefinition[]): void {
    definitions.forEach(d => this.register(d));
  }

  /**
   * Overrides win: an `extra` entry for a `FLAG_REGISTRY` id is a real edit
   * (e.g. Experiments' `rolloutPercent`) that must actually be visible to
   * evaluation. Previously checked `FLAG_REGISTRY` first, so `register()`ing
   * an override for any static flag was silently never read by
   * `FeatureFlagEngine.evaluate()` — a real, found-during-persistence-work
   * bug (see the Round 20 investigation report), not a hypothetical one.
   */
  get(id: string): FeatureFlagDefinition | undefined {
    return this.extra.get(id) ?? FLAG_REGISTRY.find(f => f.id === id);
  }

  /** Merges `extra` overrides over their `FLAG_REGISTRY` counterpart by id instead of concatenating — concatenating duplicated every edited static flag. */
  list(): FeatureFlagDefinition[] {
    const merged = FLAG_REGISTRY.map(f => this.extra.get(f.id) ?? f);
    const additions = Array.from(this.extra.values()).filter(f => !FLAG_REGISTRY.some(sf => sf.id === f.id));
    return [...merged, ...additions];
  }

  count(): number {
    return this.list().length;
  }
}

export const featureFlagRegistry = new FeatureFlagRegistry();

let registered = false;
export function registerDefaultFeatureFlags(): void {
  if (registered) return;
  featureFlagRegistry.registerAll(DEFAULT_FEATURE_FLAGS);
  registered = true;
}
