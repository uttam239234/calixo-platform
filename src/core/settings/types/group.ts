/**
 * Calixo Platform - Settings Group Types
 */

export type SettingsGroupId =
  | "platform"
  | "workspace"
  | "user"
  | "security"
  | "ai"
  | "brand"
  | "content"
  | "reports"
  | "workflow"
  | "media"
  | "integrations"
  | "billing"
  | "notifications"
  | "developer"
  | "appearance"
  | "advanced";

export interface SettingsGroupDefinition {
  id: SettingsGroupId;
  label: string;
  description: string;
  order: number;
}
