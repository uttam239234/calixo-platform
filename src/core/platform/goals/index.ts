/**
 * Calixo Platform - Shared Goals & Scorecards Engine
 *
 * Cross-cutting on purpose: both Dashboard and Analytics render a "Goals
 * & Scorecard" widget backed by the SAME real engine and the SAME goal
 * definitions, rather than each module maintaining its own goal list.
 */

export { GoalEngine, goalEngine } from "./GoalEngine";
export type { Goal, GoalPeriod, GoalScorecardEntry, GoalStatus } from "./types";
