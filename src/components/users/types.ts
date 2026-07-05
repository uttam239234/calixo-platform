/**
 * Calixo Users & Teams Center - UI-only view types.
 *
 * These describe presentation state the platform foundation has no
 * opinion on (which right-panel tab is active, which directory view is
 * showing). Nothing here duplicates a platform type.
 */

export type DirectoryViewMode = "table" | "cards";

export type UsersRightPanelTab = "profile" | "presence" | "activity" | "metadata" | "team" | "workspace" | "invitations";
