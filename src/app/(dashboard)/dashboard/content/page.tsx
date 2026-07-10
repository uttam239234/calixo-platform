"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bot, Loader2, RotateCcw, Sparkles } from "lucide-react";
import { assistantConversationEngine, trackContentTiming } from "@/core/content";
import type { AssistantQuestionId, AssistantSession, ContentOutputKind, CreativeOutputKind, GenerationHistoryEntry } from "@/core/content";
import { useContentStudio } from "@/features/content/ContentStudioProvider";

type Phase = "intro" | "chat" | "generating" | "result";

const EXAMPLES = [
  "I want admissions leads for MBA.",
  "Create Instagram content for B.Tech admissions.",
  "Generate a Meta campaign for nursing admissions.",
  "Create a WhatsApp campaign for scholarships.",
  "Create content for LinkedIn.",
];

const CHANNEL_TO_CREATIVE: Record<string, CreativeOutputKind> = {
  Instagram: "instagram-post",
  Facebook: "facebook-post",
  LinkedIn: "linkedin-post",
  WhatsApp: "whatsapp-creative",
  Email: "email-header",
};

const CHANNEL_TO_CONTENT: Record<string, ContentOutputKind> = {
  Instagram: "social-caption",
  Facebook: "social-caption",
  LinkedIn: "social-caption",
  WhatsApp: "whatsapp-campaign",
  Email: "email",
};

/**
 * The PRIMARY entry point, per the rebuild brief: "What would you like to create today?" A
 * deterministic conversation (see `AssistantConversationEngine`) asks only the questions needed,
 * then calls the exact same `generateCreative`/`generateContent` the two Studios' Simple Mode
 * call directly — guaranteeing the same underlying pipeline either way.
 */
export default function AiAssistantPage() {
  const router = useRouter();
  const { generateCreative, generateContent, brandStyleDefaults } = useContentStudio();

  const [phase, setPhase] = useState<Phase>("intro");
  const [objective, setObjective] = useState("");
  const [session, setSession] = useState<AssistantSession | null>(null);
  const [results, setResults] = useState<GenerationHistoryEntry[]>([]);

  function start(text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;
    setSession(assistantConversationEngine.createSession(trimmed));
    setPhase("chat");
  }

  function handleAnswer(questionId: AssistantQuestionId, optionId: string, optionLabel: string) {
    if (!session) return;
    setSession(assistantConversationEngine.answer(session, questionId, optionId, optionLabel));
  }

  async function runGeneration(finishedSession: AssistantSession) {
    setPhase("generating");
    const startedAt = Date.now();
    const brief = { ...assistantConversationEngine.toBrief(finishedSession), brandStyleId: brandStyleDefaults?.id };
    const channel = finishedSession.answers.channels ?? "Instagram";
    const needType = finishedSession.answers.needType ?? "both";
    const entries: GenerationHistoryEntry[] = [];

    if (needType === "creative" || needType === "both") {
      const creativeId = CHANNEL_TO_CREATIVE[channel] ?? "instagram-post";
      const entry = await generateCreative(brief, creativeId);
      if (entry) entries.push(entry);
    }
    if (needType === "content" || needType === "both") {
      const contentId = CHANNEL_TO_CONTENT[channel] ?? "social-caption";
      const entry = await generateContent(brief, contentId);
      if (entry) entries.push(entry);
    }

    trackContentTiming("ai", Date.now() - startedAt);
    setResults(entries);
    setPhase("result");
  }

  useEffect(() => {
    (async () => {
      if (session?.done && phase === "chat") {
        await runGeneration(session);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- runGeneration is a one-shot trigger keyed off session/phase; including it would re-run needlessly every render
  }, [session, phase]);

  function reset() {
    setPhase("intro");
    setObjective("");
    setSession(null);
    setResults([]);
  }

  const nextQuestion = session ? assistantConversationEngine.nextQuestion(session) : undefined;

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-2xl flex-col">
      {phase === "intro" && (
        <div className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
          <Bot size={36} className="text-primary" />
          <h1 className="text-2xl font-bold text-foreground">What would you like to create today?</h1>
          <div className="w-full max-w-lg">
            <textarea
              value={objective}
              onChange={e => setObjective(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  start(objective);
                }
              }}
              placeholder="e.g. I want admissions leads for MBA."
              rows={2}
              className="w-full resize-none rounded-2xl border border-border bg-card px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary/40"
            />
            <button
              onClick={() => start(objective)}
              disabled={!objective.trim()}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
            >
              <Sparkles size={16} /> Start creating
            </button>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {EXAMPLES.map(example => (
              <button
                key={example}
                onClick={() => start(example)}
                className="rounded-full border border-border bg-surface/60 px-3.5 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground"
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      )}

      {phase === "chat" && session && (
        <div className="flex flex-1 flex-col gap-4 py-6">
          {session.turns.map((turn, i) => (
            <div key={i} className={turn.role === "user" ? "ml-auto max-w-sm rounded-2xl bg-primary/10 px-4 py-2.5 text-sm text-foreground" : "max-w-sm rounded-2xl bg-surface/60 px-4 py-2.5 text-sm text-foreground"}>
              {turn.message}
            </div>
          ))}
          {nextQuestion && (
            <div className="max-w-sm rounded-2xl bg-surface/60 px-4 py-2.5 text-sm text-foreground">
              {nextQuestion.prompt}
              <div className="mt-2.5 flex flex-wrap gap-2">
                {nextQuestion.options.map(option => (
                  <button
                    key={option.id}
                    onClick={() => handleAnswer(nextQuestion.id, option.id, option.label)}
                    className="rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-primary/40"
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {phase === "generating" && (
        <div className="flex flex-1 flex-col items-center justify-center gap-3">
          <Loader2 size={28} className="animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Creating your content…</p>
        </div>
      )}

      {phase === "result" && (
        <div className="flex flex-1 flex-col gap-4 py-6">
          <h2 className="text-lg font-bold text-foreground">Here&apos;s what I made</h2>
          {results.length === 0 && <p className="text-sm text-muted-foreground">Something went wrong — please try again.</p>}
          {results.map(entry => (
            <div key={entry.id} className="rounded-2xl border border-border bg-card p-4">
              {entry.kind === "creative" && entry.primaryImageUrl && <img src={entry.primaryImageUrl} alt={entry.outputLabel} className="mb-3 w-full rounded-xl object-cover" />}
              {entry.kind === "content" && <p className="mb-3 whitespace-pre-wrap text-sm text-muted-foreground">{entry.primaryText}</p>}
              <p className="mb-2 text-sm font-semibold text-foreground">{entry.outputLabel}</p>
              <button
                onClick={() => router.push(entry.kind === "creative" ? "/dashboard/content/creative?panel=history" : "/dashboard/content/create?panel=history")}
                className="text-xs font-medium text-primary hover:underline"
              >
                Open in {entry.kind === "creative" ? "Creative Design Studio" : "Content Creation Studio"} →
              </button>
            </div>
          ))}
          <button onClick={reset} className="mx-auto mt-2 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
            <RotateCcw size={14} /> Create something else
          </button>
        </div>
      )}
    </div>
  );
}
