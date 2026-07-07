export * from "./types";
export { OrganizationRegistry, organizationRegistry } from "./OrganizationRegistry";
export type { OrganizationListParams } from "./OrganizationRegistry";
export { OrganizationEngine, organizationEngine } from "./OrganizationEngine";
export { OrganizationPlatformAPI, organizationPlatformAPI } from "./OrganizationPlatformAPI";
export { seedOrganizationsPlatformMockData } from "./mock/seedOrganizationsPlatform";
export type { OrganizationsMockSeedResult } from "./mock/seedOrganizationsPlatform";

let initialized = false;
/** No built-in default organization catalog (same as Users & Teams) — this just flips the idempotency guard. Real orgs arrive via `OrganizationEngine.create()` or the opt-in mock seed. */
export function initializeOrganizationsFoundation(): void {
  if (initialized) return;
  initialized = true;
}
