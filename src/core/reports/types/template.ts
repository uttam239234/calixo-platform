/**
 * Calixo Platform - Reports Template Types
 */

import type { ModuleCategory } from "@/core/modules/ModuleTypes";
import type { ReportCategory, ReportDimension, ReportLayout, ReportMetric } from "./report";
import type { ReportWidget } from "./widget";

export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  module: ModuleCategory;
  category: ReportCategory;
  tags: string[];
  isDefault: boolean;
  isFavorite: boolean;
  widgets: ReportWidget[];
  metrics: ReportMetric[];
  dimensions: ReportDimension[];
  defaultLayout: ReportLayout;
  createdAt: string;
  updatedAt: string;
}
