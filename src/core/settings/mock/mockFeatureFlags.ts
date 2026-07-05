/**
 * Calixo Platform - Mock Feature Flags Generator
 *
 * Feature flag identifiers assigned to a subset of mock settings via
 * their `featureFlag` field — plain string ids, no flag evaluation logic.
 */

const FLAG_THEMES = [
  "ai-copilot",
  "reports-v2",
  "brand-guard",
  "content-velocity",
  "workflow-automation",
  "media-batch-gen",
  "asset-reuse",
  "smart-search",
  "dark-mode-v2",
  "bulk-export",
];

export function generateMockFeatureFlags(count = 30): string[] {
  const flags: string[] = [];
  for (let i = 0; i < count; i++) {
    const theme = FLAG_THEMES[i % FLAG_THEMES.length];
    flags.push(`ff-${theme}-${Math.floor(i / FLAG_THEMES.length) + 1}`);
  }
  return flags;
}
