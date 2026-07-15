/**
 * Calixo Platform - Internal Platform Secrets Console: Catalog
 *
 * The fixed set of platform-level secrets each section manages — distinct
 * from `src/integrations`' per-organization connector credentials (a
 * customer's own Slack/HubSpot/etc. connection). These are Calixo's OWN
 * operational secrets: the ones that would otherwise live in `.env` or a
 * host's environment panel. "AI Providers" deliberately reuses the exact env
 * var names `src/aios/config/models.ts`'s `PROVIDER_CONFIGS` already
 * declares (`OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `GOOGLE_AI_API_KEY`) —
 * found declared with zero configuration surface anywhere in the app before
 * this console. "Authentication" reuses Round 18's real Clerk env var names
 * for the same reason.
 *
 * A basic non-empty check gates every Add/Update — `validateFormat` is
 * intentionally NOT enforced at save time, so "Validate Secret" has a real
 * chance to catch a badly-formatted value after the fact rather than being
 * unreachable dead UI.
 */
import type { SecretCatalogEntry } from "./types";

function pattern(regex: RegExp, expectation: string) {
  return (plaintext: string): { valid: boolean; message: string } => {
    if (!plaintext.trim()) return { valid: false, message: "Empty value." };
    return regex.test(plaintext.trim())
      ? { valid: true, message: `Matches the expected format (${expectation}).` }
      : { valid: false, message: `Does not match the expected format (${expectation}).` };
  };
}

function minLength(n: number) {
  return (plaintext: string): { valid: boolean; message: string } => {
    const trimmed = plaintext.trim();
    if (!trimmed) return { valid: false, message: "Empty value." };
    return trimmed.length >= n ? { valid: true, message: `At least ${n} characters.` } : { valid: false, message: `Shorter than the expected minimum of ${n} characters.` };
  };
}

