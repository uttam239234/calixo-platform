"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Download, Expand, Globe2, History, Save, Send, Share2, Shrink, Sparkles, TrendingUp, Wand2 } from "lucide-react";
import { ContentStudioHeader } from "@/components/content/ContentStudioHeader";
import { BriefChipsForm } from "@/components/content/BriefChipsForm";
import { AdvancedModePanel } from "@/components/content/AdvancedModePanel";
import { MyCreationsPanel } from "@/components/content/MyCreationsPanel";
import { useContentStudio } from "@/features/content/ContentStudioProvider";
import type { ContentAction, ContentOutputCatalogEntry, GenerationHistoryEntry } from "@/core/content";
import type { ToneOption } from "@/core/ai/types";

type Stage = "gallery" | "brief" | "result";
type ResultView = "primary" | "short" | "long";
const LANGUAGES = ["Spanish", "French", "German", "Hindi", "Portuguese", "Arabic"];

const ACTIONS: { id: ContentAction; label: string; icon: typeof Wand2 }[] = [
  { id: "rewrite", label: "Rewrite", icon: Wand2 },
  { id: "shorten", label: "Shorten", icon: Shrink },
  { id: "expand", label: "Expand", icon: Expand },
  { id: "improve-readability", label: "Improve Readability", icon: Sparkles },
  { id: "improve-engagement", label: "Improve Engagement", icon: TrendingUp },
  { id: "improve-seo", label: "Improve SEO", icon: TrendingUp },
];

export default function ContentCreationStudioPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { mode, contentCatalog, brandStyleDefaults, generateContent, applyAction, saveToAssets, submitForApproval, localize, canApprove } = useContentStudio();

  const [stage, setStage] = useState<Stage>("gallery");
  const [showHistory, setShowHistory] = useState(false);
  const [selected, setSelected] = useState<ContentOutputCatalogEntry | null>(null);
  const [objective, setObjective] = useState("");
  const [audienceName, setAudienceName] = useState("Prospective students");
  const [tone, setTone] = useState<ToneOption>("professional");
  const [cta, setCta] = useState("Learn More");
  const [campaignId, setCampaignId] = useState<string | undefined>(undefined);
  const [strictBrandRules, setStrictBrandRules] = useState(false);
  const [abMode, setAbMode] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [applyingAction, setApplyingAction] = useState<ContentAction | null>(null);
  const [result, setResult] = useState<GenerationHistoryEntry | null>(null);
  const [view, setView] = useState<ResultView>("primary");
  const [localizeLanguage, setLocalizeLanguage] = useState(LANGUAGES[0]);
  const [editedText, setEditedText] = useState("");

  useEffect(() => {
    (async () => {
      if (searchParams.get("panel") === "history") setShowHistory(true);
      const outputId = searchParams.get("output");
      if (outputId) {
        const entry = contentCatalog.find(c => c.id === outputId);
        if (entry) {
          setSelected(entry);
          setStage("brief");
        }
      }
    })();
  }, [searchParams, contentCatalog]);

  const grouped = useMemo(() => {
    const groups = new Map<string, ContentOutputCatalogEntry[]>();
    for (const entry of contentCatalog) {
      const list = groups.get(entry.group) ?? [];
      list.push(entry);
      groups.set(entry.group, list);
    }
    return groups;
  }, [contentCatalog]);

  useEffect(() => {
    (async () => {
      setView("primary");
      setEditedText(result?.primaryText ?? "");
    })();
  }, [result]);

  async function handleGenerate() {
    if (!selected) return;
    setGenerating(true);
    const entry = await generateContent(
      { objective, audienceName, tone, cta, language: "English", brandStyleId: brandStyleDefaults?.id, campaignId, strictBrandRules },
      selected.id
    );
    setGenerating(false);
    if (entry) {
      setResult(entry);
      setStage("result");
    }
  }

  async function handleAction(action: ContentAction) {
    if (!result) return;
    setApplyingAction(action);
    const updated = await applyAction(result.id, action);
    setApplyingAction(null);
    if (updated) setResult({ ...updated });
  }

  function reset() {
    setStage("gallery");
    setSelected(null);
    setResult(null);
    setObjective("");
    router.replace("/dashboard/content/create");
  }

  function openHistoryEntry(entry: GenerationHistoryEntry) {
    setResult(entry);
    setStage("result");
    setShowHistory(false);
  }

  const displayedText = view === "short" ? result?.shortText : view === "long" ? result?.longText : editedText;

  return (
    <div>
      <ContentStudioHeader title="Content Creation Studio" description="Generate captions, copy, and long-form content — with real rewrite, shorten, and SEO actions." />

      <div className="mb-4 flex justify-center">
        <button
          onClick={() => setShowHistory(v => !v)}
          className="flex items-center gap-2 rounded-lg border border-border bg-surface/60 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
        >
          <History size={13} /> {showHistory ? "Back to Studio" : "My Creations"}
        </button>
      </div>

      {showHistory ? (
        <MyCreationsPanel kind="content" onSelect={openHistoryEntry} />
      ) : (
        <>
          {stage === "gallery" && (
            <div className="mx-auto max-w-4xl space-y-8">
              {[...grouped.entries()].map(([group, entries]) => (
                <div key={group}>
                  <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">{group}</h2>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                    {entries.map(entry => (
                      <button
                        key={entry.id}
                        onClick={() => {
                          setSelected(entry);
                          setStage("brief");
                        }}
                        className="flex flex-col items-start gap-2 rounded-2xl border border-border bg-card p-4 text-left transition-colors hover:border-primary/40 hover:bg-surface/40"
                      >
                        <Sparkles size={18} className="text-primary" />
                        <span className="text-sm font-semibold text-foreground">{entry.label}</span>
                        <span className="text-xs text-muted-foreground">{entry.description}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {stage === "brief" && selected && (
            <div className="space-y-4">
              <button onClick={reset} className="mx-auto flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
                <ArrowLeft size={14} /> Choose a different output
              </button>
              <p className="text-center text-sm font-medium text-foreground">Creating: {selected.label}</p>
              <BriefChipsForm
                objective={objective}
                onObjectiveChange={setObjective}
                audienceName={audienceName}
                onAudienceChange={setAudienceName}
                tone={tone}
                onToneChange={setTone}
                cta={cta}
                onCtaChange={setCta}
                brandStyleDefaults={brandStyleDefaults}
                generating={generating}
                onGenerate={handleGenerate}
                generateLabel={`Generate ${selected.label}`}
              />
              {mode === "advanced" && (
                <AdvancedModePanel
                  kind="content"
                  campaignId={campaignId}
                  onCampaignChange={setCampaignId}
                  strictBrandRules={strictBrandRules}
                  onStrictBrandRulesChange={setStrictBrandRules}
                  abMode={abMode}
                  onAbModeChange={setAbMode}
                  onSelectTemplate={setObjective}
                />
              )}
            </div>
          )}

          {stage === "result" && result && (
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

              {abMode && result.textVariants && result.textVariants[0] && (
                <div>
                  <p className="mb-1.5 text-sm font-semibold text-foreground">Version B</p>
                  <div className="whitespace-pre-wrap rounded-2xl border border-border bg-surface/40 p-4 text-sm text-muted-foreground">{result.textVariants[0]}</div>
                </div>
              )}

              {!abMode && result.textVariants && result.textVariants.length > 0 && (
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
                  onClick={() => saveToAssets(result.id)}
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
                {mode === "advanced" && canApprove && (
                  <button
                    onClick={() => submitForApproval(result.id)}
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

              {mode === "advanced" && (
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
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
