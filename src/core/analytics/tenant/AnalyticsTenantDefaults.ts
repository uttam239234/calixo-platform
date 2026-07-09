/**
 * Calixo Platform - Analytics Tenant Defaults
 *
 * The same single demo organization/user every other module's mock data
 * is seeded against (see `DASHBOARD_ORGANIZATION_ID`/`DASHBOARD_CURRENT_USER_ID`
 * in `core/dashboard`) — defined independently here rather than imported
 * cross-module, since peer platform modules don't reach into each
 * other's internals.
 */
export const ANALYTICS_ORGANIZATION_ID = "org-current";
export const ANALYTICS_CURRENT_USER_ID = "user-current";
