import { registerDefaultTiers } from "./SubscriptionRegistry";

export * from "./types";
export { DEFAULT_SUBSCRIPTION_TIERS } from "./defaultTiers";
export { SubscriptionRegistry, subscriptionRegistry, registerDefaultTiers } from "./SubscriptionRegistry";
export { SubscriptionEngine, subscriptionEngine } from "./SubscriptionEngine";

let initialized = false;
/** Registers the 5 default tier definitions. Safe to call more than once. */
export function initializeSubscriptionFoundation(): void {
  if (initialized) return;
  registerDefaultTiers();
  initialized = true;
}
