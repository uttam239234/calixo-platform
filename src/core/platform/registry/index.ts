import { registerAllPlatformRegistries } from "./registerAllPlatformRegistries";

export { PlatformRegistry, platformRegistry } from "./PlatformRegistry";
export type { RegisteredRegistry } from "./PlatformRegistry";
export { registerAllPlatformRegistries } from "./registerAllPlatformRegistries";
export { PlatformMetadataService, platformMetadataService } from "./PlatformMetadataService";
export type { PlatformMetadataSnapshot } from "./PlatformMetadataService";
export { PlatformConfigService, platformConfigService } from "./PlatformConfigService";
export { PlatformHealthService, platformHealthService } from "./PlatformHealthService";
export type { PlatformHealthSnapshot } from "./PlatformHealthService";

let initialized = false;
export function initializePlatformRegistryFoundation(): void {
  if (initialized) return;
  registerAllPlatformRegistries();
  initialized = true;
}
