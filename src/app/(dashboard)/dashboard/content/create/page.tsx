"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Download, Expand, Globe2, History, Loader2, Save, Send, Share2, Shrink,
  Sparkles, TrendingUp, Wand2,
} from "lucide-react";
import { MyCreationsPanel } from "@/components/content/MyCreationsPanel";
import { useContentStudio } from "@/features/content/ContentStudioProvider";
import { analyzeContentPromptAction, type ConversationTurn } from "@/features/content/actions";
import type { ContentAction, GenerationHistoryEntry, PromptIntentAnalysis } from "@/core/content";

type Phase = "intro" | "clarifying" | "generating" | "result";
type ResultView = "primary" | "short" | "long";
const LANGUAGES = ["Spanish", "French", "German", "Hindi", "Portuguese", "Arabic"];

const EXAMPLES = [
  "Write a LinkedIn post about our new MBA cohort.",
  "Write a blog on why students choose Calixo.",
  "Create an email campaign for admissions season.",
  "Generate Google Ads headlines for B.Tech admissions.",
  "Write Meta primary text for our scholarship offer.",
  "Generate a WhatsApp campaign for exam results.",
];

const PROGRESS_STAGES = ["Understanding your brief…", "Matching the right format…", "Applying brand voice…", "Writing…", "Polishing for the platform…"];

const ACTIONS: { id: ContentAction; label: string; icon: typeof Wand2 }[] = [
  { id: "rewrite", label: "Rewrite", icon: Wand2 },
  { id: "shorten", label: "Shorten", icon: Shrink },
  { id: "expand", label: "Expand", icon: Expand },
  { id: "improve-readability", label: "Improve Readability", icon: Sparkles },
  { id: "improve-engagement", label: "Improve Engagement", icon: TrendingUp },
  { id: "improve-seo", label: "Improve SEO", icon: TrendingUp },
];

function useStagedProgress(active: boolean) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (!active) {
      (async () => setI(0))();
      return;
    }
    const id = setInterval(() => setI(v => Math.min(v + 1, PROGRESS_STAGES.length - 1)), 1500);
    return () => clearInterval(id);
  }, [active]);
  return PROGRESS_STAGES[i];
}

