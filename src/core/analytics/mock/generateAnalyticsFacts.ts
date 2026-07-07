/**
 * Calixo Platform - Analytics Fact Generator
 *
 * Generates a realistic daily fact table (90 days x 3 campaigns = 270
 * rows) with deterministic pseudo-randomness, growth trend, and
 * day-of-week seasonality. This is the ONLY place synthetic numbers are
 * authored — every KPI/chart/table the UI renders is computed FROM these
 * rows by AnalyticsEngine, never hand-written per-view.
 */

import type { AnalyticsAudience, AnalyticsChannel, AnalyticsDevice, AnalyticsFact, AnalyticsRegion } from "../types";

const CHANNELS: AnalyticsChannel[] = ["Google Ads", "Meta", "LinkedIn", "Organic", "Referral", "Email", "Display"];
const DEVICES: AnalyticsDevice[] = ["Desktop", "Mobile", "Tablet"];
const AUDIENCES: AnalyticsAudience[] = ["New Visitors", "Returning Visitors", "High Intent", "Enterprise"];
const REGIONS: { region: AnalyticsRegion; city: string }[] = [
  { region: "United States", city: "San Francisco" },
  { region: "United Kingdom", city: "London" },
  { region: "Canada", city: "Toronto" },
  { region: "Germany", city: "Berlin" },
];

const CAMPAIGNS: { name: string; channel: AnalyticsChannel; magnitude: number }[] = [
  { name: "Enterprise Expansion", channel: "Google Ads", magnitude: 1.3 },
  { name: "ABM Lift", channel: "Meta", magnitude: 1.0 },
  { name: "Lifecycle Boost", channel: "LinkedIn", magnitude: 0.75 },
];

function pick<T>(items: T[], index: number): T {
  return items[((index % items.length) + items.length) % items.length];
}

function pseudoRandom(seed: number): number {
  const x = Math.sin(seed * 999.123 + 1) * 10000;
  return x - Math.floor(x);
}

function daysAgoISO(daysAgo: number): string {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() - daysAgo);
  return d.toISOString();
}

export function generateAnalyticsFacts(days = 90): AnalyticsFact[] {
  const facts: AnalyticsFact[] = [];

  for (let dayIndex = days - 1; dayIndex >= 0; dayIndex--) {
    const date = daysAgoISO(dayIndex);
    const dayOfWeek = new Date(date).getUTCDay();
    const weekendDamp = dayOfWeek === 0 || dayOfWeek === 6 ? 0.72 : 1;
    // Gentle upward growth trend as we approach "today" (dayIndex -> 0).
    const growth = 1 + ((days - dayIndex) / days) * 0.45;

    CAMPAIGNS.forEach((campaign, campaignIndex) => {
      const seed = dayIndex * 31 + campaignIndex * 7;
      const noise = 0.85 + pseudoRandom(seed) * 0.3;
      const scale = campaign.magnitude * growth * weekendDamp * noise;

      const sessions = Math.round(1400 * scale);
      const users = Math.round(sessions * (0.52 + pseudoRandom(seed + 1) * 0.08));
      const returningUsers = Math.round(users * (0.36 + pseudoRandom(seed + 2) * 0.1));
      const bounces = Math.round(sessions * (0.28 + pseudoRandom(seed + 3) * 0.08));
      const sessionSeconds = Math.round(220 + pseudoRandom(seed + 4) * 110);
      const clicks = Math.round(sessions * (0.22 + pseudoRandom(seed + 5) * 0.05));
      const landingPageViews = Math.round(sessions * (0.74 + pseudoRandom(seed + 6) * 0.08));
      const leads = Math.round(clicks * (0.11 + pseudoRandom(seed + 7) * 0.04));
      const qualifiedLeads = Math.round(leads * (0.38 + pseudoRandom(seed + 8) * 0.1));
      const conversions = Math.round(qualifiedLeads * (0.24 + pseudoRandom(seed + 9) * 0.08));
      const spend = Math.round(clicks * (1.05 + pseudoRandom(seed + 10) * 0.6));
      const revenue = Math.round(conversions * (450 + pseudoRandom(seed + 11) * 280));

      const geo = pick(REGIONS, seed);
      facts.push({
        date,
        channel: campaign.channel,
        campaign: campaign.name,
        region: geo.region,
        city: geo.city,
        device: pick(DEVICES, seed + 2),
        audience: pick(AUDIENCES, seed + 3),
        sessions,
        users,
        returningUsers,
        bounces,
        sessionSeconds,
        revenue,
        spend,
        leads,
        qualifiedLeads,
        conversions,
        clicks,
        landingPageViews,
      });
    });
  }

  return facts;
}

export { CHANNELS, DEVICES, AUDIENCES, REGIONS, CAMPAIGNS };
