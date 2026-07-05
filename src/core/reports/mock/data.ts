/**
 * Calixo Platform - Reports Mock Data Banks
 *
 * Shared name pools and deterministic helpers used by the mock
 * generators. Deterministic (seeded) generation keeps the mock data
 * reproducible and testable across runs.
 */

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
  "Sofia Rossi",
  "Daniel Kim",
  "Fatima Al-Sayed",
  "Robert Nguyen",
  "Grace Adeyemi",
];

export const MOCK_REGIONS = ["Global", "North America", "EMEA", "APAC", "LATAM"];

export const MOCK_PERIOD_LABELS = ["Q1", "Q2", "Q3", "Q4", "YTD", "Monthly", "Weekly", "Annual"];

export function pick<T>(items: T[], index: number): T {
  return items[((index % items.length) + items.length) % items.length];
}

/** Deterministic pseudo-random integer in [min, max] — same seed always yields the same value. */
export function pseudoRandomInt(min: number, max: number, seed: number): number {
  const x = Math.sin(seed * 999.123 + 1) * 10000;
  const frac = x - Math.floor(x);
  return min + Math.floor(frac * (max - min + 1));
}

export function daysAgoISO(days: number): string {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
}
