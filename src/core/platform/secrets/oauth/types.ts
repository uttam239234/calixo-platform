/**
 * Calixo Platform - OAuth Applications: Types
 *
 * `PlatformOAuthApplication` — platform-owned OAuth app credentials that
 * will power every Connector (Google Ads, Meta Ads, LinkedIn, Slack, etc.).
 * Deliberately a SEPARATE model from `PlatformSecretRecord` (the existing
 * single-opaque-secret-per-catalog-entry shape one section over): an OAuth
 * application is a small STRUCT of related fields (client id, client
 * secret, project/tenant id, redirect URI, scopes) with its own lifecycle,
 * not one bare secret value. Reusing the single-field shape would have
 * meant either losing fields or faking a one-field-per-provider catalog
 * that doesn't match how OAuth apps actually work.
 *
 * This is Calixo's OWN application registered with each vendor — NEVER a
 * customer's connected account, access token, or refresh token. No OAuth
 * login flow, token exchange, or customer credential is implemented here;
 * this phase only configures the app-level credentials a future Connector
 * phase will use to START a real OAuth flow for a customer.
 */

export type OAuthProviderId = "google" | "meta" | "linkedin" | "microsoft" | "slack" | "hubspot" | "salesforce" | "shopify" | "wordpress";

export const OAUTH_PROVIDER_IDS: OAuthProviderId[] = ["google", "meta", "linkedin", "microsoft", "slack", "hubspot", "salesforce", "shopify", "wordpress"];

export type OAuthApplicationStatus = "configured" | "missing" | "validation_failed" | "disabled";

export type OAuthValidationOutcome = "valid" | "invalid";
export type OAuthTestOutcome = "success" | "failed" | "format_only" | "unreachable";

/** Describes one extra field a specific provider needs beyond the common shape (Slack's Signing Secret/Bot Token, HubSpot's Developer Account, Salesforce's Login URL) — additive, not a replacement for the named `PlatformOAuthApplication` fields the brief specifies. */
export interface OAuthExtraFieldSpec {
  key: string;
  label: string;
  kind: "plain" | "secret";
  placeholder: string;
  required: boolean;
  validate?: (value: string) => { valid: boolean; message: string };
}

export interface OAuthScopeOption {
  scope: string;
  label: string;
}

/** The static, code-defined shape of one provider's card — labels, which fields it has, default scopes, and format validators. Never carries any secret material. */
export interface OAuthProviderDefinition {
  id: OAuthProviderId;
  cardTitle: string;
  shortLabel: string;
  description: string;
  connectors: string[];
  clientIdLabel: string;
  clientSecretLabel: string;
  hasProjectId: boolean;
  hasTenantId: boolean;
  hasScopes: boolean;
  scopeOptions: OAuthScopeOption[];
  defaultScopes: string[];
  extraFields: OAuthExtraFieldSpec[];
  redirectPathHint: string;
  validateClientId: (value: string) => { valid: boolean; message: string };
  validateClientSecret: (value: string) => { valid: boolean; message: string };
}

/**
 * The persisted record — matches the brief's own named `PlatformOAuthApplication`
 * fields exactly, plus `extraSecretRefs`/`extraFieldValues` (additive) for the
 * handful of providers that need more than the common shape. `clientId` is
 * stored in plaintext metadata deliberately — an OAuth client id is not
 * confidential (it appears in browser redirect URLs by design); every other
 * credential field is sealed.
 *
 * Deliberately has NO `redirectUri` field. A redirect URI is environment-derived
 * infrastructure (the request's own origin + the provider's fixed
 * `redirectPathHint`), never business configuration — persisting it let a
 * value saved against one origin (e.g. a dev URL) go stale and silently
 * diverge from whatever origin is actually live. `OAuthApplicationService.getProvider()`
 * computes it fresh on every call instead. See `OAuthApplicationRegistry.ts`'s
 * `ensureReady()` for the one-time migration that strips any legacy persisted value.
 */
