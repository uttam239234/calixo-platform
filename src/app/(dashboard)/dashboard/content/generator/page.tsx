"use client";

import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import {
  Sparkles, Send, StopCircle, Copy, Download, Save, FileText,
  Library, Calendar, Image as ImageIcon, Clock, BarChart3,
  Lightbulb, Search, Shield, Eye, Target, TrendingUp, MousePointerClick,
  FileEdit, RefreshCw, X, ChevronDown, ChevronLeft, ChevronRight, Play,
  Hash, Globe, Users, Briefcase, MessageSquare, Settings,
  Wand2, Star, CheckCircle, AlertCircle, Loader2,
} from "lucide-react";
import { PromptEngine } from "@/core/ai/PromptEngine";
import { QualityEngine } from "@/core/ai/QualityEngine";
import { GenerationEngine } from "@/core/ai/GenerationEngine";
import { BrandContextService } from "@/core/ai/BrandContextService";
import { AudienceContextService } from "@/core/ai/AudienceContextService";
import type {
  GenerationRequest, GenerationResult, ContentTypeOption, ToneOption,
  LengthOption, ReadingLevelOption, CreativityOption, Platform,
} from "@/core/ai/types";
import type { PromptTemplate, PromptCategory } from "@/lib/prompt-templates";

// ============================================================================
// Constants
// ============================================================================

const CONTENT_TYPES: { value: ContentTypeOption; label: string; icon: React.ComponentType<{ size?: number; className?: string }> }[] = [
  { value: "blog-article", label: "Blog Article", icon: FileText },
  { value: "facebook-post", label: "Facebook Post", icon: Globe },
  { value: "instagram-caption", label: "Instagram Caption", icon: MessageSquare },
  { value: "linkedin-post", label: "LinkedIn Post", icon: Briefcase },
  { value: "x-post", label: "X Post", icon: MessageSquare },
  { value: "google-search-ad", label: "Google Search Ad", icon: Search },
  { value: "google-display-ad", label: "Google Display Ad", icon: Eye },
  { value: "meta-ad", label: "Meta Ad", icon: Globe },
  { value: "email", label: "Email", icon: Send },
  { value: "landing-page", label: "Landing Page", icon: MousePointerClick },
  { value: "product-description", label: "Product Description", icon: Hash },
  { value: "press-release", label: "Press Release", icon: FileText },
  { value: "video-script", label: "Video Script", icon: Play },
  { value: "cta", label: "CTA", icon: MousePointerClick },
  { value: "headline", label: "Headline", icon: Star },
];

const TONES: ToneOption[] = ["professional", "conversational", "persuasive", "authoritative", "friendly", "witty", "empathetic", "formal"];
const LENGTHS: LengthOption[] = ["short", "medium", "long", "comprehensive"];
const READING_LEVELS: ReadingLevelOption[] = ["elementary", "middle-school", "high-school", "college", "graduate", "expert"];
const CREATIVITY_LEVELS: CreativityOption[] = ["conservative", "balanced", "creative", "experimental"];
const MODELS = ["calixo-default", "gpt-4o", "claude-3-5"];
const LANGUAGES = ["English", "Spanish", "French", "German", "Portuguese", "Japanese", "Korean", "Chinese", "Arabic", "Hindi"];

const CATEGORY_LABELS: Record<PromptCategory, string> = {
  blog: "Blog", ads: "Ads", email: "Email", seo: "SEO",
  landing: "Landing Pages", sales: "Sales", social: "Social",
  announcement: "Announcements", product: "Product",
};

// ============================================================================
// Component
// ============================================================================

