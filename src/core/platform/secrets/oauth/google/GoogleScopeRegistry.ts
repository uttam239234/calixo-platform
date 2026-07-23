/**
 * Calixo Platform - OAuth Applications: Google Scope Registry
 *
 * The single source of truth mapping a Google "service" — a product a
 * Platform Owner actually recognizes, like Google Ads or Gmail — to the
 * real OAuth scope URL(s) that service requires. This is what lets the
 * Google Cloud OAuth card work as a service picker instead of a scope
 * editor: a Platform Owner selects products, never types or sees a raw
 * scope URL to configure anything.
 *
 * Pure static data — no `server-only` tag, matching `OAuthProviderCatalog.ts`,
 * since scope URLs are public Google API identifiers, not secrets.
 */

export type GoogleServiceId =
  | "google-ads"
  | "google-analytics"
  | "search-console"
  | "business-profile"
  | "gmail"
  | "drive"
  | "youtube"
  | "calendar"
  | "sheets"
  | "docs"
  | "tag-manager";

export interface GoogleServiceDefinition {
  id: GoogleServiceId;
  label: string;
  description: string;
  scopes: string[];
  defaultSelected: boolean;
}

export const GOOGLE_SERVICE_CATALOG: GoogleServiceDefinition[] = [
  { id: "google-ads", label: "Google Ads", description: "Manage and report on Google Ads campaigns.", scopes: ["https://www.googleapis.com/auth/adwords"], defaultSelected: true },
  { id: "google-analytics", label: "Google Analytics 4", description: "Read GA4 property analytics data.", scopes: ["https://www.googleapis.com/auth/analytics.readonly"], defaultSelected: true },
  { id: "search-console", label: "Google Search Console", description: "Read search performance and indexing data.", scopes: ["https://www.googleapis.com/auth/webmasters.readonly"], defaultSelected: true },
  { id: "business-profile", label: "Google Business Profile", description: "Manage business listings, hours, and reviews.", scopes: ["https://www.googleapis.com/auth/business.manage"], defaultSelected: true },
  { id: "gmail", label: "Gmail", description: "Read email for reporting and outreach workflows.", scopes: ["https://www.googleapis.com/auth/gmail.readonly"], defaultSelected: true },
  { id: "drive", label: "Google Drive", description: "Read files and folders for asset workflows.", scopes: ["https://www.googleapis.com/auth/drive.readonly"], defaultSelected: true },
  { id: "youtube", label: "YouTube", description: "Read channel and video analytics.", scopes: ["https://www.googleapis.com/auth/youtube.readonly"], defaultSelected: true },
  { id: "calendar", label: "Google Calendar", description: "Read calendar events for scheduling workflows.", scopes: ["https://www.googleapis.com/auth/calendar.readonly"], defaultSelected: false },
  { id: "sheets", label: "Google Sheets", description: "Read spreadsheet data for reporting workflows.", scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"], defaultSelected: false },
  { id: "docs", label: "Google Docs", description: "Read documents for content workflows.", scopes: ["https://www.googleapis.com/auth/documents.readonly"], defaultSelected: false },
  { id: "tag-manager", label: "Google Tag Manager", description: "Read tag and trigger configuration.", scopes: ["https://www.googleapis.com/auth/tagmanager.readonly"], defaultSelected: false },
];

export const GOOGLE_SERVICE_IDS: GoogleServiceId[] = GOOGLE_SERVICE_CATALOG.map(s => s.id);

/** The 7 services preselected for a never-configured Google application, per the platform's default rollout scope. */
export const GOOGLE_DEFAULT_SERVICE_IDS: GoogleServiceId[] = GOOGLE_SERVICE_CATALOG.filter(s => s.defaultSelected).map(s => s.id);

export function isGoogleServiceId(id: string): id is GoogleServiceId {
  return (GOOGLE_SERVICE_IDS as string[]).includes(id);
}

export function getGoogleServiceDefinition(id: string): GoogleServiceDefinition | undefined {
  return GOOGLE_SERVICE_CATALOG.find(s => s.id === id);
}

export function listGoogleServices(): GoogleServiceDefinition[] {
  return GOOGLE_SERVICE_CATALOG;
}
