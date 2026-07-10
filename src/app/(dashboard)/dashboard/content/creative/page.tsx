"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Download, Globe2, History, Save, Send, Share2, Sparkles } from "lucide-react";
import { ContentStudioHeader } from "@/components/content/ContentStudioHeader";
import { BriefChipsForm } from "@/components/content/BriefChipsForm";
import { AdvancedModePanel } from "@/components/content/AdvancedModePanel";
import { MyCreationsPanel } from "@/components/content/MyCreationsPanel";
import { useContentStudio } from "@/features/content/ContentStudioProvider";
import type { CreativeOutputCatalogEntry, GenerationHistoryEntry } from "@/core/content";
import type { ToneOption } from "@/core/ai/types";

type Stage = "gallery" | "brief" | "result";
const LANGUAGES = ["Spanish", "French", "German", "Hindi", "Portuguese", "Arabic"];

export default function CreativeDesignStudioPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { mode, creativeCatalog, brandStyleDefaults, generateCreative, saveToAssets, submitForApproval, localize, canApprove } = useContentStudio();

  const [stage, setStage] = useState<Stage>("gallery");
  const [showHistory, setShowHistory] = useState(false);
  const [selected, setSelected] = useState<CreativeOutputCatalogEntry | null>(null);
  const [objective, setObjective] = useState("");
  const [audienceName, setAudienceName] = useState("Prospective students");
  const [tone, setTone] = useState<ToneOption>("professional");
  const [cta, setCta] = useState("Learn More");
  const [campaignId, setCampaignId] = useState<string | undefined>(undefined);
  const [strictBrandRules, setStrictBrandRules] = useState(false);
  const [abMode, setAbMode] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<GenerationHistoryEntry | null>(null);
  const [localizeLanguage, setLocalizeLanguage] = useState(LANGUAGES[0]);

  useEffect(() => {
    (async () => {
      if (searchParams.get("panel") === "history") setShowHistory(true);
      const outputId = searchParams.get("output");
      if (outputId) {
        const entry = creativeCatalog.find(c => c.id === outputId);
        if (entry) {
          setSelected(entry);
          setStage("brief");
        }
      }
    })();
  }, [searchParams, creativeCatalog]);

  const grouped = useMemo(() => {
    const groups = new Map<string, CreativeOutputCatalogEntry[]>();
    for (const entry of creativeCatalog) {
      const list = groups.get(entry.group) ?? [];
      list.push(entry);
      groups.set(entry.group, list);
    }
    return groups;
  }, [creativeCatalog]);

  async function handleGenerate() {
    if (!selected) return;
    setGenerating(true);
    const entry = await generateCreative(
      { objective, audienceName, tone, cta, language: "English", brandStyleId: brandStyleDefaults?.id, campaignId, strictBrandRules },
      selected.id
    );
    setGenerating(false);
    if (entry) {
      setResult(entry);
      setStage("result");
    }
  }

  function reset() {
    setStage("gallery");
    setSelected(null);
    setResult(null);
    setObjective("");
    router.replace("/dashboard/content/creative");
  }

  function openHistoryEntry(entry: GenerationHistoryEntry) {
    setResult(entry);
    setStage("result");
    setShowHistory(false);
  }

  return (
    <div>
      <ContentStudioHeader title="Creative Design Studio" description="Generate on-brand visual creatives for any platform — dimensions are handled automatically." />

      <div className="mb-4 flex justify-center">
        <button
          onClick={() => setShowHistory(v => !v)}
          className="flex items-center gap-2 rounded-lg border border-border bg-surface/60 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
        >
          <History size={13} /> {showHistory ? "Back to Studio" : "My Creations"}
        </button>
      </div>

      {showHistory ? (
        <MyCreationsPanel kind="creative" onSelect={openHistoryEntry} />
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
                  kind="creative"
                  campaignId={campaignId}
                  onCampaignChange={setCampaignId}
                  strictBrandRules={strictBrandRules}
                  onStrictBrandRulesChange={setStrictBrandRules}
                  abMode={abMode}
                  onAbModeChange={setAbMode}
                />
              )}
            </div>
          )}

          {stage === "result" && result && (
            <div className="mx-auto max-w-3xl space-y-6">
              <button onClick={reset} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
                <ArrowLeft size={14} /> Create another
              </button>

              <div>
                <p className="mb-2 text-sm font-semibold text-foreground">{abMode ? "Version A" : "Primary Design"}</p>
                {result.primaryImageUrl && <img src={result.primaryImageUrl} alt={result.outputLabel} className="w-full rounded-2xl border border-border object-cover" />}
              </div>

              {abMode && result.variantImageUrls && result.variantImageUrls[0] && (
                <div>
                  <p className="mb-2 text-sm font-semibold text-foreground">Version B</p>
                  <img src={result.variantImageUrls[0]} alt="Version B" className="w-full rounded-2xl border border-border object-cover" />
                </div>
              )}

              {!abMode && result.variantImageUrls && result.variantImageUrls.length > 0 && (
                <div>
                  <p className="mb-2 text-sm font-semibold text-foreground">Variants</p>
                  <div className="grid grid-cols-2 gap-3">
                    {result.variantImageUrls.map((url, i) => (
                      <img key={url} src={url} alt={`Variant ${i + 1}`} className="w-full rounded-xl border border-border object-cover" />
                    ))}
                  </div>
                </div>
              )}

              {result.platformVersions && result.platformVersions.length > 0 && (
                <div>
                  <p className="mb-2 text-sm font-semibold text-foreground">Platform Versions</p>
                  <div className="grid grid-cols-2 gap-3">
                    {result.platformVersions.map(pv => (
                      <div key={pv.platform}>
                        <img src={pv.imageUrl} alt={pv.platform} className="w-full rounded-xl border border-border object-cover" />
                        <p className="mt-1 text-center text-xs text-muted-foreground">{pv.platform}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {result.localizedVersions && result.localizedVersions.length > 0 && (
                <div>
                  <p className="mb-2 text-sm font-semibold text-foreground">Localized Versions</p>
                  {result.localizedVersions.map(lv => (
                    <p key={lv.language} className="mb-1 rounded-xl border border-border bg-surface/40 px-3 py-2 text-xs text-muted-foreground">
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
                    Localize
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
