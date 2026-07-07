/**
 * Calixo Platform - The ONE Shared Contracts Barrel
 *
 * Every module should import summary contracts from here instead of
 * reaching into another module's own `platform/contracts.ts` (or, worse,
 * its engine). Re-exports Analytics' and Brand's existing contracts
 * rather than redefining them.
 */
export * from "./types";

export type {
  AnalyticsSummary,
  AudienceSummary,
  CampaignSummary,
  ConversionSummary,
  DashboardAnalyticsSummary,
  ExecutiveAnalyticsSummary,
  RevenueSummary,
  TrafficSummary,
  SEOAnalyticsSummary,
  AdsAnalyticsSummary,
  SocialAnalyticsSummary,
  BrandAnalyticsSummary,
  ContentSummary,
  WorkflowAnalyticsSummary,
  NotificationAnalyticsSummary,
} from "@/core/analytics/platform/contracts";

export type { BrandSummary } from "@/core/brand/platform/contracts";
