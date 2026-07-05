/**
 * Calixo Settings Center - UI constants.
 */

import type { ModuleCategory } from "@/core/modules/ModuleTypes";

export const DEMO_OWNER = "Uttam";

export const MODULE_OPTIONS: { id: ModuleCategory; label: string }[] = [
  { id: "core", label: "Core" },
  { id: "marketing", label: "Marketing" },
  { id: "analytics", label: "Analytics" },
  { id: "social", label: "Social" },
  { id: "brand", label: "Brand" },
  { id: "content", label: "Content" },
  { id: "ai", label: "AI" },
  { id: "administration", label: "Administration" },
  { id: "developer", label: "Developer" },
];