export interface PlatformOAuthApplication {
  id: string;
  provider: OAuthProviderId;
  clientId?: string;
  sealedClientSecretRef?: string;
  projectId?: string;
  tenantId?: string;
  defaultScopes: string[];
  /** Google-only: the plain-language services (Google Ads, Gmail, ...) the Platform Owner selected. `undefined` means never explicitly saved — the UI should show the default recommended selection. Every other provider leaves this unset. */
  googleSelectedServices?: string[];
  extraFieldValues: Record<string, string>;
  extraSecretRefs: Record<string, string>;
  status: OAuthApplicationStatus;
  validatedAt?: string;
  validationResult?: OAuthValidationOutcome;
  validationMessage?: string;
  testedAt?: string;
  testResult?: OAuthTestOutcome;
  testMessage?: string;
  createdBy?: string;
  updatedBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

/** The one shape ever sent to the client — never a plaintext secret, never a sealed reference, only presence booleans for secret fields. */
export interface OAuthApplicationSummary {
  provider: OAuthProviderId;
  cardTitle: string;
  shortLabel: string;
  description: string;
  connectors: string[];
  clientIdLabel: string;
  clientSecretLabel: string;
  clientId?: string;
  hasClientSecret: boolean;
  hasProjectId: boolean;
  projectId?: string;
  hasTenantId: boolean;
  tenantId?: string;
  /** No `redirectUri` here — the client computes and displays it itself from `redirectPathHint` + its own `window.location.origin` (see `OAuthApplicationsPanel.tsx`'s `callbackRedirectUri()`); the server never sends a persisted or precomputed value. */
  redirectPathHint: string;
  hasScopes: boolean;
  scopeOptions: OAuthScopeOption[];
  scopes: string[];
  /** Google-only: powers the Scope Manager — a service picker whose real OAuth scopes are generated automatically. `undefined` for every other provider. */
  googleServices?: {
    catalog: { id: string; label: string; description: string; scopes: string[]; defaultSelected: boolean }[];
    selected: string[];
    generatedScopes: string[];
  };
  extraFields: { key: string; label: string; kind: "plain" | "secret"; placeholder: string; required: boolean; value?: string; configured: boolean }[];
  status: OAuthApplicationStatus;
  completionPercent: number;
  validatedAt?: string;
  validationResult?: OAuthValidationOutcome;
  validationMessage?: string;
  testedAt?: string;
  testResult?: OAuthTestOutcome;
  testMessage?: string;
  createdAt?: string;
  createdByName?: string;
  updatedAt?: string;
  updatedByName?: string;
}

export interface OAuthApplicationInput {
  clientId: string;
  clientSecret?: string;
  projectId?: string;
  tenantId?: string;
  scopes: string[];
  /** Google-only: the service ids the Platform Owner selected. The server derives the real OAuth scopes from this — `scopes` above is ignored for the Google provider. */
  googleSelectedServices?: string[];
  extraFieldValues: Record<string, string>;
  extraSecretValues: Record<string, string>;
}

export interface OAuthActionResult {
  ok: boolean;
  error?: string;
  summary?: OAuthApplicationSummary;
}

/**
 * The real, server-only shape `OAuthApplicationService.getProvider()` returns
 * for the next phase (the Universal Connector Framework) — everything a
 * connector needs to actually start a real OAuth flow for a customer,
 * resolved and decrypted in one call. Never sent to a client bundle.
 */
export interface ResolvedOAuthProvider {
  provider: OAuthProviderId;
  clientId: string;
  clientSecret: string;
  /** Computed fresh from the caller-supplied request origin + the provider's `redirectPathHint` — never read from storage. `""` when `getProvider()` was called without an origin (background/refresh paths that never need it). */
  redirectUri: string;
  scopes: string[];
  status: OAuthApplicationStatus;
  extraFieldValues: Record<string, string>;
  extraSecretValues: Record<string, string>;
}

export interface OAuthAuditEntry {
  id: string;
  eventType: string;
  description: string;
  userId: string;
  userName?: string;
  timestamp: string;
  changes?: Record<string, unknown>;
}
