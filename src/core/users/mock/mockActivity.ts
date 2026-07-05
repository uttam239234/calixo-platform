/**
 * Calixo Platform - Mock Activity Generator
 *
 * Genuinely drives ActivityEngine.record() rather than constructing
 * ActivityEvent objects by hand — doubles as a live demonstration that the
 * engine works.
 */

import { ACTIVITY_TYPES } from "../types/index";
import { ActivityEngine, activityEngine } from "../activity/ActivityEngine";
import type { ActivityEvent, ActivityType, User } from "../types/index";
import { daysAgoISO, pick, pseudoRandomInt } from "./data";

const DESCRIPTIONS: Record<ActivityType, string> = {
  login: "Signed in",
  logout: "Signed out",
  "profile-update": "Updated profile details",
  "team-join": "Joined a team",
  "team-leave": "Left a team",
  "password-change": "Changed password",
  "workspace-switch": "Switched active workspace",
};

export function generateMockActivity(count = 1000, users: User[], engine: ActivityEngine = activityEngine): ActivityEvent[] {
  const events: ActivityEvent[] = [];

  for (let i = 0; i < count; i++) {
    const user = pick(users, i);
    const type = pick(ACTIVITY_TYPES, i + 1);
    const createdAt = daysAgoISO(pseudoRandomInt(0, 180, i));
    const event = engine.record(user.id, type, DESCRIPTIONS[type], { source: "mock" }, createdAt);
    events.push(event);
  }

  return events;
}
