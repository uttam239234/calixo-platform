"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, ChevronDown, ChevronUp, Download, History, Loader2, Megaphone,
  Save, Send, Settings2, Share2, Sparkles, Wand2, X,
} from "lucide-react";
import { MyCreationsPanel } from "@/components/content/MyCreationsPanel";
import { useContentStudio } from "@/features/content/ContentStudioProvider";
import { analyzeCreativePromptAction, analyzeCampaignPromptAction, executeCampaignAction, type ConversationTurn } from "@/features/content/actions";
import type { CampaignPlan, CreativeVariation, GenerationHistoryEntry, PromptIntentAnalysis } from "@/core/content";

type Phase = "intro" | "clarifying" | "campaign-checklist" | "generating" | "result" | "campaign-result";

const EXAMPLES = [
  "Design an Instagram creative announcing MBA Admissions 2027.",
  "Create a Facebook ad for our Engineering programmes.",
  "Design a Google Display Banner promoting B.Tech admissions.",
  "Create a premium WhatsApp creative for Assam CEE results.",
];

const PROGRESS_STAGES = [
  "Understanding your brief…",
  "Planning the layout…",
  "Applying brand guidelines…",
  "Generating artwork…",
  "Checking typography…",
  "Optimising composition…",
  "Preparing final variations…",
];

const VISUAL_STYLES = ["Modern", "Corporate", "Creative", "Playful", "Luxury", "Tech"];

/** Client-side staged progress narration during the real (awaited) generation call — the labels
 * cycle on a timer, not driven by real server-side step-completion events, since Next.js Server
 * Actions don't expose mid-flight progress over the request/response model. Disclosed choice: the
 * work behind each label is genuinely happening during this window, just not precisely synced to
 * it — the alternative (a detached background job + polling) was judged not worth the added
 * fragility for a single blocking call that already completes in well under a minute. */
function useStagedProgress(active: boolean) {
  const [stageIndex, setStageIndex] = useState(0);
  useEffect(() => {
    if (!active) {
      (async () => setStageIndex(0))();
      return;
    }
    const id = setInterval(() => {
      setStageIndex(i => Math.min(i + 1, PROGRESS_STAGES.length - 1));
    }, 1900);
    return () => clearInterval(id);
  }, [active]);
  return PROGRESS_STAGES[stageIndex];
}

