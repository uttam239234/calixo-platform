/**
 * Calixo Platform - AI Report Assistant Engine
 *
 * A pure, deterministic state machine — mirrors Content Studio's
 * `AssistantConversationEngine`. `detectSource()` is a single injectable
 * keyword-matching seam, documented as "prepared for future LLM
 * execution, not LLM-backed today," matching every other module's
 * AI-stays-deterministic convention this session. Calibrated to this
 * brief's stronger "under 3 minutes, ask only when needed" bar: most
 * messages resolve with zero questions (the brief's own 4 worked examples
 * all fully specify their category), and the only two possible questions
 * — which report, and who receives it — are asked exclusively when
 * genuinely needed, never as a fixed multi-step interrogation.
 */

import { generateId } from "@/shared/utils/string";
import { buildSourceReport, SOURCE_TEMPLATE_LIST } from "../templates/sourceTemplates";
import { reportRegistry } from "../registry/ReportRegistry";
import { reportEngine } from "./ReportEngine";
import type { AssistantAnswers, AssistantQuestion, AssistantQuestionId, AssistantSession, ReportDataset, ReportDefinition, ReportSourceId } from "../types";

const SOURCE_KEYWORDS: Record<ReportSourceId, string[]> = {
  "analytics-executive": ["executive summary", "executive", "board summary", "overview report"],
  "analytics-conversion": ["admission", "admissions", "conversion", "funnel", "by state", "by region", "leads"],
  "ads-performance": ["campaign", "advertising", "ads performance", "marketing performance", "marketing report", "marketing", "roas", "ad spend"],
  "social-overview": ["social media", "social engagement", "social performance", "instagram", "facebook engagement", "followers"],
  "reputation-health": ["brand sentiment", "brand health", "sentiment", "reputation", "mentions", "reviews"],
  "content-history": ["content performance", "content report", "content generation", "creative output"],
};

const RECIPIENT_TRIGGER = /\b(send|email|share|team|recurring|schedule|weekly report|daily report|monthly report)\b/i;

/** Deterministic keyword matching — picks the source with the most keyword hits. */
function detectSource(message: string): ReportSourceId | undefined {
  const lower = message.toLowerCase();
  let best: { sourceId: ReportSourceId; score: number } | undefined;
  for (const [sourceId, keywords] of Object.entries(SOURCE_KEYWORDS) as [ReportSourceId, string[]][]) {
    const score = keywords.filter(k => lower.includes(k)).length;
    if (score > 0 && (!best || score > best.score)) best = { sourceId, score };
  }
  return best?.sourceId;
}

class ReportAssistantEngineImpl {
  createSession(message: string): AssistantSession {
    const sourceId = detectSource(message);
    const session: AssistantSession = {
      id: generateId(12),
      turns: [{ role: "user", content: message }],
      answers: {},
      sourceId,
      resolved: false,
    };
    return { ...session, resolved: !this.nextQuestion(session) };
  }

  nextQuestion(session: AssistantSession): AssistantQuestion | undefined {
    if (!session.sourceId) {
      return {
        id: "category",
        question: "What would you like this report about?",
        options: SOURCE_TEMPLATE_LIST.map(t => ({ id: t.sourceId, label: t.name })),
      };
    }
    const originalMessage = session.turns[0]?.content ?? "";
    if (!session.answers.recipients && RECIPIENT_TRIGGER.test(originalMessage)) {
      return {
        id: "recipients",
        question: "Who will receive this report?",
        options: [
          { id: "me", label: "Just me" },
          { id: "team", label: "My team" },
        ],
      };
    }
    return undefined;
  }

  answer(session: AssistantSession, questionId: AssistantQuestionId, optionId: string, optionLabel: string): AssistantSession {
    const answers: AssistantAnswers = { ...session.answers, [questionId]: optionLabel };
    const turns = [...session.turns, { role: "user" as const, content: optionLabel }];
    const sourceId = questionId === "category" ? (optionId as ReportSourceId) : session.sourceId;
    const next: AssistantSession = { ...session, answers, turns, sourceId, resolved: false };
    return { ...next, resolved: !this.nextQuestion(next) };
  }

  /** Builds, registers, and executes the real report via `ReportBuilder` + `ReportDataSourceRouter` — never a hand-rolled dataset. */
  async resolve(session: AssistantSession, owner: string): Promise<{ report: ReportDefinition; dataset?: ReportDataset; responseText: string } | undefined> {
    if (!session.sourceId) return undefined;
    const report = buildSourceReport(session.sourceId, owner);
    reportRegistry.register(report);
    const { dataset } = await reportEngine.execute(report.id);
    const responseText = dataset?.sourceLabel ? `Here's your "${report.name}" report — live data from ${dataset.sourceLabel}.` : `Created "${report.name}", but I couldn't run it just now.`;
    return { report, dataset, responseText };
  }
}

export const reportAssistantEngine = new ReportAssistantEngineImpl();
export { ReportAssistantEngineImpl };
