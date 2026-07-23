/**
 * Calixo Platform - OAuth Applications: Google Scope Service
 *
 * Turns a Platform Owner's plain-language service selection (Google Ads,
 * Gmail, YouTube, ...) into the real OAuth scopes Google requires — the
 * only place scope URLs are ever computed for the Google Cloud OAuth
 * application. Pure and stateless: no vault, no persistence, so it's safe
 * to call from the server-only OAuth Application service layer, a debug
 * harness, or a future test without pulling in encryption/storage.
 */
import { GOOGLE_SERVICE_CATALOG, isGoogleServiceId, type GoogleServiceId } from "./GoogleScopeRegistry";

export const GoogleScopeService = {
  /** The real scope(s) one specific Google service requires. */
  getScopes(serviceId: GoogleServiceId): string[] {
    return GOOGLE_SERVICE_CATALOG.find(s => s.id === serviceId)?.scopes ?? [];
  },

  /**
   * Narrows an untrusted candidate id list — client input, or a persisted
   * record from before the catalog changed — down to real, currently-known
   * Google service ids. Never trusts a raw id blindly; drops duplicates
   * and anything unrecognized.
   */
  getSelectedServices(candidateIds: string[]): GoogleServiceId[] {
    const seen = new Set<string>();
    const result: GoogleServiceId[] = [];
    for (const id of candidateIds) {
      if (isGoogleServiceId(id) && !seen.has(id)) {
        seen.add(id);
        result.push(id);
      }
    }
    return result;
  },

  /**
   * The real, deduplicated, catalog-ordered OAuth scopes for a selection of
   * Google services — the only place scope URLs are generated. A Platform
   * Owner never types one of these.
   */
  generateScopes(selectedServiceIds: string[]): string[] {
    const selected = new Set(selectedServiceIds);
    const scopes = new Set<string>();
    for (const service of GOOGLE_SERVICE_CATALOG) {
      if (!selected.has(service.id)) continue;
      for (const scope of service.scopes) scopes.add(scope);
    }
    return Array.from(scopes);
  },

  /** At least one Google service must be selected before scopes can be generated at all. */
  validate(selectedServiceIds: string[]): { valid: boolean; message: string } {
    if (selectedServiceIds.length === 0) {
      return {
        valid: false,
        message: "Configuration Incomplete: No Google services have been selected. Select one or more Google services to automatically generate the required OAuth scopes.",
      };
    }
    const scopeCount = GoogleScopeService.generateScopes(selectedServiceIds).length;
    return { valid: true, message: `${selectedServiceIds.length} Google service${selectedServiceIds.length === 1 ? "" : "s"} selected — ${scopeCount} OAuth scope${scopeCount === 1 ? "" : "s"} generated.` };
  },
};

export type { GoogleServiceId };