export default function CreativeDesignStudioPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { generateCreative, editCreativeVariation, saveToAssets, submitForApproval, canApprove, brandStyleDefaults, showToast } = useContentStudio();

  const [phase, setPhase] = useState<Phase>("intro");
  const [showHistory, setShowHistory] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [conversation, setConversation] = useState<ConversationTurn[]>([]);
  const [pendingQuestion, setPendingQuestion] = useState<PromptIntentAnalysis | null>(null);
  const [answerText, setAnswerText] = useState("");
  const [result, setResult] = useState<GenerationHistoryEntry | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editInstruction, setEditInstruction] = useState("");
  const [applyingEdit, setApplyingEdit] = useState(false);

  const [campaignMode, setCampaignMode] = useState(false);
  const [campaignPlan, setCampaignPlan] = useState<CampaignPlan | null>(null);
  const [selectedAssetIds, setSelectedAssetIds] = useState<string[]>([]);
  const [campaignResults, setCampaignResults] = useState<GenerationHistoryEntry[]>([]);

  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [variationCount, setVariationCount] = useState(4);
  const [visualStyleOverride, setVisualStyleOverride] = useState("");
  const [negativePromptExtra, setNegativePromptExtra] = useState("");
  const [safeMargins, setSafeMargins] = useState(true);

  const [busy, setBusy] = useState(false);
  const stageLabel = useStagedProgress(phase === "generating");
  const abortedRef = useRef(false);

  useEffect(() => {
    (async () => {
      if (searchParams.get("panel") === "history") setShowHistory(true);
    })();
  }, [searchParams]);

  useEffect(() => {
    // Root-cause fix (production incident): React Strict Mode (on by default in `next dev`)
    // double-invokes effects on initial mount — mount, cleanup, mount again — specifically to
    // surface bugs like the one this had: the cleanup below set `abortedRef.current = true` with
    // nothing ever resetting it back to `false`, so after Strict Mode's dev-only double-invoke
    // settled, EVERY subsequent real generation silently hit the `if (abortedRef.current) return;`
    // guard in `runGeneration()` — the backend genuinely succeeded (credits consumed, a real image
    // generated) but `setResult`/`setPhase("result")` never ran, so nothing ever appeared on
    // screen. Resetting to `false` on every real mount (including Strict Mode's second one) fixes
    // this; only an actual unmount (navigating away) should ever leave it `true`.
    abortedRef.current = false;
    return () => {
      abortedRef.current = true;
    };
  }, []);

  const estimatedCredits = useMemo(() => 3 + variationCount * 15, [variationCount]);

  function reset() {
    setPhase("intro");
    setPrompt("");
    setConversation([]);
    setPendingQuestion(null);
    setAnswerText("");
    setResult(null);
    setCampaignMode(false);
    setCampaignPlan(null);
    setSelectedAssetIds([]);
    setCampaignResults([]);
    router.replace("/dashboard/content/creative");
  }

  async function runSingleAnalysis(text: string, turns: ConversationTurn[]) {
    setBusy(true);
    const response = await analyzeCreativePromptAction(text, turns);
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
    const brief = {
      ...analysis.brief,
      brandStyleId: brandStyleDefaults?.id,
      visualStyleOverride: visualStyleOverride || undefined,
      negativePromptExtra: negativePromptExtra || undefined,
    };
    const entry = await generateCreative(brief, analysis.outputId as Parameters<typeof generateCreative>[1], variationCount);
    if (abortedRef.current) return;
    if (entry) {
      setResult(entry);
      setPhase("result");
    } else {
      setPhase("intro");
    }
  }

  function startFromPrompt(text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;
    if (campaignMode) {
      runCampaignAnalysis(trimmed);
      return;
    }
    setPrompt(trimmed);
    setConversation([]);
    runSingleAnalysis(trimmed, []);
  }

  async function submitClarification() {
    if (!pendingQuestion?.clarifyingQuestion || !answerText.trim()) return;
    const nextConversation = [...conversation, { question: pendingQuestion.clarifyingQuestion, answer: answerText.trim() }];
    setConversation(nextConversation);
    setAnswerText("");
    setPendingQuestion(null);
    setBusy(true);
    const response = await analyzeCreativePromptAction(prompt, nextConversation);
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

  async function runCampaignAnalysis(text: string) {
    setPrompt(text);
    setBusy(true);
    const response = await analyzeCampaignPromptAction(text);
    setBusy(false);
    if (!response.ok || !response.plan) {
      showToast(response.error ?? "Something went wrong understanding that campaign.", "error");
      return;
    }
    setCampaignPlan(response.plan);
    setSelectedAssetIds(response.plan.assetOptions.filter(a => a.selected).map(a => a.id));
    setPhase("campaign-checklist");
  }

  async function runCampaignExecution() {
    if (!campaignPlan) return;
    setPhase("generating");
    const response = await executeCampaignAction(campaignPlan, selectedAssetIds);
    if (!response.ok) {
      showToast(response.error ?? "Something went wrong generating that campaign.", "error");
      setPhase("campaign-checklist");
      return;
    }
    setCampaignResults(response.results ?? []);
    setPhase("campaign-result");
  }

  async function handleEditVariation(index: number) {
    if (!result || !editInstruction.trim()) return;
    setApplyingEdit(true);
    const updated = await editCreativeVariation(result.id, index, editInstruction.trim());
    setApplyingEdit(false);
    if (updated) {
      setResult({ ...updated });
      setEditInstruction("");
      setEditingIndex(null);
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Creative Design Studio</h1>
          <p className="mt-1 text-sm text-muted-foreground">Describe what you need. Calixo handles platform sizing, brand rules, and layout automatically.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCampaignMode(v => !v)}
            className={`flex h-10 items-center gap-2 rounded-xl border px-3.5 text-sm font-medium transition-colors ${
              campaignMode ? "border-primary/40 bg-primary/10 text-primary" : "border-border bg-surface/70 text-muted-foreground hover:text-foreground"
            }`}
          >
            <Megaphone size={15} /> Generate Complete Campaign
          </button>
          <button
            onClick={() => setShowHistory(v => !v)}
            className="flex h-10 items-center gap-2 rounded-xl border border-border bg-surface/70 px-3.5 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <History size={15} /> {showHistory ? "Back to Studio" : "My Creations"}
          </button>
        </div>
      </div>

      {showHistory ? (
        <MyCreationsPanel kind="creative" onSelect={entry => { setResult(entry); setPhase("result"); setShowHistory(false); }} />
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
                      startFromPrompt(prompt);
                    }
                  }}
                  placeholder={campaignMode ? "e.g. Launch MBA Admissions 2027" : "What would you like to design today?"}
                  rows={3}
                  className="w-full resize-none rounded-xl border-0 bg-transparent text-base text-foreground outline-none placeholder:text-muted-foreground"
                />
                <div className="mt-3 flex items-center justify-between gap-3">
                  <p className="text-xs text-muted-foreground">Est. {campaignMode ? "varies by assets selected" : `${estimatedCredits} credits`}</p>
                  <button
                    onClick={() => startFromPrompt(prompt)}
                    disabled={!prompt.trim() || busy}
                    className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
                  >
                    {busy ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                    {campaignMode ? "Plan Campaign" : "Design It"}
                  </button>
                </div>
              </div>

              {!campaignMode && (
                <div className="flex flex-wrap justify-center gap-2">
                  {EXAMPLES.map(example => (
                    <button
                      key={example}
                      onClick={() => startFromPrompt(example)}
                      className="rounded-full border border-border bg-surface/60 px-3.5 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground"
                    >
                      {example}
                    </button>
                  ))}
                </div>
              )}

              {!campaignMode && (
                <div className="rounded-2xl border border-dashed border-border bg-surface/30">
                  <button onClick={() => setAdvancedOpen(v => !v)} className="flex w-full items-center justify-between px-5 py-3 text-sm font-medium text-foreground">
                    <span className="flex items-center gap-2"><Settings2 size={15} className="text-muted-foreground" /> Advanced Options</span>
                    {advancedOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                  </button>
                  {advancedOpen && (
                    <div className="space-y-4 border-t border-border/60 px-5 py-4">
                      <div className="flex items-center gap-2 rounded-xl border border-border bg-surface/40 px-3.5 py-2.5 text-xs text-muted-foreground">
                        <Sparkles size={13} className="text-primary" />
                        Brand Kit: <span className="font-medium text-foreground">{brandStyleDefaults?.brandName ?? "Default"}</span> — logo, colours, and voice are applied automatically.
                      </div>
                      <div>
                        <label className="mb-1.5 block text-xs font-medium text-foreground">Visual Style</label>
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => setVisualStyleOverride("")}
                            className={`rounded-lg border px-3 py-1.5 text-xs font-medium ${!visualStyleOverride ? "border-primary/40 bg-primary/10 text-primary" : "border-border bg-surface/60 text-muted-foreground"}`}
                          >
                            Auto
                          </button>
                          {VISUAL_STYLES.map(style => (
                            <button
                              key={style}
                              onClick={() => setVisualStyleOverride(style.toLowerCase())}
                              className={`rounded-lg border px-3 py-1.5 text-xs font-medium ${visualStyleOverride === style.toLowerCase() ? "border-primary/40 bg-primary/10 text-primary" : "border-border bg-surface/60 text-muted-foreground"}`}
                            >
                              {style}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="mb-1.5 block text-xs font-medium text-foreground">Number of Variations: {variationCount}</label>
                        <input type="range" min={1} max={4} value={variationCount} onChange={e => setVariationCount(Number(e.target.value))} className="w-full accent-primary" />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-xs font-medium text-foreground">Negative Prompt</label>
                        <input
                          value={negativePromptExtra}
                          onChange={e => setNegativePromptExtra(e.target.value)}
                          placeholder="e.g. no stock-photo people, no clutter"
                          className="w-full rounded-xl border border-border bg-surface/60 px-3.5 py-2 text-xs text-foreground outline-none placeholder:text-muted-foreground focus:border-primary/40"
                        />
                      </div>
                      <label className="flex items-center justify-between rounded-xl border border-border bg-surface/40 px-3.5 py-2.5 text-xs text-foreground">
                        <span>Enforce platform safe margins</span>
                        <input type="checkbox" checked={safeMargins} onChange={e => setSafeMargins(e.target.checked)} className="h-4 w-4 accent-primary" />
                      </label>
                      <p className="text-[11px] text-muted-foreground">Image model: OpenAI gpt-image-1 (selected automatically — more providers coming soon).</p>
                    </div>
                  )}
                </div>
              )}
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

          {phase === "campaign-checklist" && campaignPlan && (
            <div className="mx-auto flex max-w-lg flex-col gap-4 py-6">
              <div className="text-center">
                <p className="text-base font-semibold text-foreground">{campaignPlan.campaignName}</p>
                <p className="mt-1 text-sm text-muted-foreground">Would you like me to generate:</p>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {campaignPlan.assetOptions.map(asset => (
                  <label key={asset.id} className="flex items-center gap-2 rounded-xl border border-border bg-card px-3.5 py-2.5 text-sm text-foreground">
                    <input
                      type="checkbox"
                      checked={selectedAssetIds.includes(asset.id)}
                      onChange={e => setSelectedAssetIds(prev => (e.target.checked ? [...prev, asset.id] : prev.filter(id => id !== asset.id)))}
                      className="h-4 w-4 accent-primary"
                    />
                    {asset.label}
                  </label>
                ))}
              </div>
              <button
                onClick={runCampaignExecution}
                disabled={selectedAssetIds.length === 0}
                className="mx-auto flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-40"
              >
                <Sparkles size={16} /> Generate All ({selectedAssetIds.length})
              </button>
            </div>
          )}

          {phase === "generating" && (
            <div className="flex flex-col items-center justify-center gap-4 py-24">
              <Loader2 size={32} className="animate-spin text-primary" />
              <p className="text-sm font-medium text-foreground">{stageLabel}</p>
            </div>
          )}

          {phase === "result" && result && (
            <div className="mx-auto max-w-4xl space-y-6">
              <button onClick={reset} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
                <ArrowLeft size={14} /> Create another
              </button>

              <div className="grid gap-4 sm:grid-cols-2">
                {(result.variations ?? []).map((variation, index) => (
                  <VariationCard
                    key={variation.id}
                    variation={variation}
                    editing={editingIndex === index}
                    editInstruction={editInstruction}
                    applying={applyingEdit}
                    onEditInstructionChange={setEditInstruction}
                    onStartEdit={() => { setEditingIndex(index); setEditInstruction(""); }}
                    onCancelEdit={() => setEditingIndex(null)}
                    onApplyEdit={() => handleEditVariation(index)}
                  />
                ))}
              </div>

              {result.platformVersions && result.platformVersions.length > 0 && (
                <div>
                  <p className="mb-2 text-sm font-semibold text-foreground">Also sized for</p>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {result.platformVersions.map(pv => (
                      <div key={pv.platform}>
                        <img src={pv.imageUrl} alt={pv.platform} className="w-full rounded-xl border border-border object-cover" />
                        <p className="mt-1 text-center text-xs text-muted-foreground">{pv.platform}</p>
                      </div>
                    ))}
                  </div>
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
                {result.primaryImageUrl && (
                  <a
                    href={result.primaryImageUrl}
                    download
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 rounded-xl border border-border bg-surface/60 px-4 py-2.5 text-sm font-medium text-foreground hover:border-primary/30"
                  >
                    <Download size={15} /> Download
                  </a>
                )}
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
            </div>
          )}

          {phase === "campaign-result" && (
            <div className="mx-auto max-w-4xl space-y-6">
              <button onClick={reset} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
                <ArrowLeft size={14} /> Plan another campaign
              </button>
              <p className="text-center text-base font-semibold text-foreground">{campaignResults.length} asset{campaignResults.length === 1 ? "" : "s"} generated</p>
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                {campaignResults.map(entry => (
                  <div key={entry.id} className="rounded-2xl border border-border bg-card p-3">
                    {entry.kind === "creative" && entry.primaryImageUrl && <img src={entry.primaryImageUrl} alt={entry.outputLabel} className="mb-2 h-32 w-full rounded-lg object-cover" />}
                    {entry.kind === "content" && <p className="mb-2 line-clamp-4 whitespace-pre-wrap text-xs text-muted-foreground">{entry.primaryText}</p>}
                    <p className="text-sm font-semibold text-foreground">{entry.outputLabel}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function VariationCard({
  variation, editing, editInstruction, applying, onEditInstructionChange, onStartEdit, onCancelEdit, onApplyEdit,
}: {
  variation: CreativeVariation;
  editing: boolean;
  editInstruction: string;
  applying: boolean;
  onEditInstructionChange: (value: string) => void;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onApplyEdit: () => void;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <img src={variation.imageUrl} alt={variation.layoutLabel} className="w-full object-cover" />
      <div className="space-y-2 p-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-foreground">{variation.layoutLabel}</span>
          {typeof variation.qualityScore === "number" && (
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${variation.qualityScore >= 70 ? "bg-success/10 text-success" : "bg-warning/10 text-warning"}`}>
              Quality {variation.qualityScore}
            </span>
          )}
        </div>
        {variation.qualityIssues && variation.qualityIssues.length > 0 && (
          <p className="text-[11px] text-muted-foreground">{variation.qualityIssues.slice(0, 2).join(" · ")}</p>
        )}
        {editing ? (
          <div className="flex items-center gap-1.5">
            <input
              value={editInstruction}
              onChange={e => onEditInstructionChange(e.target.value)}
              onKeyDown={e => e.key === "Enter" && onApplyEdit()}
              placeholder="e.g. Make the headline larger"
              autoFocus
              className="flex-1 rounded-lg border border-border bg-surface/60 px-2.5 py-1.5 text-xs text-foreground outline-none placeholder:text-muted-foreground focus:border-primary/40"
            />
            <button onClick={onApplyEdit} disabled={applying || !editInstruction.trim()} className="rounded-lg bg-primary px-2.5 py-1.5 text-xs font-semibold text-primary-foreground disabled:opacity-40">
              {applying ? <Loader2 size={12} className="animate-spin" /> : "Apply"}
            </button>
            <button onClick={onCancelEdit} className="text-muted-foreground hover:text-foreground">
              <X size={14} />
            </button>
          </div>
        ) : (
          <button onClick={onStartEdit} className="flex items-center gap-1.5 text-xs font-medium text-primary hover:underline">
            <Wand2 size={12} /> Edit with words
          </button>
        )}
      </div>
    </div>
  );
}