export default function GeneratorPage() {
  // Configuration state
  const [contentType, setContentType] = useState<ContentTypeOption>("blog-article");
  const [brand, setBrand] = useState("Calixo");
  const [audience, setAudience] = useState("Enterprise Marketers");
  const [campaign, setCampaign] = useState("Q3 Content Strategy");
  const [language, setLanguage] = useState("English");
  const [tone, setTone] = useState<ToneOption>("professional");
  const [length, setLength] = useState<LengthOption>("medium");
  const [readingLevel, setReadingLevel] = useState<ReadingLevelOption>("college");
  const [creativity, setCreativity] = useState<CreativityOption>("balanced");
  const [seoMode, setSeoMode] = useState(true);
  const [brandVoice, setBrandVoice] = useState(true);
  const [model, setModel] = useState("calixo-default");

  // Prompt state
  const [promptText, setPromptText] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<PromptTemplate | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const [templateCategory, setTemplateCategory] = useState<PromptCategory | "all">("all");

  // Generation state
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [editedContent, setEditedContent] = useState("");
  const [copied, setCopied] = useState(false);

  // UI state
  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [rightCollapsed, setRightCollapsed] = useState(false);

  // Build GenerationRequest from UI state
  const buildRequest = useCallback((): GenerationRequest => ({
    contentType,
    platform: "blog" as Platform,
    brand: BrandContextService.buildFromInput({ brandName: brand }),
    audience: AudienceContextService.buildFromInput({ audienceName: audience }),
    campaign,
    language,
    tone,
    length,
    readingLevel,
    creativity,
    seoMode,
    brandVoice,
    model,
    prompt: promptText,
    templateId: selectedTemplate?.id ?? null,
  }), [contentType, brand, audience, campaign, language, tone, length, readingLevel, creativity, seoMode, brandVoice, model, promptText, selectedTemplate]);

  // Computed estimates
  const estimateTokens = useMemo(() => {
    try { return GenerationEngine.estimateTokens(buildRequest()); } catch { return { input: 0, output: 0 }; }
  }, [buildRequest]);

  const estimateCost = useMemo(() => {
    try { return GenerationEngine.estimateCost(buildRequest()); } catch { return 0; }
  }, [buildRequest]);

  const promptQuality = useMemo(() => promptText.length > 0 ? QualityEngine.scorePrompt(promptText) : 0, [promptText]);

  const filteredTemplates = useMemo(() => {
    const all = PromptEngine.getAllTemplates();
    return templateCategory === "all" ? all : all.filter(t => t.category === templateCategory);
  }, [templateCategory]);

  // Handlers
  const handleGenerate = useCallback(async () => {
    setGenerating(true);
    setResult(null);
    try {
      const generated = await GenerationEngine.generate(buildRequest());
      setResult(generated);
      setEditedContent(generated.content);
    } finally {
      setGenerating(false);
    }
  }, [buildRequest]);

  const handleSelectTemplate = useCallback((tpl: PromptTemplate) => {
    setSelectedTemplate(tpl);
    setPromptText(tpl.prompt);
    setShowTemplates(false);
  }, []);

  const handleCopy = useCallback(async () => {
    const text = editedContent || result?.content || "";
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [editedContent, result]);

  const handleDownload = useCallback(() => {
    const text = editedContent || result?.content || "";
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `generated-content-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }, [editedContent, result]);

  // ============================================================================
  // Render helpers
  // ============================================================================

  const selectCls = "h-9 w-full rounded-xl border border-slate-700/60 bg-slate-900/70 px-3 text-xs text-slate-300 outline-none focus:border-cyan-500/50 appearance-none cursor-pointer";
  const labelCls = "text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1";

  return (
    <div className="h-[calc(100vh-10rem)] flex flex-col pb-4">
      {/* Top bar */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-shrink-0 flex items-center justify-between mb-3 pb-3 border-b border-slate-800/60"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/30 to-purple-500/30 border border-cyan-500/30">
            <Wand2 size={18} className="text-cyan-300" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white">AI Content Generator</h1>
            <p className="text-[11px] text-slate-400">Generate {CONTENT_TYPES.find(c => c.value === contentType)?.label} with {model}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setLeftCollapsed(v => !v)} className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-500 hover:text-slate-300" title="Toggle config panel">
            <ChevronLeft size={16} className={cn("transition-transform", leftCollapsed && "rotate-180")} />
          </button>
          <button onClick={() => setRightCollapsed(v => !v)} className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-500 hover:text-slate-300" title="Toggle assistant panel">
            <ChevronRight size={16} className={cn("transition-transform", rightCollapsed && "rotate-180")} />
          </button>
        </div>
      </motion.div>

      {/* Three-panel workspace */}
      <div className="flex-1 flex gap-4 min-h-0">
        {/* ====================================================================
            LEFT PANEL — Configuration
            ==================================================================== */}
        <AnimatePresence>
          {!leftCollapsed && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 280, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="flex-shrink-0 overflow-y-auto scrollbar-thin space-y-3 pr-1"
              style={{ minWidth: leftCollapsed ? 0 : 280, maxWidth: 280 }}
            >
              {/* Content Type */}
              <Card>
                <CardHeader title="Content Type" />
                <CardContent>
                  <select value={contentType} onChange={e => setContentType(e.target.value as ContentTypeOption)} className={selectCls}>
                    {CONTENT_TYPES.map(ct => <option key={ct.value} value={ct.value}>{ct.label}</option>)}
                  </select>
                </CardContent>
              </Card>

              {/* Brand & Audience */}
              <Card>
                <CardHeader title="Targeting" />
                <CardContent className="space-y-2.5">
                  <div><p className={labelCls}>Brand</p><input type="text" value={brand} onChange={e => setBrand(e.target.value)} className={selectCls} placeholder="Your brand name" /></div>
                  <div><p className={labelCls}>Audience</p><input type="text" value={audience} onChange={e => setAudience(e.target.value)} className={selectCls} placeholder="Target audience" /></div>
                  <div><p className={labelCls}>Campaign</p><input type="text" value={campaign} onChange={e => setCampaign(e.target.value)} className={selectCls} placeholder="Campaign name" /></div>
                </CardContent>
              </Card>

              {/* Language & Tone */}
              <Card>
                <CardHeader title="Style" />
                <CardContent className="space-y-2.5">
                  <div><p className={labelCls}>Language</p><select value={language} onChange={e => setLanguage(e.target.value)} className={selectCls}>{LANGUAGES.map(l => <option key={l}>{l}</option>)}</select></div>
                  <div><p className={labelCls}>Tone</p><div className="flex flex-wrap gap-1">{TONES.map(t => <button key={t} onClick={() => setTone(t)} className={cn("px-2 py-1 rounded-lg text-[10px] font-medium capitalize transition-all", tone === t ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30" : "text-slate-400 border border-transparent hover:bg-slate-800/50")}>{t}</button>)}</div></div>
                  <div><p className={labelCls}>Length</p><div className="flex flex-wrap gap-1">{LENGTHS.map(l => <button key={l} onClick={() => setLength(l)} className={cn("px-2 py-1 rounded-lg text-[10px] font-medium capitalize transition-all", length === l ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30" : "text-slate-400 border border-transparent hover:bg-slate-800/50")}>{l}</button>)}</div></div>
                  <div><p className={labelCls}>Reading Level</p><div className="flex flex-wrap gap-1">{READING_LEVELS.map(rl => <button key={rl} onClick={() => setReadingLevel(rl)} className={cn("px-2 py-1 rounded-lg text-[10px] font-medium capitalize transition-all", readingLevel === rl ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30" : "text-slate-400 border border-transparent hover:bg-slate-800/50")}>{rl.replace("-", " ")}</button>)}</div></div>
                </CardContent>
              </Card>

              {/* Advanced */}
              <Card>
                <CardHeader title="Advanced" />
                <CardContent className="space-y-3">
                  <div><p className={labelCls}>Creativity</p><div className="flex gap-1">{CREATIVITY_LEVELS.map(c => <button key={c} onClick={() => setCreativity(c)} className={cn("flex-1 px-1 py-1.5 rounded-lg text-[10px] font-medium capitalize transition-all", creativity === c ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30" : "text-slate-400 border border-transparent hover:bg-slate-800/50")}>{c}</button>)}</div></div>
                  <div><p className={labelCls}>Model</p><select value={model} onChange={e => setModel(e.target.value)} className={selectCls}>{MODELS.map(m => <option key={m}>{m}</option>)}</select></div>
                  <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={seoMode} onChange={e => setSeoMode(e.target.checked)} className="accent-cyan-500 rounded" /><span className="text-[11px] text-slate-400">SEO Mode</span></label>
                  <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={brandVoice} onChange={e => setBrandVoice(e.target.checked)} className="accent-cyan-500 rounded" /><span className="text-[11px] text-slate-400">Brand Voice</span></label>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ====================================================================
            CENTER PANEL — Workspace & Output
            ==================================================================== */}
        <div className="flex-1 flex flex-col min-w-0 gap-3 overflow-y-auto scrollbar-thin">
          {/* Prompt editor */}
          <Card>
            <CardHeader
              title="Prompt Editor"
              description={selectedTemplate ? `Template: ${selectedTemplate.name}` : "Write or select a prompt template"}
              action={
                <Button size="xs" variant="ghost" onClick={() => setShowTemplates(!showTemplates)} className="text-xs text-cyan-400 hover:text-cyan-300">
                  <FileText size={12} /> Templates
                </Button>
              }
            />
            <CardContent>
              {/* Template browser */}
              <AnimatePresence>
                {showTemplates && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden mb-3">
                    <div className="flex gap-1 mb-2 overflow-x-auto">
                      {(["all", "blog", "ads", "email", "seo", "landing", "social", "announcement", "product"] as const).map(cat => (
                        <button key={cat} onClick={() => setTemplateCategory(cat)} className={cn("shrink-0 px-2 py-1 rounded-lg text-[10px] font-medium capitalize", templateCategory === cat ? "bg-cyan-500/20 text-cyan-300" : "text-slate-400 hover:bg-slate-800/50")}>{cat === "all" ? "All" : CATEGORY_LABELS[cat]}</button>
                      ))}
                    </div>
                    <div className="grid gap-1.5 max-h-48 overflow-y-auto scrollbar-thin">
                      {filteredTemplates.map(tpl => (
                        <button key={tpl.id} onClick={() => handleSelectTemplate(tpl)} className={cn("text-left p-2 rounded-lg transition-colors", selectedTemplate?.id === tpl.id ? "bg-cyan-500/10 border border-cyan-500/20" : "hover:bg-slate-800/50 border border-transparent")}>
                          <p className="text-xs font-medium text-white">{tpl.name}</p>
                          <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">{tpl.description}</p>
                          <div className="flex items-center gap-2 mt-1 text-[9px] text-slate-600"><span>{tpl.tone}</span><span>~{tpl.estimatedTokens} tokens</span></div>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <textarea
                value={promptText}
                onChange={e => setPromptText(e.target.value)}
                placeholder="Describe what you want to generate...\n\nUse [BRACKETS] for variables that will be filled automatically.\n\nExample: Write a blog article about [AI Marketing Strategies] for [Enterprise CMOs]..."
                className="w-full h-32 rounded-xl border border-slate-700/60 bg-slate-900/70 p-3 text-sm text-slate-200 outline-none focus:border-cyan-500/50 resize-none scrollbar-thin placeholder:text-slate-600"
              />

              {/* Prompt stats */}
              <div className="flex items-center gap-4 mt-2 text-[10px] text-slate-500">
                <span>{promptText.length} chars</span>
                <span>~{estimateTokens.input + estimateTokens.output} tokens</span>
                <span>${estimateCost.toFixed(4)} est.</span>
                {promptText.length > 0 && <span className={cn(promptQuality > 60 ? "text-emerald-400" : promptQuality > 30 ? "text-amber-400" : "text-slate-500")}>Quality: {promptQuality}/100</span>}
              </div>

              {/* Generate / Stop buttons */}
              <div className="flex items-center gap-2 mt-3">
                {!generating ? (
                  <Button onClick={handleGenerate} className="gap-2" disabled={promptText.length < 10}>
                    <Sparkles size={14} /> Generate Content
                  </Button>
                ) : (
                  <Button variant="outline" className="gap-2 border-slate-700 text-slate-300" onClick={() => setGenerating(false)}>
                    <StopCircle size={14} /> Stop
                  </Button>
                )}
                {selectedTemplate && (
                  <button onClick={() => { setSelectedTemplate(null); setPromptText(""); }} className="text-xs text-slate-500 hover:text-slate-300">Clear template</button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Generation progress */}
          {generating && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3 p-4 rounded-xl bg-cyan-500/5 border border-cyan-500/20">
              <Loader2 size={18} className="text-cyan-400 animate-spin" />
              <div>
                <p className="text-sm font-medium text-white">Generating {CONTENT_TYPES.find(c => c.value === contentType)?.label}...</p>
                <p className="text-[11px] text-slate-500">Using {model} • {tone} tone • {length} length</p>
              </div>
            </motion.div>
          )}

          {/* Output */}
          <AnimatePresence>
            {result && !generating && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-white">Generated Content</p>
                    <div className="flex items-center gap-3 mt-0.5 text-[10px] text-slate-500">
                      <span>{result.metadata.wordCount} words</span>
                      <span>{result.metadata.tokensUsed} tokens</span>
                      <span>${result.metadata.cost.toFixed(4)}</span>
                      <span>{result.metadata.generationTimeMs}ms</span>
                    </div>
                  </div>
                  <Button size="xs" variant="ghost" onClick={handleGenerate} className="text-slate-400 hover:text-slate-200 gap-1"><RefreshCw size={12} /> Regenerate</Button>
                </div>

                <textarea
                  value={editedContent}
                  onChange={e => setEditedContent(e.target.value)}
                  className="w-full h-96 rounded-xl border border-slate-700/60 bg-slate-900/70 p-4 text-sm text-slate-200 outline-none focus:border-cyan-500/50 resize-y scrollbar-thin font-mono leading-relaxed"
                />

                <div className="flex flex-wrap items-center gap-2">
                  <Button size="sm" onClick={handleCopy} className="gap-1.5">{copied ? <CheckCircle size={13} /> : <Copy size={13} />} {copied ? "Copied!" : "Copy"}</Button>
                  <Button size="sm" variant="outline" onClick={handleDownload} className="gap-1.5 border-slate-700 bg-slate-900/70 text-slate-300 hover:bg-slate-800"><Download size={13} /> Download</Button>
                  <Button size="sm" variant="outline" className="gap-1.5 border-slate-700 bg-slate-900/70 text-slate-300 hover:bg-slate-800"><Save size={13} /> Save</Button>
                  <Button size="sm" variant="outline" className="gap-1.5 border-slate-700 bg-slate-900/70 text-slate-300 hover:bg-slate-800"><FileText size={13} /> Save as Template</Button>
                  <Button size="sm" variant="outline" className="gap-1.5 border-slate-700 bg-slate-900/70 text-slate-300 hover:bg-slate-800"><FileEdit size={13} /> Send to Editor</Button>
                  <Button size="sm" variant="outline" className="gap-1.5 border-slate-700 bg-slate-900/70 text-slate-300 hover:bg-slate-800"><Library size={13} /> Send to Library</Button>
                  <Button size="sm" variant="outline" className="gap-1.5 border-slate-700 bg-slate-900/70 text-slate-300 hover:bg-slate-800"><Calendar size={13} /> Schedule</Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Empty state */}
          {!result && !generating && (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border border-cyan-500/20 mx-auto">
                  <Wand2 size={28} className="text-cyan-300" />
                </div>
                <h3 className="text-lg font-semibold text-white mt-4">Ready to Generate</h3>
                <p className="text-sm text-slate-400 mt-1 max-w-md">
                  Configure your content type, write a prompt or select a template, and click Generate to create AI-powered content.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ====================================================================
            RIGHT PANEL — AI Assistant
            ==================================================================== */}
        <AnimatePresence>
          {!rightCollapsed && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 280, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="flex-shrink-0 overflow-y-auto scrollbar-thin space-y-3 pl-1"
              style={{ minWidth: rightCollapsed ? 0 : 280, maxWidth: 280 }}
            >
              <Card>
                <CardHeader title="Prompt Quality" />
                <CardContent>
                  <div className="flex items-center gap-2 mb-2">
                    <div className={cn("text-2xl font-bold", promptQuality > 60 ? "text-emerald-400" : promptQuality > 30 ? "text-amber-400" : "text-slate-400")}>{promptQuality}</div>
                    <span className="text-xs text-slate-500">/100</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden"><div className={cn("h-full rounded-full", promptQuality > 60 ? "bg-emerald-500" : promptQuality > 30 ? "bg-amber-500" : "bg-slate-500")} style={{ width: `${promptQuality}%` }} /></div>
                  <div className="space-y-1.5 mt-3 text-[10px] text-slate-400">
                    {promptText.length < 10 && <p className="text-slate-500">• Start writing a prompt to see quality score</p>}
                    {promptText.length > 10 && promptText.length < 50 && <p className="text-amber-400">• Try to be more specific — add context and instructions</p>}
                    {promptText.length > 50 && !/\[.*?\]/.test(promptText) && <p className="text-slate-400">• Add [VARIABLES] for dynamic content</p>}
                    {promptText.length > 50 && /\[.*?\]/.test(promptText) && <p className="text-emerald-400">• Good use of template variables</p>}
                    {promptText.length > 100 && <p className="text-emerald-400">• Detailed prompt — better results expected</p>}
                  </div>
                </CardContent>
              </Card>

              {result && (
                <>
                  <Card>
                    <CardHeader title="Content Scores" />
                    <CardContent className="space-y-2.5">
                      {[
                        { label: "Readability", score: result.quality.readabilityScore, icon: Eye },
                        { label: "SEO Score", score: result.quality.seoScore, icon: Search },
                        { label: "Brand Voice", score: result.quality.brandCompliance, icon: Shield },
                        { label: "Overall Score", score: result.quality.contentScore, icon: Star },
                      ].map(m => (
                        <div key={m.label}>
                          <div className="flex items-center justify-between text-[10px] mb-0.5"><span className="text-slate-400">{m.label}</span><span className={cn("font-semibold", m.score > 80 ? "text-emerald-400" : m.score > 60 ? "text-amber-400" : "text-red-400")}>{m.score}/100</span></div>
                          <div className="h-1 rounded-full bg-slate-800 overflow-hidden"><div className={cn("h-full rounded-full", m.score > 80 ? "bg-emerald-500" : m.score > 60 ? "bg-amber-500" : "bg-red-500")} style={{ width: `${m.score}%` }} /></div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader title="Predicted Performance" />
                    <CardContent className="space-y-2.5">
                      <div className="flex items-center justify-between"><span className="text-[11px] text-slate-400 flex items-center gap-1.5"><TrendingUp size={12} /> Engagement</span><span className="text-xs font-semibold text-emerald-400">{result.quality.estimatedEngagement}%</span></div>
                      <div className="flex items-center justify-between"><span className="text-[11px] text-slate-400 flex items-center gap-1.5"><MousePointerClick size={12} /> Est. CTR</span><span className="text-xs font-semibold text-cyan-400">{result.quality.estimatedCTR}%</span></div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader title="AI Recommendations" description={`${result.suggestions.length} suggestions`} />
                    <CardContent>
                      <div className="space-y-2">
                        {result.suggestions.map((s, i) => (
                          <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-slate-800/20 border border-slate-700/30">
                            <Lightbulb size={12} className="text-amber-400 mt-0.5 flex-shrink-0" />
                            <p className="text-[10px] text-slate-400">{s}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}

              {selectedTemplate && (
                <Card>
                  <CardHeader title="Selected Template" />
                  <CardContent>
                    <p className="text-xs font-medium text-white">{selectedTemplate.name}</p>
                    <p className="text-[10px] text-slate-500 mt-1">{selectedTemplate.description}</p>
                    <div className="flex items-center gap-2 mt-2 text-[9px] text-slate-600"><span>{selectedTemplate.tone}</span><span>~{selectedTemplate.estimatedTokens} tokens</span></div>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}