/**
 * Calixo Platform - Reports Dashboard Types
 *
 * A dashboard is a named arrangement of existing reports — it holds no
 * data of its own and duplicates nothing from ReportDefinition.
 */

import type { ModuleCategory } from "@/core/modules/ModuleTypes";
import type { ReportCategory, ReportLayout } from "./report";

export interface ReportDashboard {
  id: string;
  name: string;
  description: string;
  module: ModuleCategory;
  category?: ReportCategory;
  reportIds: string[];
  layout: ReportLayout;
  owner: string;
  favorite: boolean;
  createdAt: string;
  updatedAt: string;
}
