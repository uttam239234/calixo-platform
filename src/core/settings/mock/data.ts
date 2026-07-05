/**
 * Calixo Platform - Settings Mock Data Banks
 *
 * Shared name pools and deterministic helpers used by the mock
 * generators. Deterministic (seeded) generation keeps the mock data
 * reproducible and testable across runs.
 */

import type { ModuleCategory } from "@/core/modules/ModuleTypes";
import type { SettingsGroupId } from "../types";

export const GROUP_MODULE_MAP: Record<SettingsGroupId, ModuleCategory> = {
  platform: "core",
  workspace: "core",
  user: "administration",
  security: "administration",
  ai: "ai",
  brand: "brand",
  content: "content",
  reports: "analytics",
  workflow: "core",
  media: "content",
  integrations: "core",
  billing: "administration",
  notifications: "core",
  developer: "developer",
  appearance: "core",
  advanced: "core",
};

export const GROUP_CATEGORY_BANK: Record<SettingsGroupId, string[]> = {
  platform: ["Platform General", "Localization", "Platform Limits"],
  workspace: ["Workspace General", "Members", "Workspace Storage"],
  user: ["Profile", "Preferences", "Accessibility"],
  security: ["Authentication", "Sessions", "API Keys", "Audit Log"],
  ai: ["AI Models", "AI Automation", "Guardrails"],
  brand: ["Brand Defaults", "Compliance", "Brand Assets"],
  content: ["Content Generation", "Editor", "Publishing"],
  reports: ["Report Defaults", "Exports", "Scheduling"],
  workflow: ["Approvals", "Reviewers", "Escalation"],
  media: ["Media Generation", "Media Storage", "Providers"],
  integrations: ["Connections", "Integration Webhooks", "Sync", "Marketplace"],
  billing: ["Plan", "Invoicing", "Payment Methods"],
  notifications: ["Delivery", "Channels", "Digest"],
  developer: ["API", "Developer Diagnostics", "Developer Webhooks"],
  appearance: ["Theme", "Layout", "Branding"],
  advanced: ["Experimental", "Performance", "Advanced Diagnostics"],
};

export const MOCK_OWNERS = [
  "Sarah Chen",
  "James Rodriguez",
  "Priya Patel",
  "Michael Okafor",
  "Laura Kim",
  "David Thompson",
  "Aisha Rahman",
  "Carlos Mendoza",
  "Emma Wilson",
  "Yuki Tanaka",
];

export function pick<T>(items: T[], index: number): T {
  return items[((index % items.length) + items.length) % items.length];
}

export function pseudoRandomInt(min: number, max: number, seed: number): number {
  const x = Math.sin(seed * 999.123 + 1) * 10000;
  const frac = x - Math.floor(x);
  return min + Math.floor(frac * (max - min + 1));
}

export function daysAgoISO(days: number): string {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
}
