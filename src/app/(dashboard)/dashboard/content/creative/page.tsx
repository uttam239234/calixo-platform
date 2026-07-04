"use client";

import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import {
  Palette, Wand2, Save, Copy, Download, FileJson, Library, ChevronLeft, ChevronRight,
  Eye, Shield, TrendingUp, MousePointerClick, CheckCircle, AlertTriangle, X,
  Layers, Grid, Ruler, Type, Image as ImageIcon, Layout, RefreshCw, Send, Sparkles,
  Globe, Hash, BarChart3, Zap, Loader2, ZoomIn, Maximize, Clock, DollarSign, Cpu,
  History, ChevronDown, ChevronUp, ExternalLink,
} from "lucide-react";
import { CreativeEngine } from "@/core/creative/CreativeEngine";
import { PlatformKnowledgeService } from "@/core/creative/PlatformKnowledgeService";
import { CreativeTypeService } from "@/core/creative/CreativeTypeService";
import { LayoutEngine } from "@/core/creative/LayoutEngine";
import { DesignSystemEngine } from "@/core/creative/DesignSystemEngine";
import { CreativeValidator } from "@/core/creative/CreativeValidator";
import { MediaGenerationEngine } from "@/core/media/MediaGenerationEngine";
import { MediaProviderRegistry } from "@/core/media/MediaProviderRegistry";
import { MediaHistoryService } from "@/core/media/MediaHistoryService";
import { MediaCapabilityService } from "@/core/media/MediaCapabilityService";
import { AssetEngine } from "@/core/assets/AssetEngine";
import type {
  CreativePlatform, CreativeType, CreativeRequest, CreativeResult, PlatformKnowledge, LayoutSection, LayoutElement,
} from "@/core/creative/types";
import type { MediaResponse } from "@/core/media/types";

// ============================================================================
// Constants
// ============================================================================

const PLATFORMS: CreativePlatform[] = PlatformKnowledgeService.getAllPlatforms();
const ALL_CREATIVE_TYPES = CreativeTypeService.getAll();
const CREATIVE_TYPES: { value: CreativeType; label: string }[] = ALL_CREATIVE_TYPES.map(t => ({ value: t.type, label: t.displayName }));

const VISUAL_STYLES = ["modern", "corporate", "creative", "playful", "luxury", "tech"];
const LANGUAGES = ["English", "Spanish", "French", "German", "Portuguese", "Japanese", "Korean", "Chinese", "Arabic", "Hindi"];
const REGIONS = ["Global", "North America", "Europe", "Asia Pacific", "Latin America", "Middle East", "Africa"];
const AUDIENCES = ["Enterprise Marketers", "Small Business Owners", "E-Commerce Managers", "Agency Leads", "Content Creators", "B2B Decision Makers", "Gen Z Consumers"];
const BRANDS = ["Calixo", "Acme Corp", "TechVentures", "NexGen Media", "Stratosphere Digital"];
const COLOUR_PRESETS: Record<string, string[]> = {
  "Ocean": ["#06B6D4", "#0EA5E9", "#0284C7", "#075985", "#0C4A6E"],
  "Forest": ["#10B981", "#34D399", "#059669", "#047857", "#064E3B"],
  "Sunset": ["#F59E0B", "#F97316", "#EF4444", "#DC2626", "#7C2D12"],
  "Purple Haze": ["#8B5CF6", "#A78BFA", "#7C3AED", "#5B21B6", "#4C1D95"],
  "Midnight": ["#1E293B", "#334155", "#475569", "#64748B", "#94A3B8"],
  "Corporate Blue": ["#2563EB", "#3B82F6", "#1D4ED8", "#1E40AF", "#172554"],
  "Vibrant": ["#EC4899", "#F43F5E", "#D946EF", "#A21CAF", "#86198F"],
  "Minimal Gray": ["#F8FAFC", "#E2E8F0", "#CBD5E1", "#64748B", "#1E293B"],
};
const TYPOGRAPHY_PRESETS = ["Modern Sans", "Classic Serif", "Geometric", "Humanist", "Display Bold", "Mono Tech", "Elegant Script"];
const CREATIVE_STYLES = ["Minimalist", "Bold & Vibrant", "Corporate Clean", "Dark Mode", "Gradient Rich", "Photography-First", "Illustration-Led", "Data-Driven", "Luxury Premium", "Playful & Fun", "Geometric", "Retro/Vintage", "3D Render Style", "Flat Vector", "Glassmorphism"];
const CTA_STYLES = ["Rounded Button", "Pill Button", "Ghost Link", "Solid Block", "Arrow CTA", "Underlined Text"];

