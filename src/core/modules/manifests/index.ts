import { dashboardManifest } from "./dashboard.manifest";
import { analyticsManifest } from "./analytics.manifest";
import { adsManagerManifest } from "./ads.manifest";
import { socialMediaManifest } from "./social.manifest";
import { brandMonitoringManifest } from "./brand.manifest";
import { contentManifest } from "./content.manifest";
import { aiCopilotManifest } from "./ai-copilot.manifest";
import { reportsManifest } from "./reports.manifest";
import { administrationManifest } from "./administration.manifest";
import { ModuleRegistry } from "../ModuleRegistry";
import type { ModuleManifest } from "../ModuleManifest";

const allManifests: ModuleManifest[] = [
  dashboardManifest,
  analyticsManifest,
  adsManagerManifest,
  socialMediaManifest,
  brandMonitoringManifest,
  contentManifest,
  aiCopilotManifest,
  reportsManifest,
  administrationManifest,
];

export { allManifests };

let bootstrapped = false;

export function registerAllModules(): void {
  if (bootstrapped) return;
  bootstrapped = true;
  ModuleRegistry.registerAll(allManifests);
}
