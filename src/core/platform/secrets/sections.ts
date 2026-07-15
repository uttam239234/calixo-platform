/**
 * Calixo Platform - Internal Platform Secrets Console: Section Labels
 *
 * Deliberately split out of `types.ts`/`index.ts` (both `import "server-only"`
 * transitively) — these are plain display labels with zero sensitivity, and
 * the client page needs them at runtime to render section tabs. No secret
 * material, no vault, no crypto lives in this file.
 */
import type { SecretSection } from "./types";

export const SECTION_LABELS: Record<SecretSection, string> = {
  ai_providers: "AI Providers",
  authentication: "Authentication",
  payments: "Payments",
  integrations: "Integrations",
  security: "Security",
  database: "Database",
  storage: "Storage",
  monitoring: "Monitoring",
};

export const SECTION_ORDER: SecretSection[] = ["ai_providers", "authentication", "payments", "integrations", "security", "database", "storage", "monitoring"];