const BG_PREFERENCES = ["Gradient", "Solid Color", "Image/Photo", "Pattern/Texture", "Video Thumbnail", "Transparent"];
const IMAGE_STYLES = ["Photography", "3D Render", "Flat Illustration", "Isometric", "Abstract Gradient", "Collage", "Line Art", "Duotone"];
const ASPECT_RATIOS = ["1:1 (Square)", "4:5 (Portrait)", "9:16 (Story)", "16:9 (Landscape)", "2:1 (Panorama)", "3:2 (Standard)"];

const selectCls = "h-9 w-full rounded-xl border border-slate-700/60 bg-slate-900/70 px-3 text-xs text-slate-300 outline-none focus:border-cyan-500/50 appearance-none cursor-pointer";
const labelCls = "text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1";
const chipCls = (active: boolean) => cn("px-2 py-1 rounded-lg text-[10px] font-medium capitalize transition-all", active ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30" : "text-slate-400 border border-transparent hover:bg-slate-800/50");

// ============================================================================
// Component
// ============================================================================

export default function CreativeComposerPage() {
  // Config state
  const [campaign, setCampaign] = useState("Q4 Product Launch");
  const [goal, setGoal] = useState("awareness");
  const [platform, setPlatform] = useState<CreativePlatform>("instagram");
  const [creativeType, setCreativeType] = useState<CreativeType>("social-post");
  const [brand, setBrand] = useState("Calixo");
  const [audience, setAudience] = useState("Enterprise Marketers");
  const [region, setRegion] = useState("Global");
  const [language, setLanguage] = useState("English");
  const [visualStyle, setVisualStyle] = useState("modern");
  const [colourPreset, setColourPreset] = useState("Ocean");
  const [typography, setTypography] = useState("Modern Sans");
  const [logoUsage, setLogoUsage] = useState(true);
  const [ctaStyle, setCtaStyle] = useState("Rounded Button");
  const [bgPreference, setBgPreference] = useState("Gradient");
  const [imageStyle, setImageStyle] = useState("Photography");
  const [aspectRatio, setAspectRatio] = useState("1:1 (Square)");

  // UI state
  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [rightCollapsed, setRightCollapsed] = useState(false);
  const [result, setResult] = useState<CreativeResult | null>(null);
  const [platformInfo, setPlatformInfo] = useState<PlatformKnowledge | null>(null);
  const [showGrid, setShowGrid] = useState(false);
  const [showSafeAreas, setShowSafeAreas] = useState(true);

  // Image generation state
  const [generating, setGenerating] = useState(false);
  const [genProvider, setGenProvider] = useState("mock-media");
  const [genResponse, setGenResponse] = useState<MediaResponse | null>(null);
  const [genVariations, setGenVariations] = useState<MediaResponse[]>([]);
  const [selectedVariation, setSelectedVariation] = useState<number>(-1);
  const [showMetadata, setShowMetadata] = useState(false);
  const [zoomLevel, setZoomLevel] = useState<"fit" | "actual">("fit");
  const [history, setHistory] = useState(MediaHistoryService.getAll().slice(0, 10));

  // Providers
  const providers = useMemo(() => MediaProviderRegistry.listIds(), []);
  const providerCap = useMemo(() => MediaCapabilityService.get(genProvider), [genProvider]);

  // Build request
  const buildRequest = useCallback((): CreativeRequest => ({
    platform,
    creativeType,
    campaign,
    brand: { name: brand, colors: COLOUR_PRESETS[colourPreset] ?? COLOUR_PRESETS["Ocean"], fonts: [typography] },
    audience,
    visualStyle,
    colorPalette: COLOUR_PRESETS[colourPreset] ?? COLOUR_PRESETS["Ocean"],
    message: `${campaign} - Engaging ${creativeType.replace("-", " ")} for ${platform} targeting ${audience}`,
    cta: goal === "awareness" ? "Learn More" : goal === "conversion" ? "Get Started" : "Sign Up Now",
    includeLogo: logoUsage, includeBrandColors: true,
  }), [platform, creativeType, campaign, brand, audience, visualStyle, colourPreset, goal, logoUsage]);

  // Handlers
  const handleGenerate = useCallback(() => {
    const req = buildRequest();
    const res = CreativeEngine.generate(req);
    setResult(res);
    setPlatformInfo(PlatformKnowledgeService.get(platform));
    setGenResponse(null); setGenVariations([]);
  }, [buildRequest, platform]);

  const handleGenerateImage = useCallback(async () => {
    if (!result) return;
    setGenerating(true);
    setGenResponse(null);
    try {
      const p = PlatformKnowledgeService.get(platform);
      const dims = p.recommendedDimensions[0];
      const resp = await MediaGenerationEngine.generateImage({
        action: "generate", mediaType: "image",
        prompt: result.prompt.prompt,
        dimensions: { width: dims.width, height: dims.height },
        quality: "hd", style: visualStyle, outputFormat: "png",
        brand: { name: brand, colors: COLOUR_PRESETS[colourPreset], voice: visualStyle },
        platform, creativeType, campaign,
      });
      setGenResponse(resp);
      setHistory(MediaHistoryService.getAll().slice(0, 10));
    } finally { setGenerating(false); }
  }, [result, platform, visualStyle, brand, colourPreset, creativeType, campaign]);

  const handleGenerateVariations = useCallback(async () => {
    if (!result) return;
    setGenerating(true); setGenVariations([]);
    try {
      const p = PlatformKnowledgeService.get(platform); const dims = p.recommendedDimensions[0];
      const variations = await Promise.all(Array.from({ length: 4 }, () =>
        MediaGenerationEngine.generateImage({
          action: "generate", mediaType: "image", prompt: result.prompt.prompt,
          dimensions: { width: dims.width, height: dims.height },
          quality: "hd", style: visualStyle, outputFormat: "png",
          brand: { name: brand, colors: COLOUR_PRESETS[colourPreset], voice: visualStyle },
          platform, creativeType, campaign, seed: Math.floor(Math.random() * 99999),
        })
      ));
      setGenVariations(variations);
      setHistory(MediaHistoryService.getAll().slice(0, 10));
    } finally { setGenerating(false); }
  }, [result, platform, visualStyle, brand, colourPreset, creativeType, campaign]);

  const handleRegenerate = useCallback(() => handleGenerateImage(), [handleGenerateImage]);

  const handleCopyJSON = useCallback(() => { if (!result) return; navigator.clipboard.writeText(JSON.stringify(result, null, 2)); }, [result]);
  const handleDownloadJSON = useCallback(() => {
    if (!result) return;
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: "application/json" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `creative-${result.creativeType}-${Date.now()}.json`; a.click();
  }, [result]);

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <div className="h-[calc(100vh-10rem)] flex flex-col pb-4">
      {/* Top bar */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex-shrink-0 flex items-center justify-between mb-3 pb-3 border-b border-slate-800/60">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500/30 to-pink-500/30 border border-purple-500/30"><Palette size={18} className="text-purple-300" /></div>
          <div><h1 className="text-base font-bold text-white">Creative Composer</h1><p className="text-[11px] text-slate-400">{platformInfo?.displayName ?? platform} • {creativeType.replace("-", " ")}</p></div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setLeftCollapsed(v => !v)} className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-500"><ChevronLeft size={16} className={cn(leftCollapsed && "rotate-180")} /></button>
          <button onClick={() => setRightCollapsed(v => !v)} className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-500"><ChevronRight size={16} className={cn(rightCollapsed && "rotate-180")} /></button>
          {result && (
            <div className="flex items-center gap-1 ml-2">
              <Button size="xs" variant="ghost" onClick={handleCopyJSON} className="text-slate-400 text-xs"><Copy size={12} /></Button>
              <Button size="xs" variant="ghost" onClick={handleDownloadJSON} className="text-slate-400 text-xs"><Download size={12} /></Button>
              <Button size="xs" variant="ghost" className="text-slate-400 text-xs"><Save size={12} /></Button>
            </div>
          )}
        </div>
      </motion.div>

      <div className="flex-1 flex gap-4 min-h-0">
        {/* LEFT PANEL */}
        <AnimatePresence>
          {!leftCollapsed && (
            <motion.div initial={{ width: 0, opacity: 0 }} animate={{ width: 300, opacity: 1 }} exit={{ width: 0, opacity: 0 }} className="flex-shrink-0 overflow-y-auto scrollbar-thin space-y-3 pr-1" style={{ minWidth: 0, maxWidth: 300 }}>
              <Card><CardHeader title="Campaign" /><CardContent className="space-y-2"><div><p className={labelCls}>Name</p><input type="text" value={campaign} onChange={e => setCampaign(e.target.value)} className={selectCls} /></div><div><p className={labelCls}>Goal</p><select value={goal} onChange={e => setGoal(e.target.value)} className={selectCls}><option value="awareness">Awareness</option><option value="conversion">Conversion</option><option value="engagement">Engagement</option><option value="sales">Sales</option></select></div></CardContent></Card>
              <Card><CardHeader title="Platform & Type" /><CardContent className="space-y-2.5"><div><p className={labelCls}>Platform</p><select value={platform} onChange={e => setPlatform(e.target.value as CreativePlatform)} className={selectCls}>{PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}</select></div><div><p className={labelCls}>Creative Type</p><div className="flex flex-wrap gap-1">{CREATIVE_TYPES.map(t => <button key={t.value} onClick={() => setCreativeType(t.value)} className={chipCls(creativeType === t.value)}>{t.label}</button>)}</div></div></CardContent></Card>
              <Card><CardHeader title="Streaming" /><CardContent className="space-y-2"><div><p className={labelCls}>Brand</p><select value={brand} onChange={e => setBrand(e.target.value)} className={selectCls}>{BRANDS.map(b => <option key={b}>{b}</option>)}</select></div><div><p className={labelCls}>Audience</p><select value={audience} onChange={e => setAudience(e.target.value)} className={selectCls}>{AUDIENCES.map(a => <option key={a}>{a}</option>)}</select></div><div><p className={labelCls}>Region</p><select value={region} onChange={e => setRegion(e.target.value)} className={selectCls}>{REGIONS.map(r => <option key={r}>{r}</option>)}</select></div><div><p className={labelCls}>Language</p><select value={language} onChange={e => setLanguage(e.target.value)} className={selectCls}>{LANGUAGES.map(l => <option key={l}>{l}</option>)}</select></div></CardContent></Card>
              <Card><CardHeader title="Style" /><CardContent className="space-y-2.5"><div><p className={labelCls}>Visual Style</p><div className="flex flex-wrap gap-1">{VISUAL_STYLES.map(s => <button key={s} onClick={() => setVisualStyle(s)} className={chipCls(visualStyle === s)}>{s}</button>)}</div></div><div><p className={labelCls}>Colour Palette</p><select value={colourPreset} onChange={e => setColourPreset(e.target.value)} className={selectCls}>{Object.keys(COLOUR_PRESETS).map(c => <option key={c}>{c}</option>)}</select></div><div className="flex gap-1 mt-1">{(COLOUR_PRESETS[colourPreset] ?? COLOUR_PRESETS["Ocean"]).map(c => <span key={c} className="w-5 h-5 rounded-full border border-slate-600" style={{ backgroundColor: c }} />)}</div></CardContent></Card>
              <Card><CardHeader title="Advanced" /><CardContent className="space-y-2.5"><div><p className={labelCls}>Typography</p><select value={typography} onChange={e => setTypography(e.target.value)} className={selectCls}>{TYPOGRAPHY_PRESETS.map(t => <option key={t}>{t}</option>)}</select></div><div><p className={labelCls}>CTA Style</p><select value={ctaStyle} onChange={e => setCtaStyle(e.target.value)} className={selectCls}>{CTA_STYLES.map(c => <option key={c}>{c}</option>)}</select></div><div className="flex items-center gap-2"><input type="checkbox" checked={logoUsage} onChange={e => setLogoUsage(e.target.checked)} className="accent-purple-500" /><span className="text-[11px] text-slate-400">Include Logo</span></div></CardContent></Card>
              <Button onClick={handleGenerate} className="w-full gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"><Wand2 size={14} /> Generate Creative Blueprint</Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* CENTER PANEL */}
        <div className="flex-1 flex flex-col min-w-0 gap-3 overflow-y-auto scrollbar-thin">
          {!result ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 mx-auto"><Palette size={36} className="text-purple-300" /></div>
                <h2 className="text-xl font-semibold text-white mt-5">Creative Composer</h2>
                <p className="text-sm text-slate-400 mt-2 max-w-md">Configure your creative parameters and generate a layout blueprint. Then generate AI images directly.</p>
                <Button onClick={handleGenerate} className="mt-6 gap-2"><Wand2 size={14} /> Generate Blueprint</Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Button size="xs" variant="ghost" onClick={() => setShowGrid(v => !v)} className={cn("text-xs", showGrid ? "text-cyan-400" : "text-slate-500")}><Grid size={12} /> Grid</Button>
                <Button size="xs" variant="ghost" onClick={() => setShowSafeAreas(v => !v)} className={cn("text-xs", showSafeAreas ? "text-amber-400" : "text-slate-500")}><Ruler size={12} /> Safe Areas</Button>
                <span className="text-[10px] text-slate-600 ml-auto">{result.dimensions.width}x{result.dimensions.height}{result.dimensions.unit}</span>
              </div>

              {/* AI Generation bar */}
              <Card>
                <CardContent>
                  <div className="flex items-center gap-3 flex-wrap">
                    <select value={genProvider} onChange={e => setGenProvider(e.target.value)} className="h-8 rounded-lg border border-slate-700/60 bg-slate-900/70 px-2 text-xs text-slate-300 w-36">
                      {providers.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                    <Button onClick={handleGenerateImage} disabled={generating} className="gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                      {generating ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} />}
                      {generating ? "Generating..." : "Generate Image"}
                    </Button>
                    <Button size="sm" onClick={handleGenerateVariations} disabled={generating || !genResponse} variant="outline" className="gap-1.5 border-slate-700 bg-slate-900/70 text-slate-300 text-xs">
                      <Layers size={13} /> Generate 4 Variations
                    </Button>
                    {genResponse && <Button size="sm" onClick={handleRegenerate} variant="ghost" className="gap-1 text-slate-400 text-xs"><RefreshCw size={13} /> Regenerate</Button>}
                    {providerCap && <span className="text-[10px] text-slate-500 ml-auto">{providerCap.pricing.model} • ${providerCap.pricing.costPerImage}/image</span>}
                  </div>
                </CardContent>
              </Card>

              {/* Generated Image Preview */}
              {genResponse && (
                <Card>
                  <CardHeader title="AI Generated Image" description={`${genResponse.provider} • ${genResponse.model} • ${genResponse.dimensions.width}x${genResponse.dimensions.height}px`}
                    action={<div className="flex items-center gap-1">
                      <button onClick={() => setZoomLevel(zoomLevel === "fit" ? "actual" : "fit")} className="p-1 rounded hover:bg-slate-700 text-slate-400 text-xs">{zoomLevel === "fit" ? <Maximize size={13} /> : <ZoomIn size={13} />} {zoomLevel}</button>
                      <button onClick={() => setShowMetadata(v => !v)} className="p-1 rounded hover:bg-slate-700 text-slate-400 text-xs">{showMetadata ? <ChevronUp size={13} /> : <ChevronDown size={13} />}</button>
                    </div>} />
                  <CardContent>
                    <div className={cn("rounded-xl overflow-hidden bg-slate-800/50 flex items-center justify-center", zoomLevel === "actual" ? "max-h-96" : "max-h-64")}>
                      <img src={genResponse.previewUrl} alt="Generated" className="w-full h-full object-contain" />
                    </div>
                    {showMetadata && (
                      <div className="mt-3 grid grid-cols-3 gap-2 text-[10px] text-slate-400 bg-slate-900/60 rounded-lg p-3">
                        {[{ l: "Provider", v: genResponse.provider }, { l: "Model", v: genResponse.model }, { l: "Resolution", v: `${genResponse.dimensions.width}x${genResponse.dimensions.height}` }, { l: "Cost", v: `$${genResponse.cost.toFixed(4)}` }, { l: "Time", v: `${genResponse.generationTimeMs}ms` }, { l: "Status", v: genResponse.status }, { l: "Format", v: genResponse.format }, { l: "Asset ID", v: genResponse.id }, { l: "Created", v: new Date(genResponse.createdAt).toLocaleString() }].map(m => <div key={m.l}><span className="text-slate-600">{m.l}</span><p className="text-slate-300">{m.v}</p></div>)}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Variations grid */}
              {genVariations.length > 0 && (
                <Card>
                  <CardHeader title="Variations" description={`${genVariations.length} generated`} />
                  <CardContent>
                    <div className="grid grid-cols-2 gap-2">
                      {genVariations.map((v, i) => (
                        <button key={v.id} onClick={() => setSelectedVariation(i)} className={cn("rounded-xl overflow-hidden border-2 transition-all", selectedVariation === i ? "border-purple-500" : "border-transparent hover:border-slate-600")}>
                          <img src={v.previewUrl} alt={`Variation ${i + 1}`} className="w-full h-32 object-cover" />
                          <p className="text-[9px] text-slate-500 p-1 text-center">Variation {i + 1} • {v.generationTimeMs}ms</p>
                        </button>
                      ))}
                    </div>
                    {selectedVariation >= 0 && genVariations[selectedVariation] && (
                      <div className="mt-2 flex gap-2">
                        <Button size="xs" variant="outline" className="text-xs border-slate-700 gap-1"><Download size={11} /> Download</Button>
                        <Button size="xs" variant="outline" className="text-xs border-slate-700 gap-1"><Save size={11} /> Save as Asset</Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Layout Blueprint (condensed) */}
              <Card>
                <CardHeader title="Layout Blueprint" description={`${result.layout.sections.length} sections`} />
                <CardContent>
                  <div className="space-y-2">
                    {result.layout.sections.map((section, si) => (
                      <div key={si} className="rounded-lg border border-slate-700/40 p-2 flex items-center justify-between">
                        <div className="flex items-center gap-2"><Layers size={12} className="text-purple-400" /><span className="text-[11px] text-white">{section.name}</span></div>
                        <span className="text-[9px] text-slate-500">{section.elements.length} elements</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="flex flex-wrap gap-2">
                <Button size="sm" className="gap-1.5"><Save size={13} /> Save Draft</Button>
                <Button size="sm" variant="outline" className="gap-1.5 border-slate-700 bg-slate-900/70 text-slate-300"><Copy size={13} /> Duplicate</Button>
                <Button size="sm" variant="outline" onClick={handleDownloadJSON} className="gap-1.5 border-slate-700 bg-slate-900/70 text-slate-300"><FileJson size={13} /> Export JSON</Button>
                <Button size="sm" variant="outline" className="gap-1.5 border-slate-700 bg-slate-900/70 text-slate-300"><Library size={13} /> Send to Library</Button>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT PANEL */}
        <AnimatePresence>
          {!rightCollapsed && (
            <motion.div initial={{ width: 0, opacity: 0 }} animate={{ width: 280, opacity: 1 }} exit={{ width: 0, opacity: 0 }} className="flex-shrink-0 overflow-y-auto scrollbar-thin space-y-3 pl-1" style={{ minWidth: 0, maxWidth: 280 }}>
              {result && platformInfo ? (
                <>
                  <Card><CardHeader title="Platform Info" /><CardContent className="space-y-1.5 text-[10px]"><div className="flex justify-between"><span className="text-slate-500">Platform</span><span className="text-slate-300">{platformInfo.displayName}</span></div><div className="flex justify-between"><span className="text-slate-500">Dimensions</span><span className="text-slate-300">{result.dimensions.width}x{result.dimensions.height}{result.dimensions.unit}</span></div><div className="flex justify-between"><span className="text-slate-500">Ratio</span><span className="text-slate-300">{platformInfo.imageRatio}</span></div></CardContent></Card>

                  {genResponse && (
                    <Card><CardHeader title="Image Metadata" /><CardContent className="space-y-1 text-[10px] text-slate-400"><p><span className="text-slate-600">Provider: </span>{genResponse.provider}</p><p><span className="text-slate-600">Model: </span>{genResponse.model}</p><p><span className="text-slate-600">Cost: </span>${genResponse.cost.toFixed(4)}</p><p><span className="text-slate-600">Time: </span>{genResponse.generationTimeMs}ms</p><p><span className="text-slate-600">Status: </span><span className="text-emerald-400">{genResponse.status}</span></p></CardContent></Card>
                  )}

                  {/* Quality scores */}
                  <Card><CardHeader title="Quality Scores" /><CardContent className="space-y-2">{[
                    { label: "Platform", score: result.validation.platformCompliance.passed ? 100 : 40 }, { label: "Brand", score: result.validation.brandCompliance.passed ? 100 : 50 }, { label: "Overall", score: result.validation.overallScore },
                  ].map(m => <div key={m.label}><div className="flex items-center justify-between text-[10px] mb-0.5"><span className="text-slate-400">{m.label}</span><span className={cn("font-semibold", m.score > 80 ? "text-emerald-400" : m.score > 60 ? "text-amber-400" : "text-red-400")}>{m.score}/100</span></div><div className="h-1 rounded-full bg-slate-800 overflow-hidden"><div className={cn("h-full rounded-full", m.score > 80 ? "bg-emerald-500" : m.score > 60 ? "bg-amber-500" : "bg-red-500")} style={{ width: `${m.score}%` }} /></div></div>)}</CardContent></Card>

                  {/* Generation history */}
                  {history.length > 0 && (
                    <Card><CardHeader title="Recent Generations" description={`${history.length} total`} action={<ChevronDown size={13} className="text-slate-500" />} /><CardContent>
                      <div className="space-y-1.5">{history.slice(0, 5).map((h, i) => <div key={i} className="text-[10px] text-slate-400 flex justify-between"><span className="truncate">{h.response.provider}</span><span>${h.response.cost.toFixed(3)}</span></div>)}</div>
                    </CardContent></Card>
                  )}
                </>
              ) : (
                <Card><CardHeader title="Creative Intelligence" /><CardContent><p className="text-xs text-slate-500">Generate a blueprint to see platform info and generate AI images.</p></CardContent></Card>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}