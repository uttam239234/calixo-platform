/**
 * Calixo Platform - Mock Dashboards Generator
 */

import { generateId } from "@/shared/utils/string";
import { REPORT_CATEGORIES, REPORT_CATEGORY_MODULE_MAP } from "../types";
import type { ReportDashboard } from "../types";
import { MOCK_OWNERS, daysAgoISO, pick } from "./data";

const DASHBOARD_NAME_BANK = [
  "Leadership Overview",
  "Growth Command Center",
  "Channel Performance Hub",
  "Content Operations Board",
  "Brand Health Monitor",
  "Compliance Watchtower",
  "Revenue & Spend Tracker",
  "Team Activity Board",
];

export function generateMockDashboards(reportIds: string[], count = 20): ReportDashboard[] {
  if (reportIds.length === 0) return [];
  const dashboards: ReportDashboard[] = [];

  for (let i = 0; i < count; i++) {
    const category = REPORT_CATEGORIES[i % REPORT_CATEGORIES.length].id;
    const name = `${pick(DASHBOARD_NAME_BANK, i)} — ${category}`;
    const attachedReportIds = [pick(reportIds, i), pick(reportIds, i + 5), pick(reportIds, i + 11)].filter((id, idx, arr) => arr.indexOf(id) === idx);

    dashboards.push({
      id: generateId(16),
      name,
      description: `Curated ${category} dashboard combining ${attachedReportIds.length} reports.`,
      module: REPORT_CATEGORY_MODULE_MAP[category],
      category,
      reportIds: attachedReportIds,
      layout: {
        type: "grid",
        widgetPlacements: [],
      },
      owner: pick(MOCK_OWNERS, i),
      favorite: i % 6 === 0,
      createdAt: daysAgoISO(60 - (i % 60)),
      updatedAt: daysAgoISO(i % 20),
    });
  }

  return dashboards;
}
