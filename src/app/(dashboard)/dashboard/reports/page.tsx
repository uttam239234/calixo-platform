"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bot, LayoutTemplate, Loader2, RotateCcw, Sparkles } from "lucide-react";
import { logReportsError, reportsPlatformAPI } from "@/core/reports";
import type { AssistantQuestionId, AssistantSession, ReportDataset, ReportDefinition, ReportSourceId } from "@/core/reports";
import { useReportsContext } from "@/features/reports/ReportsProvider";
import { ReportsDashboard } from "@/components/reports";

type Phase = "intro" | "chat" | "generating" | "result";

const EXAMPLES = ["Create a report showing admissions by state.", "Create a weekly marketing report.", "Create a social media engagement report.", "Create an executive summary."];

interface ResultState {
  report: ReportDefinition;
  dataset?: ReportDataset;
  responseText: string;
}

/**
 * The PRIMARY entry point, per the rebuild brief: "AI Report Assistant... primary experience for
 * most users." A deterministic conversation (`ReportAssistantEngine`) asks only what's needed —
 * the brief's own 4 worked examples all resolve with zero questions — then builds the report via
 * the real `ReportBuilder` + `ReportDataSourceRouter`, never a hand-rolled dataset.
 */
export default function AiReportAssistantPage() {
  const router = useRouter();
  const { currentUserName, canCreate, recordAiGenerated, showToast } = useReportsContext();

  const [phase, setPhase] = useState<Phase>("intro");
  const [message, setMessage] = useState("");
  const [session, setSession] = useState<AssistantSession | null>(null);
  const [result, setResult] = useState<ResultState | null>(null);
  const templates = reportsPlatformAPI.listSourceTemplates();

  function guardedStart(fn: () => void) {
    if (!canCreate) {
      showToast("You don't have permission to create reports.");
      return;
    }
    fn();
  }

  function start(text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;
    guardedStart(() => {
      setSession(reportsPlatformAPI.createAssistantSession(trimmed));
      setPhase("chat");
    });
  }

  function handleAnswer(questionId: AssistantQuestionId, optionId: string, optionLabel: string) {
    if (!session) return;
    setSession(reportsPlatformAPI.answerAssistantQuestion(session, questionId, optionId, optionLabel));
  }

  async function resolveSession(finishedSession: AssistantSession) {
    setPhase("generating");
    const startedAt = Date.now();
    try {
      const resolved = await reportsPlatformAPI.resolveAssistantSession(finishedSession, currentUserName);
      if (resolved) {
        recordAiGenerated();
        setResult(resolved);
        setPhase("result");
      } else {
        showToast("Something went wrong generating that report.");
        setPhase("intro");
      }
    } catch (error) {
      logReportsError("Failed to resolve assistant session", error);
      showToast("Something went wrong generating that report.");
      setPhase("intro");
    }
    void startedAt;
  }

  async function handleQuickTemplate(sourceId: ReportSourceId) {
    guardedStart(async () => {
      setPhase("generating");
      const { report, dataset } = await reportsPlatformAPI.generateFromTemplate(sourceId, currentUserName);
      recordAiGenerated();
      setResult({ report, dataset, responseText: dataset?.sourceLabel ? `Here's your "${report.name}" report — live data from ${dataset.sourceLabel}.` : `Created "${report.name}".` });
      setPhase("result");
    });
  }

  useEffect(() => {
    (async () => {
      if (session?.resolved && phase === "chat") {
        await resolveSession(session);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- resolveSession is a one-shot trigger keyed off session/phase
  }, [session, phase]);

  function reset() {
    setPhase("intro");
    setMessage("");
    setSession(null);
    setResult(null);
  }

  const nextQuestion = session ? reportsPlatformAPI.nextAssistantQuestion(session) : undefined;

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-2xl flex-col">
      {phase === "intro" && (
        <div className="flex flex-1 flex-col items-center justify-center gap-6 py-8 text-center">
          <Bot size={36} className="text-primary" />
          <h1 className="text-2xl font-bold text-foreground">What would you like to know?</h1>
          <div className="w-full max-w-lg">
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  start(message);
                }
              }}
              placeholder="e.g. Create a weekly marketing report."
              rows={2}
              className="w-full resize-none rounded-2xl border border-border bg-card px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary/40"
            />
            <button
              onClick={() => start(message)}
              disabled={!message.trim()}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
            >
              <Sparkles size={16} /> Create report
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

          <div className="mt-4 w-full">
            <p className="mb-2.5 flex items-center justify-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <LayoutTemplate size={12} /> Or start from a template
            </p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {templates.map(t => (
                <button
                  key={t.sourceId}
                  onClick={() => handleQuickTemplate(t.sourceId)}
                  className="rounded-2xl border border-border bg-card p-3 text-left transition-colors hover:border-primary/40 hover:bg-primary/5"
                >
                  <p className="text-sm font-medium text-foreground">{t.name}</p>
                  <p className="mt-0.5 line-clamp-2 text-[11px] text-muted-foreground">{t.description}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {phase === "chat" && session && (
        <div className="flex flex-1 flex-col gap-4 py-6">
          {session.turns.map((turn, i) => (
            <div key={i} className={turn.role === "user" ? "ml-auto max-w-sm rounded-2xl bg-primary/10 px-4 py-2.5 text-sm text-foreground" : "max-w-sm rounded-2xl bg-surface/60 px-4 py-2.5 text-sm text-foreground"}>
              {turn.content}
            </div>
          ))}
          {nextQuestion && (
            <div className="max-w-sm rounded-2xl bg-surface/60 px-4 py-2.5 text-sm text-foreground">
              {nextQuestion.question}
              {nextQuestion.options && (
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
              )}
            </div>
          )}
        </div>
      )}

      {phase === "generating" && (
        <div className="flex flex-1 flex-col items-center justify-center gap-3">
          <Loader2 size={28} className="animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Building your report…</p>
        </div>
      )}

      {phase === "result" && result && (
        <div className="flex flex-1 flex-col gap-4 py-6">
          <div className="rounded-2xl border border-border bg-card p-4">
            <p className="text-sm text-foreground">{result.responseText}</p>
          </div>
          <ReportsDashboard report={result.report} dataset={result.dataset} />
          <div className="flex flex-wrap gap-2">
            <button onClick={() => router.push("/dashboard/reports/library")} className="rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-medium text-foreground hover:border-primary/30">
              Open in Report Library →
            </button>
            <button onClick={() => router.push("/dashboard/reports/scheduled")} className="rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-medium text-foreground hover:border-primary/30">
              Schedule delivery →
            </button>
          </div>
          <button onClick={reset} className="mx-auto mt-2 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
            <RotateCcw size={14} /> Ask something else
          </button>
        </div>
      )}
    </div>
  );
}
