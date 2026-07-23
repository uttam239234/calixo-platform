/**
 * Calixo Platform - Universal Connector Framework
 *
 * The reusable backend infrastructure that will power every real
 * integration inside Calixo (Settings -> Integrations, AI Copilot,
 * Analytics, Reports, Brand Monitoring, Content Studio, future
 * Automations) — NOT a user-facing feature itself. No UI was added or
 * changed this phase; Settings -> Integrations keeps working exactly as
 * it does today via its own existing `src/integrations/` +
 * `core/platform/connectors/` stack, untouched.
 *
 * `initializeConnectorFramework()` is the one call a future phase (or this
 * phase's own verification harness) makes to bring the framework fully
 * online: registers all 9 provider adapters and wires the recurring
 * scheduler jobs. Never auto-invoked at import time — same "never
 * auto-invoked" precedent as `initializeAIOS()`/`initializeBackgroundPlatform()`.
 */
import "server-only";
import { appLogger } from "@/logging";
import { registerAllConnectors } from "./providers";
import { connectorJobScheduler } from "./ConnectorJobScheduler";

export * from "./types";
export { connectorRegistry } from "./ConnectorRegistry";
export { oauthManager } from "./OAuthManager";
export { tokenManager } from "./TokenManager";
export { rateLimitManager } from "./RateLimitManager";
export { retryManager, withRetry, classifyError } from "./RetryManager";
export { connectorEventBus } from "./ConnectorEventBus";
export { connectorLogger } from "./ConnectorLogger";
export { connectorHealthEngine } from "./ConnectorHealthEngine";
export { syncEngine } from "./SyncEngine";
export { webhookManager } from "./WebhookManager";
export { connectorJobScheduler } from "./ConnectorJobScheduler";
export { connectorFrameworkAPI, NotAuthorizedError } from "./ConnectorFrameworkAPI";
export * from "./providers";
export { listAllOrganizationIdsWithConnectorData } from "./persistence/ConnectorDataStore";

let initialized = false;

export async function initializeConnectorFramework(): Promise<void> {
  if (initialized) return;
  registerAllConnectors();
  await connectorJobScheduler.initialize();
  initialized = true;
  appLogger.info("ConnectorFramework", `Universal Connector Framework online — ${(await import("./ConnectorRegistry")).connectorRegistry.list().length} connectors registered.`);
}

export function isConnectorFrameworkInitialized(): boolean {
  return initialized;
}
