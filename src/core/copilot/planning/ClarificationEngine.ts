/**
 * Calixo Platform - Copilot Clarification Engine
 *
 * Per-skill required-slot tracking, capped at 5 questions (the brief's own
 * "admissions leads" example needs exactly program/geography/budget/
 * channels/audience). A module registers its own slot profile alongside
 * its skills/tools (see `core/ads/skills/registerAdsSkills.ts`) — this
 * engine stays fully generic, matching every other Copilot engine's
 * "no module-specific logic" rule.
 *
 * Keyed by the specific matched **skill**, not the owning agent — an agent
 * can own several skills (e.g. Advertising Agent's "plan a campaign" needs
 * 5 questions, but its "pause a campaign" doesn't need any), so scoping by
 * agent alone would force every skill under that agent through the same
 * question set.
 *
 * Slots with an `extract()` function get pre-filled from the user's
 * original free-text request (e.g. a dollar amount answers "budget"
 * without a follow-up question) so already-given context is never
 * re-asked. Skills with no registered profile ask nothing — reserved for
 * read-only explain/analyze requests, or writes with no ambiguity, where
 * extra questions would violate "never ask unnecessary questions."
 */

import type { ClarificationOption, ClarificationRequest } from "../types/index";

export interface SlotDefinition {
  slot: string;
  question: string;
  options?: ClarificationOption[];
  /** Best-effort keyword extraction from free text. Returning undefined leaves the slot to be asked. */
  extract?: (text: string) => string | undefined;
}

interface ClarificationSessionState {
  agentId: string;
  skillId: string;
  matchedSkillIds: string[];
  initialRequest: string;
  answers: Record<string, string>;
  askedSlot?: string;
}

const MAX_QUESTIONS = 5;

export class ClarificationEngine {
  private profiles: Map<string, SlotDefinition[]> = new Map();
  private sessions: Map<string, ClarificationSessionState> = new Map();

  registerSlotProfile(skillId: string, slots: SlotDefinition[]): void {
    this.profiles.set(skillId, slots.slice(0, MAX_QUESTIONS));
  }

  /** Seeds a fresh clarification loop for the primary matched skill, pre-filling slots the original request already answers. */
  start(sessionId: string, agentId: string, skillId: string, matchedSkillIds: string[], request: string): void {
    const slots = this.profiles.get(skillId) ?? [];
    const answers: Record<string, string> = {};
    for (const slot of slots) {
      const extracted = slot.extract?.(request);
      if (extracted) answers[slot.slot] = extracted;
    }
    this.sessions.set(sessionId, { agentId, skillId, matchedSkillIds, initialRequest: request, answers });
  }

  isAwaitingAnswer(sessionId: string): boolean {
    return this.sessions.get(sessionId)?.askedSlot !== undefined;
  }

  /** Records the user's freeform reply as the answer to whichever slot was last asked. */
  recordAnswer(sessionId: string, answerText: string): void {
    const state = this.sessions.get(sessionId);
    if (!state?.askedSlot) return;
    state.answers[state.askedSlot] = answerText;
    state.askedSlot = undefined;
  }

  /** Next unanswered slot's question, or undefined once every registered slot is filled (or the skill has no profile). */
  nextQuestion(sessionId: string): ClarificationRequest | undefined {
    const state = this.sessions.get(sessionId);
    if (!state) return undefined;
    const slots = this.profiles.get(state.skillId) ?? [];
    const next = slots.find(s => !state.answers[s.slot]);
    if (!next) return undefined;
    state.askedSlot = next.slot;
    return { field: next.slot, question: next.question, options: next.options };
  }

  getState(sessionId: string): { agentId: string; skillId: string; matchedSkillIds: string[]; initialRequest: string } | undefined {
    const state = this.sessions.get(sessionId);
    return state ? { agentId: state.agentId, skillId: state.skillId, matchedSkillIds: state.matchedSkillIds, initialRequest: state.initialRequest } : undefined;
  }

  getAnswers(sessionId: string): Record<string, string> {
    return { ...(this.sessions.get(sessionId)?.answers ?? {}) };
  }

  clear(sessionId: string): void {
    this.sessions.delete(sessionId);
  }
}

export const clarificationEngine = new ClarificationEngine();
