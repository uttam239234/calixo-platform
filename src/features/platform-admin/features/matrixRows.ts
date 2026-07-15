/**
 * Internal Plan Management Console — Section 3 matrix row definitions.
 *
 * Split out of `useFeatureMatrix.ts` (a `"use client"` React hook file) so
 * that non-component code — the Audit Logs module's `restoreSetters.ts`,
 * which needs the same row/kind knowledge to restore a
 * `subscription-tier-modules` snapshot outside of React, including from a
 * server route handler — can import it without pulling in React or a
 * client-only module boundary.
 */

export type MatrixRowKind = "module" | "featureGate" | "limitProxy";

export interface MatrixRow {
  id: string;
  label: string;
  kind: MatrixRowKind;
}

export const ALL_MODULE_IDS = ["dashboard", "analytics", "ads", "social", "brand", "content", "ai-copilot", "reports"];

export const MATRIX_ROWS: MatrixRow[] = [
  { id: "dashboard", label: "Dashboard", kind: "module" },
  { id: "analytics", label: "Analytics", kind: "module" },
  { id: "ads", label: "Ads Manager", kind: "module" },
  { id: "social", label: "Social Media", kind: "module" },
  { id: "brand", label: "Brand Monitoring", kind: "module" },
  { id: "content", label: "Content Studio", kind: "module" },
  { id: "ai-copilot", label: "AI Copilot", kind: "module" },
  { id: "reports", label: "Reports", kind: "module" },
  { id: "workspaces", label: "Workspaces", kind: "limitProxy" },
  { id: "connectors", label: "Integrations", kind: "limitProxy" },
  { id: "apiRequests", label: "API Access", kind: "limitProxy" },
  { id: "audit-export", label: "Audit Logs", kind: "featureGate" },
];

export const LIMIT_PROXY_DEFAULTS: Record<string, number> = { workspaces: 10, connectors: 5, apiRequests: 10000 };