export default function ContentCreationStudioPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { brandStyleDefaults, generateContent, applyAction, saveToAssets, submitForApproval, localize, canApprove, showToast } = useContentStudio();

  const [phase, setPhase] = useState<Phase>("intro");
  const [showHistory, setShowHistory] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [conversation, setConversation] = useState<ConversationTurn[]>([]);
  const [pendingQuestion, setPendingQuestion] = useState<PromptIntentAnalysis | null>(null);
  const [answerText, setAnswerText] = useState("");
  const [busy, setBusy] = useState(false);

  const [result, setResult] = useState<GenerationHistoryEntry | null>(null);
  const [view, setView] = useState<ResultView>("primary");
  const [editedText, setEditedText] = useState("");
  const [applyingAction, setApplyingAction] = useState<ContentAction | null>(null);
  const [localizeLanguage, setLocalizeLanguage] = useState(LANGUAGES[0]);

  const stageLabel = useStagedProgress(phase === "generating");

  useEffect(() => {
    (async () => {
      if (searchParams.get("panel") === "history") setShowHistory(true);
    })();
  }, [searchParams]);

  useEffect(() => {
    (async () => {
      setView("primary");
      setEditedText(result?.primaryText ?? "");
    })();
  }, [result]);

  async function runAnalysis(text: string, turns: ConversationTurn[]) {
    setBusy(true);
    const response = await analyzeContentPromptAction(text, turns);
    setBusy(false);
    if (!response.ok || !response.analysis) {
      showToast(response.error ?? "Something went wrong understanding that prompt.", "error");
      return;
    }
    if (!response.analysis.resolved) {
      setPendingQuestion(response.analysis);
      setPhase("clarifying");
      return;
    }
    await runGeneration(response.analysis);
  }

  async function runGeneration(analysis: PromptIntentAnalysis) {
    if (!analysis.outputId || !analysis.brief) return;
    setPhase("generating");
    const entry = await generateContent({ ...analysis.brief, brandStyleId: brandStyleDefaults?.id }, analysis.outputId as Parameters<typeof generateContent>[1]);
    if (entry) {
      setResult(entry);
      setPhase("result");
    } else {
      setPhase("intro");
    }
  }

  function start(text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;
    setPrompt(trimmed);
    setConversation([]);
    runAnalysis(trimmed, []);
  }

  async function submitClarification() {
    if (!pendingQuestion?.clarifyingQuestion || !answerText.trim()) return;
    const nextConversation = [...conversation, { question: pendingQuestion.clarifyingQuestion, answer: answerText.trim() }];
    setConversation(nextConversation);
    setAnswerText("");
    setPendingQuestion(null);
    setBusy(true);
    const response = await analyzeContentPromptAction(prompt, nextConversation);
    setBusy(false);
    if (!response.ok || !response.analysis) {
      showToast(response.error ?? "Something went wrong understanding that prompt.", "error");
      setPhase("intro");
      return;
    }
    if (!response.analysis.resolved) {
      setPendingQuestion(response.analysis);
      setPhase("clarifying");
      return;
    }
    await runGeneration(response.analysis);
  }

  async function handleAction(action: ContentAction) {
    if (!result) return;
    setApplyingAction(action);
    const updated = await applyAction(result.id, action);
    setApplyingAction(null);
    if (updated) setResult({ ...updated });
  }

  function reset() {
    setPhase("intro");
    setPrompt("");
    setConversation([]);
    setResult(null);
    router.replace("/dashboard/content/create");
  }

  const displayedText = view === "short" ? result?.shortText : view === "long" ? result?.longText : editedText;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Content Creation Studio</h1>
          <p className="mt-1 text-sm text-muted-foreground">Describe what you need to write. Calixo detects the format, platform, and tone automatically.</p>
        </div>
        <button
          onClick={() => setShowHistory(v => !v)}
          className="flex h-10 items-center gap-2 rounded-xl border border-border bg-surface/70 px-3.5 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <History size={15} /> {showHistory ? "Back to Studio" : "My Creations"}
        </button>
      </div>

      {showHistory ? (
        <MyCreationsPanel kind="content" onSelect={entry => { setResult(entry); setPhase("result"); setShowHistory(false); }} />
      ) : (
        <>
          {phase === "intro" && (
            <div className="mx-auto flex max-w-2xl flex-col gap-6">
              <div className="rounded-2xl border border-border bg-card p-6">
                <textarea
                  value={prompt}
                  onChange={e => setPrompt(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      start(prompt);
                    }
                  }}
                  placeholder="What would you like to create today?"
                  rows={3}
                  className="w-full resize-none rounded-xl border-0 bg-transparent text-base text-foreground outline-none placeholder:text-muted-foreground"
                />
                <div className="mt-3 flex items-center justify-between gap-3">
                  <p className="text-xs text-muted-foreground">Est. 18 credits</p>
                  <button
                    onClick={() => start(prompt)}
                    disabled={!prompt.trim() || busy}
                    className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
                  >
                    {busy ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                    Write It
                  </button>
                </div>
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

          {phase === "clarifying" && pendingQuestion && (
            <div className="mx-auto flex max-w-lg flex-col gap-4 py-8">
              <p className="text-center text-base font-medium text-foreground">{pendingQuestion.clarifyingQuestion}</p>
              <div className="flex flex-wrap justify-center gap-2">
                {(pendingQuestion.clarifyingOptions ?? []).map(option => (
                  <button
                    key={option}
                    onClick={() => {
                      setAnswerText(option);
                      setTimeout(() => submitClarification(), 0);
                    }}
                    disabled={busy}
                    className="rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-primary/40 disabled:opacity-50"
                  >
                    {option}
                  </button>
                ))}
              </div>
              <div className="mx-auto flex w-full max-w-sm items-center gap-2">
                <input
                  value={answerText}
                  onChange={e => setAnswerText(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && submitClarification()}
                  placeholder="Or type your own answer"
                  className="flex-1 rounded-xl border border-border bg-surface/60 px-3.5 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary/40"
                />
                <button onClick={submitClarification} disabled={!answerText.trim() || busy} className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-40">
                  {busy ? <Loader2 size={14} className="animate-spin" /> : "Send"}
                </button>
              </div>
            </div>
          )}

          {phase === "generating" && (
            <div className="flex flex-col items-center justify-center gap-4 py-24">
              <Loader2 size={32} className="animate-spin text-primary" />
              <p className="text-sm font-medium text-foreground">{stageLabel}</p>
            </div>
          )}

          {phase === "result" && result && (
            <div className="mx-auto max-w-3xl space-y-6">
              <button onClick={reset} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
                <ArrowLeft size={14} /> Create another
              </button>

              <div className="flex gap-2">
                {(["primary", "short", "long"] as ResultView[]).map(v => (
                  <button
                    key={v}
                    onClick={() => setView(v)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                      view === v ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>

              {view === "primary" ? (
                <textarea
                  value={editedText}
                  onChange={e => setEditedText(e.target.value)}
                  rows={10}
                  className="w-full whitespace-pre-wrap rounded-2xl border border-border bg-card p-4 text-sm text-foreground outline-none focus:border-primary/40"
                />
              ) : (
                <div className="whitespace-pre-wrap rounded-2xl border border-border bg-card p-4 text-sm text-foreground">{displayedText}</div>
              )}

              {result.textVariants && result.textVariants.length > 0 && (
                <div>
                  <p className="mb-1.5 text-sm font-semibold text-foreground">Variant</p>
                  <div className="whitespace-pre-wrap rounded-2xl border border-border bg-surface/40 p-4 text-sm text-muted-foreground">{result.textVariants[0]}</div>
                </div>
              )}

              {result.hashtags && result.hashtags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {result.hashtags.map(tag => (
                    <span key={tag} className="rounded-full bg-primary/10 px-2.5 py-1 text-xs text-primary">
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {result.ctaVariations && result.ctaVariations.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {result.ctaVariations.map(ctaOption => (
                    <span key={ctaOption} className="rounded-full border border-border bg-surface/40 px-2.5 py-1 text-xs text-muted-foreground">
                      {ctaOption}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                {ACTIONS.map(action => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={action.id}
                      onClick={() => handleAction(action.id)}
                      disabled={applyingAction !== null}
                      className="flex items-center gap-1.5 rounded-lg border border-border bg-surface/60 px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-primary/30 disabled:opacity-50"
                    >
                      <Icon size={13} /> {applyingAction === action.id ? "Working…" : action.label}
                    </button>
                  );
                })}
              </div>

              {result.localizedVersions && result.localizedVersions.length > 0 && (
                <div>
                  <p className="mb-2 text-sm font-semibold text-foreground">Localized Versions</p>
                  {result.localizedVersions.map(lv => (
                    <p key={lv.language} className="mb-1 whitespace-pre-wrap rounded-xl border border-border bg-surface/40 px-3 py-2 text-xs text-muted-foreground">
                      <span className="font-semibold text-foreground">{lv.language}:</span> {lv.text}
                    </p>
                  ))}
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    if (!saveToAssets(result.id)) showToast("Unable to save to Assets — check your plan or permissions.", "error");
                  }}
                  className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
                >
                  <Save size={15} /> Save to Assets
                </button>
                <a
                  href={`data:text/plain;charset=utf-8,${encodeURIComponent(editedText)}`}
                  download={`${result.outputLabel}.txt`}
                  className="flex items-center gap-2 rounded-xl border border-border bg-surface/60 px-4 py-2.5 text-sm font-medium text-foreground hover:border-primary/30"
                >
                  <Download size={15} /> Download
                </a>
                {canApprove && (
                  <button
                    onClick={() => {
                      if (!submitForApproval(result.id)) showToast("Unable to submit for approval.", "error");
                    }}
                    className="flex items-center gap-2 rounded-xl border border-border bg-surface/60 px-4 py-2.5 text-sm font-medium text-foreground hover:border-primary/30"
                  >
                    <Send size={15} /> Submit for Approval
                  </button>
                )}
                <Link
                  href="/dashboard/social/compose"
                  className="flex items-center gap-2 rounded-xl border border-border bg-surface/60 px-4 py-2.5 text-sm font-medium text-foreground hover:border-primary/30"
                >
                  <Share2 size={15} /> Schedule on Social
                </Link>
              </div>

              <div className="flex flex-wrap items-center gap-2 rounded-xl border border-dashed border-primary/30 bg-primary/[0.03] p-3">
                <Globe2 size={15} className="text-muted-foreground" />
                <select
                  value={localizeLanguage}
                  onChange={e => setLocalizeLanguage(e.target.value)}
                  className="rounded-lg border border-border bg-surface/60 px-2.5 py-1.5 text-xs text-foreground outline-none"
                >
                  {LANGUAGES.map(lang => (
                    <option key={lang} value={lang}>
                      {lang}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => {
                    const updated = localize(result.id, localizeLanguage);
                    if (updated) setResult({ ...updated });
                  }}
                  className="rounded-lg border border-border bg-surface/60 px-3 py-1.5 text-xs font-medium text-foreground hover:border-primary/30"
                >
                  Translate
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
