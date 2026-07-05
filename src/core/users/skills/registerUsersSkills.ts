/**
 * Calixo Platform - Users & Teams Module AI Skills
 *
 * Registers the Users & Teams module's capabilities into the existing
 * Copilot Skill/Tool registries — no Copilot code is modified. This is
 * metadata only: no handler is wired and no LLM execution happens here,
 * exactly like the Settings module's registration.
 *
 * SkillCategory has no dedicated "users"/"identity" value, so these use
 * the existing "platform" category rather than expanding Copilot's enum.
 */

import { skillRegistry, copilotToolRegistry } from "@/core/copilot";
import type { Skill, PlatformTool } from "@/core/copilot";

const USERS_SKILLS: Skill[] = [
  {
    id: "find-user",
    name: "Find User",
    description: "Find a person in the directory by name, email, department, title, team, or tag",
    category: "platform",
    engineRef: "DirectorySearchEngine",
    toolIds: ["find-user"],
    triggers: ["find user", "who is", "look up user", "search directory"],
    enabled: true,
  },
  {
    id: "show-team",
    name: "Show Team",
    description: "Show a team's hierarchy, manager, and members",
    category: "platform",
    engineRef: "TeamRegistry",
    toolIds: ["show-team"],
    triggers: ["show team", "who is on the team", "team hierarchy", "team members"],
    enabled: true,
  },
  {
    id: "invite-user",
    name: "Invite User",
    description: "Create an invitation for a new person to join a workspace or team",
    category: "platform",
    engineRef: "InvitationEngine",
    toolIds: ["invite-user"],
    triggers: ["invite user", "invite someone", "send an invitation", "add a new member"],
    enabled: true,
  },
  {
    id: "user-activity",
    name: "User Activity",
    description: "Summarize a person's recent activity: logins, profile changes, team moves",
    category: "platform",
    engineRef: "ActivityEngine",
    toolIds: ["user-activity"],
    triggers: ["user activity", "what has this user been doing", "recent activity for"],
    enabled: true,
  },
];

const USERS_TOOLS: PlatformTool[] = [
  {
    id: "find-user",
    name: "Find User",
    description: "Find a person in the directory by name, email, department, title, team, or tag",
    category: "platform",
    provider: "engine",
    providerRef: "DirectorySearchEngine",
    capabilities: [{ name: "directory-search" }],
    isActive: true,
  },
  {
    id: "show-team",
    name: "Show Team",
    description: "Show a team's hierarchy, manager, and members",
    category: "platform",
    provider: "engine",
    providerRef: "TeamRegistry",
    capabilities: [{ name: "team-lookup" }],
    isActive: true,
  },
  {
    id: "invite-user",
    name: "Invite User",
    description: "Create an invitation for a new person to join a workspace or team",
    category: "platform",
    provider: "engine",
    providerRef: "InvitationEngine",
    capabilities: [{ name: "invitation-create" }],
    isActive: true,
  },
  {
    id: "user-activity",
    name: "User Activity",
    description: "Summarize a person's recent activity: logins, profile changes, team moves",
    category: "platform",
    provider: "engine",
    providerRef: "ActivityEngine",
    capabilities: [{ name: "activity-history" }],
    isActive: true,
  },
];

let registered = false;

/** Safe to call more than once. Registers metadata only — no handlers, no LLM execution. */
export function registerUsersSkills(): void {
  if (registered) return;
  for (const tool of USERS_TOOLS) copilotToolRegistry.register(tool);
  for (const skill of USERS_SKILLS) skillRegistry.register(skill);
  registered = true;
}
