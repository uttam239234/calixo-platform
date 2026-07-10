/**
 * Calixo Platform — AI Assistant Conversation Engine
 *
 * A pure, deterministic state machine — not a chat SDK, and deliberately does not route through
 * `core/copilot` (confirmed to have zero wired LLM/tool-execution logic; it's a separate module's
 * unfinished foundation). `interpret()` is a single injectable seam for free-text understanding;
 * the default implementation is keyword matching, documented as "prepared for future LLM
 * execution, not LLM-backed today" — matching every other module's AI-stays-deterministic rule
 * this session. Once a session is `done`, callers hand its `ContentBrief` to the exact same
 * `ContentOrchestrationEngine` methods Simple Mode calls directly.
 */
import type { ToneOption } from "@/core/ai/types";
import { ASSISTANT_QUESTION_BANK } from "../mock/generateContentMockData";
import type { AssistantAnswers, AssistantNeedType, AssistantQuestion, AssistantQuestionId, AssistantSession, ContentBrief } from "../types";

const CHANNEL_KEYWORDS: Record<string, string> = {
  instagram: "Instagram",
  facebook: "Facebook",
  linkedin: "LinkedIn",
  whatsapp: "WhatsApp",
  email: "Email",
};

const TONE_KEYWORDS: Record<string, ToneOption> = {
  professional: "professional",
  casual: "conversational",
  conversational: "conversational",
  bold: "persuasive",
  friendly: "friendly",
  formal: "formal",
};

/** Deterministic free-text interpretation seam — pre-fills answers it can confidently detect so the user skips that question entirely. */
function interpret(freeText: string): AssistantAnswers {
  const lower = freeText.toLowerCase();
  const answers: AssistantAnswers = {};

  for (const [keyword, label] of Object.entries(CHANNEL_KEYWORDS)) {
    if (lower.includes(keyword)) {
      answers.channels = label;
      break;
    }
  }

  for (const [keyword, tone] of Object.entries(TONE_KEYWORDS)) {
    if (lower.includes(keyword)) {
      answers.tone = tone;
      break;
    }
  }

  if (/\b(both|creative and content|content and creative)\b/.test(lower)) answers.needType = "both";
  else if (/\b(creative|design|image|banner|poster)\b/.test(lower)) answers.needType = "creative";
  else if (/\b(caption|copy|blog|email|script|content)\b/.test(lower)) answers.needType = "content";

  return answers;
}

class AssistantConversationEngineImpl {
  createSession(objective: string): AssistantSession {
    const answers = interpret(objective);
    return {
      turns: [{ role: "user", message: objective }],
      answers,
      objective,
      done: false,
    };
  }

  nextQuestion(session: AssistantSession): AssistantQuestion | undefined {
    return ASSISTANT_QUESTION_BANK.find(question => session.answers[question.id] === undefined);
  }

  answer(session: AssistantSession, questionId: AssistantQuestionId, optionId: string, optionLabel: string): AssistantSession {
    const value = questionId === "needType" ? (optionId as AssistantNeedType) : questionId === "tone" ? (optionId as ToneOption) : optionLabel;
    const answers: AssistantAnswers = { ...session.answers, [questionId]: value };
    const turns = [...session.turns, { role: "user" as const, message: optionLabel, questionId }];
    const next = ASSISTANT_QUESTION_BANK.find(question => answers[question.id] === undefined);
    return { ...session, answers, turns, done: !next };
  }

  toBrief(session: AssistantSession): ContentBrief {
    return {
      objective: session.objective,
      audienceName: session.answers.audience ?? "General audience",
      tone: session.answers.tone ?? "professional",
      cta: session.answers.cta ?? "Learn More",
      language: "English",
    };
  }
}

export const assistantConversationEngine = new AssistantConversationEngineImpl();
export { AssistantConversationEngineImpl, ASSISTANT_QUESTION_BANK };