export const SECRET_CATALOG: SecretCatalogEntry[] = [
  // AI Providers
  {
    id: "openai_api_key",
    section: "ai_providers",
    label: "OpenAI API Key",
    description: "Used by AIOS's OpenAI provider (gpt-4o-mini and the rest of the fallback chain).",
    placeholder: "sk-...",
    rotationStrategy: "manual",
    testSupport: "live",
    envVar: "OPENAI_API_KEY",
    validateFormat: pattern(/^sk-[A-Za-z0-9_-]{20,}$/, "starts with sk-, 20+ chars"),
  },
  {
    id: "anthropic_api_key",
    section: "ai_providers",
    label: "Anthropic API Key",
    description: "Used by AIOS's Anthropic (Claude) provider.",
    placeholder: "sk-ant-...",
    rotationStrategy: "manual",
    testSupport: "live",
    envVar: "ANTHROPIC_API_KEY",
    validateFormat: pattern(/^sk-ant-[A-Za-z0-9_-]{20,}$/, "starts with sk-ant-, 20+ chars"),
  },
  {
    id: "google_ai_api_key",
    section: "ai_providers",
    label: "Google AI (Gemini) API Key",
    description: "Used by AIOS's Google provider.",
    placeholder: "AIza...",
    rotationStrategy: "manual",
    testSupport: "format_only",
    envVar: "GOOGLE_AI_API_KEY",
    validateFormat: minLength(20),
  },

  // Authentication
  {
    id: "clerk_publishable_key",
    section: "authentication",
    label: "Clerk Publishable Key",
    description: "Loaded at process boot as NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY. Editing here updates Calixo's own record; the running server still needs the real .env value and a restart to pick up a change — no live app hot-reloads a compiled process's own env.",
    placeholder: "pk_test_... or pk_live_...",
    rotationStrategy: "manual",
    testSupport: "format_only",
    envVar: "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
    validateFormat: pattern(/^pk_(test|live)_[A-Za-z0-9]+$/, "starts with pk_test_ or pk_live_"),
  },
  {
    id: "clerk_secret_key",
    section: "authentication",
    label: "Clerk Secret Key",
    description: "Loaded at process boot as CLERK_SECRET_KEY — the real key Round 18's identity migration reads via @clerk/nextjs/server.",
    placeholder: "sk_test_... or sk_live_...",
    rotationStrategy: "manual",
    testSupport: "format_only",
    envVar: "CLERK_SECRET_KEY",
    validateFormat: pattern(/^sk_(test|live)_[A-Za-z0-9]+$/, "starts with sk_test_ or sk_live_"),
  },
  {
    id: "clerk_webhook_signing_secret",
    section: "authentication",
    label: "Clerk Webhook Signing Secret",
    description: "Verifies signatures on src/app/api/webhooks/clerk/route.ts via verifyWebhook().",
    placeholder: "whsec_...",
    rotationStrategy: "manual",
    testSupport: "format_only",
    envVar: "CLERK_WEBHOOK_SIGNING_SECRET",
    validateFormat: pattern(/^whsec_[A-Za-z0-9+/=]+$/, "starts with whsec_"),
  },

  // Payments
  {
    id: "stripe_secret_key",
    section: "payments",
    label: "Stripe Secret Key",
    description: "Server-side key for real payment/subscription operations.",
    placeholder: "sk_test_... or sk_live_...",
    rotationStrategy: "manual",
    testSupport: "live",
    validateFormat: pattern(/^sk_(test|live)_[A-Za-z0-9]+$/, "starts with sk_test_ or sk_live_"),
  },
  {
    id: "stripe_webhook_secret",
    section: "payments",
    label: "Stripe Webhook Signing Secret",
    description: "Verifies signatures on incoming Stripe webhook events.",
    placeholder: "whsec_...",
    rotationStrategy: "manual",
    testSupport: "format_only",
    validateFormat: pattern(/^whsec_[A-Za-z0-9+/=]+$/, "starts with whsec_"),
  },
  {
    id: "stripe_publishable_key",
    section: "payments",
    label: "Stripe Publishable Key",
    description: "Client-facing key for Stripe.js checkout elements.",
    placeholder: "pk_test_... or pk_live_...",
    rotationStrategy: "manual",
    testSupport: "format_only",
    validateFormat: pattern(/^pk_(test|live)_[A-Za-z0-9]+$/, "starts with pk_test_ or pk_live_"),
  },

  // Integrations (platform-level OAuth app credentials — distinct from a customer's own per-org connector secrets in src/integrations)
  {
    id: "slack_app_client_secret",
    section: "integrations",
    label: "Slack App Client Secret",
    description: "Calixo's own Slack App OAuth client secret — used to complete OAuth for every customer connecting Slack, not one customer's own connection.",
    placeholder: "Client secret from the Slack app dashboard",
    rotationStrategy: "manual",
    testSupport: "format_only",
    validateFormat: minLength(16),
  },
  {
    id: "google_oauth_client_secret",
    section: "integrations",
    label: "Google OAuth Client Secret",
    description: "Calixo's own Google Cloud OAuth client secret for Google Ads/Analytics connector authorization.",
    placeholder: "GOCSPX-...",
    rotationStrategy: "manual",
    testSupport: "format_only",
    validateFormat: pattern(/^GOCSPX-[A-Za-z0-9_-]+$/, "starts with GOCSPX-"),
  },
  {
    id: "hubspot_private_app_token",
    section: "integrations",
    label: "HubSpot Private App Token",
    description: "Platform-level token for the HubSpot connector's default app.",
    placeholder: "pat-...",
    rotationStrategy: "manual",
    testSupport: "format_only",
    validateFormat: pattern(/^pat-[A-Za-z0-9-]+$/, "starts with pat-"),
  },

  // Security
  {
    id: "session_signing_secret",
    section: "security",
    label: "Session Signing Secret",
    description: "Infrastructure-level signing secret. Generated and rotated entirely by Calixo — no vendor issues this value, so rotation is self-service.",
    placeholder: "Auto-generated on Add/Rotate",
    rotationStrategy: "generate",
    testSupport: "format_only",
    validateFormat: minLength(32),
  },
  {
    id: "encryption_master_key",
    section: "security",
    label: "Encryption Master Key",
    description: "Root key reference for field/tenant encryption (see core/platform/data/encryption.ts's architecture-only contracts). Self-service rotation.",
    placeholder: "Auto-generated on Add/Rotate",
    rotationStrategy: "generate",
    testSupport: "format_only",
    validateFormat: minLength(32),
  },
  {
    id: "csrf_secret",
    section: "security",
    label: "CSRF Protection Secret",
    description: "Self-service, Calixo-generated secret used to sign anti-CSRF tokens.",
    placeholder: "Auto-generated on Add/Rotate",
    rotationStrategy: "generate",
    testSupport: "format_only",
    validateFormat: minLength(32),
  },

  // Database
  {
    id: "database_url",
    section: "database",
    label: "Primary Database URL",
    description: "The real DATABASE_URL from .env — presence-checked here (never its contents).",
    placeholder: "postgresql://user:password@host:5432/db",
    rotationStrategy: "manual",
    testSupport: "format_only",
    envVar: "DATABASE_URL",
    validateFormat: pattern(/^postgres(ql)?:\/\/.+/, "starts with postgres:// or postgresql://"),
  },
  {
    id: "database_password",
    section: "database",
    label: "Database Connection Password",
    description: "Standalone credential for connection strings that separate host/user/password.",
    placeholder: "Database password",
    rotationStrategy: "manual",
    testSupport: "format_only",
    validateFormat: minLength(8),
  },
  {
    id: "read_replica_url",
    section: "database",
    label: "Read Replica Database URL",
    description: "Optional read-replica connection string for reporting workloads.",
    placeholder: "postgresql://user:password@replica-host:5432/db",
    rotationStrategy: "manual",
    testSupport: "format_only",
    validateFormat: pattern(/^postgres(ql)?:\/\/.+/, "starts with postgres:// or postgresql://"),
  },

  // Storage
  {
    id: "object_storage_access_key_id",
    section: "storage",
    label: "Object Storage Access Key ID",
    description: "S3-compatible object storage access key ID.",
    placeholder: "Access key ID",
    rotationStrategy: "manual",
    testSupport: "format_only",
    validateFormat: minLength(12),
  },
  {
    id: "object_storage_secret_access_key",
    section: "storage",
    label: "Object Storage Secret Access Key",
    description: "S3-compatible object storage secret access key.",
    placeholder: "Secret access key",
    rotationStrategy: "manual",
    testSupport: "format_only",
    validateFormat: minLength(24),
  },
  {
    id: "cdn_signed_url_key",
    section: "storage",
    label: "CDN Signed URL Key",
    description: "Signs time-limited CDN asset URLs for private media.",
    placeholder: "Signing key",
    rotationStrategy: "generate",
    testSupport: "format_only",
    validateFormat: minLength(16),
  },

  // Monitoring
  {
    id: "sentry_dsn",
    section: "monitoring",
    label: "Sentry DSN",
    description: "Error-tracking ingestion endpoint.",
    placeholder: "https://<key>@<org>.ingest.sentry.io/<project>",
    rotationStrategy: "manual",
    testSupport: "format_only",
    validateFormat: pattern(/^https:\/\/.+@.+\..+\/\d+$/, "a Sentry DSN URL"),
  },
  {
    id: "datadog_api_key",
    section: "monitoring",
    label: "Datadog API Key",
    description: "Metrics/log-shipping credential for Datadog.",
    placeholder: "32-character hex key",
    rotationStrategy: "manual",
    testSupport: "format_only",
    validateFormat: pattern(/^[a-f0-9]{32}$/, "32 lowercase hex characters"),
  },
  {
    id: "log_drain_token",
    section: "monitoring",
    label: "Log Drain Token",
    description: "Authenticates the platform's log-drain destination.",
    placeholder: "Log drain token",
    rotationStrategy: "generate",
    testSupport: "format_only",
    validateFormat: minLength(16),
  },
];

export function getCatalogEntry(id: string): SecretCatalogEntry | undefined {
  return SECRET_CATALOG.find(entry => entry.id === id);
}

export function listCatalog(): SecretCatalogEntry[] {
  return SECRET_CATALOG;
}
