import { registerDefaultFeatureFlags } from "./FeatureFlagRegistry";

export * from "./types";
export { FeatureFlagRegistry, featureFlagRegistry, registerDefaultFeatureFlags } from "./FeatureFlagRegistry";
export { FeatureFlagEngine, featureFlagEngine } from "./FeatureFlagEngine";
export type { FeatureFlagDefinition, FlagCategory, FlagTier } from "@/flags";

let initialized = false;
export function initializeFeatureFlagsFoundation(): void {
  if (initialized) return;
  registerDefaultFeatureFlags();
  initialized = true;
}
