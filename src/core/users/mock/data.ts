/**
 * Calixo Platform - Users & Teams Mock Data Banks
 *
 * Shared name pools and deterministic helpers used by the mock
 * generators. Deterministic (seeded) generation keeps the mock data
 * reproducible and testable across runs.
 */

export interface MockWorkspace {
  id: string;
  name: string;
}

export const WORKSPACES: MockWorkspace[] = [
  { id: "workspace-growth-engine", name: "Growth Engine" },
  { id: "workspace-brand-studio", name: "Brand Studio" },
  { id: "workspace-acme-marketing", name: "Acme Marketing" },
  { id: "workspace-nova-ventures", name: "Nova Ventures" },
  { id: "workspace-skyline-media", name: "Skyline Media" },
  { id: "workspace-bright-path", name: "Bright Path" },
  { id: "workspace-vertex-labs", name: "Vertex Labs" },
  { id: "workspace-northwind-digital", name: "Northwind Digital" },
];

export const DEPARTMENTS: string[] = [
  "Engineering",
  "Marketing",
  "Sales",
  "Product",
  "Design",
  "Customer Success",
  "Finance",
  "Human Resources",
  "Legal",
  "Operations",
  "IT",
  "Data & Analytics",
  "Content",
  "Growth",
  "Executive",
];

export const JOB_TITLES: string[] = [
  "Software Engineer",
  "Senior Engineer",
  "Engineering Manager",
  "Product Manager",
  "Marketing Manager",
  "Sales Representative",
  "Account Executive",
  "Designer",
  "Data Analyst",
  "Customer Success Manager",
  "HR Business Partner",
  "Director",
];

export const TEAM_FUNCTIONS: string[] = [
  "Platform",
  "Growth",
  "Brand",
  "Content",
  "Paid Media",
  "Product",
  "Design",
  "Customer Success",
  "Data",
  "Revenue",
];

export const FIRST_NAMES: string[] = [
  "Sarah", "James", "Priya", "Michael", "Laura", "David", "Aisha", "Carlos", "Emma", "Yuki",
  "Noah", "Olivia", "Liam", "Sophia", "Mateo", "Ava", "Ethan", "Mia", "Lucas", "Zoe",
  "Daniel", "Grace", "Ryan", "Nina", "Adam", "Chloe", "Omar", "Ivy", "Felix", "Hana",
];

export const LAST_NAMES: string[] = [
  "Chen", "Rodriguez", "Patel", "Okafor", "Kim", "Thompson", "Rahman", "Mendoza", "Wilson", "Tanaka",
  "Garcia", "Muller", "Nguyen", "Silva", "Andersson", "Kowalski", "Haddad", "Osei", "Ivanova", "Park",
];

export const TIMEZONES: string[] = [
  "America/New_York",
  "America/Los_Angeles",
  "America/Chicago",
  "Europe/London",
  "Europe/Berlin",
  "Asia/Kolkata",
  "Asia/Singapore",
  "Asia/Tokyo",
  "Australia/Sydney",
  "UTC",
];

export const USER_STATUS_WEIGHTED: string[] = [
  "active", "active", "active", "active", "active", "active", "active",
  "invited", "invited", "suspended", "disabled", "archived", "pending",
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
