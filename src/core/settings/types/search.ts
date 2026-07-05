/**
 * Calixo Platform - Settings Search Types
 */

import type { ModuleCategory } from "@/core/modules/ModuleTypes";
import type { SettingDefinition } from "./setting";

export interface SettingsSearchParams {
  query?: string;
  category?: string;
  module?: ModuleCategory;
  tag?: string;
}

export interface SettingsSearchResult {
  setting: SettingDefinition;
  score: number;
  matchedOn: string[];
}
