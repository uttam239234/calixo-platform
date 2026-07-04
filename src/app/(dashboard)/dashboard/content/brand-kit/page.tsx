"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import {
  Sparkles, Building2, Palette, Type, Megaphone, Eye, Image, Settings, Brain,
  CheckCircle, AlertTriangle, Download, Copy, Shield, Globe, Save, FileJson,
  TrendingUp, BarChart3, ChevronRight, ExternalLink,
} from "lucide-react";
import { BrandKitEngine } from "@/core/brand/BrandKitEngine";
import type { BrandKit, BrandValidation } from "@/core/brand/types";

const BRAND_IDS = ["brand-calixo", "brand-rgu", "brand-demo"];
const TABS = ["Overview", "Identity", "Colours", "Typography", "Voice", "Visual Style", "Assets", "Platform Overrides", "AI Settings", "Validation", "Export"] as const;
type Tab = typeof TABS[number];

const selectCls = "h-9 w-full rounded-xl border border-slate-700/60 bg-slate-900/70 px-3 text-xs text-slate-300 outline-none";
const labelCls = "text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1";

export default function BrandKitPage() {
  const [selectedBrandId, setSelectedBrandId] = useState("brand-calixo");
  const [activeTab, setActiveTab] = useState<Tab>("Overview");
  const [validation, setValidation] = useState<BrandValidation | null>(null);
  const [copied, setCopied] = useState(false);

  const brand = useMemo(() => BrandKitEngine.getBrand(selectedBrandId), [selectedBrandId]);

  const handleValidate = () => {
    const v = BrandKitEngine.validate(selectedBrandId);
    setValidation(v);
    setActiveTab("Validation");
  };

  const handleExport = (format: any) => {
    const json = BrandKitEngine.export(selectedBrandId, { format });
    navigator.clipboard.writeText(json);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!brand) return <p className="text-slate-400">Brand not found</p>;

  const c = brand.colors;
  const t = brand.typography;
  const v = brand.voice;
  const vg = brand.visualGuidelines;

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500/30 to-orange-500/30 border border-amber-500/30">
            <Sparkles size={20} className="text-amber-300" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">Enterprise Brand Kit</h1>
            <p className="text-sm text-slate-400">Central brand management for {brand.profile.brandName}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <select value={selectedBrandId} onChange={e => setSelectedBrandId(e.target.value)} className={cn(selectCls, "w-48")}>
            {BRAND_IDS.map(id => <option key={id} value={id}>{BrandKitEngine.getProfile(id)?.brandName ?? id}</option>)}
          </select>
          <Button size="sm" variant="outline" onClick={handleValidate} className="gap-1.5 border-slate-700 bg-slate-900/70"><Shield size={13} /> Validate</Button>
          <Button size="sm" variant="outline" onClick={() => handleExport("json")} className="gap-1.5 border-slate-700 bg-slate-900/70"><Download size={13} /> {copied ? "Copied!" : "Export"}</Button>
        </div>
      </motion.div>

      {/* Tab bar */}
      <div className="flex gap-1 overflow-x-auto pb-2 border-b border-slate-800/60">
        {TABS.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={cn("shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors", activeTab === tab ? "bg-cyan-500/20 text-cyan-300" : "text-slate-400 hover:bg-slate-800/50")}>{tab}</button>
        ))}
      </div>

      {/* Tab content */}
      <div className="space-y-4">
        {activeTab === "Overview" && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Brand Health", value: validation?.overallScore ? `${validation.overallScore}/100` : "—", icon: Shield },
              { label: "Completeness", value: validation?.completeness ? `${validation.completeness}%` : "—", icon: TrendingUp },
              { label: "Assets", value: brand.assets.length, icon: Image },
              { label: "Overrides", value: brand.platformOverrides.length, icon: Globe },
            ].map(kpi => <Card key={kpi.label} padding="sm" gradient><div className="flex items-center justify-between"><kpi.icon size={16} className="text-cyan-400" /><span className="text-xs text-slate-500">{kpi.label}</span></div><p className="text-2xl font-bold text-white mt-2">{kpi.value}</p></Card>)}
            <Card><CardHeader title="Profile" /><CardContent className="text-xs space-y-1 text-slate-300"><p>{brand.profile.description}</p><div className="flex gap-4 mt-2 text-slate-500"><span>{brand.profile.website}</span><span>{brand.profile.industry}</span><span>{brand.profile.businessType}</span></div></CardContent></Card>
            <Card><CardHeader title="Mission & Vision" /><CardContent className="text-xs space-y-2 text-slate-300"><p><strong className="text-slate-400">Mission:</strong> {brand.profile.mission}</p><p><strong className="text-slate-400">Vision:</strong> {brand.profile.vision}</p><p className="text-amber-400 italic mt-1">"{brand.profile.tagline}"</p></CardContent></Card>
          </div>
        )}

        {activeTab === "Identity" && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Card><CardHeader title="Organization" /><CardContent className="text-xs space-y-1.5 text-slate-300">{Object.entries(brand.profile).filter(([k]) => !["id", "description", "mission", "vision", "tagline"].includes(k)).map(([k, v]) => <div key={k} className="flex justify-between"><span className="text-slate-500 capitalize">{k.replace(/([A-Z])/g, " $1")}</span><span>{v}</span></div>)}</CardContent></Card>
            <Card><CardHeader title="Logo Set" /><CardContent className="text-xs space-y-2 text-slate-300"><div className="grid grid-cols-2 gap-2">{(["primary","secondary","monochrome","dark","light","favicon"] as const).map(k => <div key={k} className="p-2 rounded-lg bg-slate-800/40 border border-slate-700/40"><p className="text-slate-500 capitalize">{k}</p><p className="text-slate-400 truncate">{brand.logos[k]}</p></div>)}</div><div className="mt-2 space-y-1"><p className="text-slate-500">Clear Space: {brand.logos.clearSpace}px</p><p className="text-slate-500">Min Size: {brand.logos.minSize}px</p></div></CardContent></Card>
          </div>
        )}

        {activeTab === "Colours" && (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
            {Object.values(c).map(color => (
              <Card key={color.name} padding="sm">
                <div className="w-full h-16 rounded-xl mb-2" style={{ backgroundColor: color.hex }} />
                <p className="text-xs font-semibold text-white">{color.name}</p>
                <p className="text-[10px] text-slate-500">{color.hex}</p>
                <p className="text-[10px] text-slate-600">{color.rgb}</p>
                <p className="text-[10px] text-slate-600">{color.hsl}</p>
              </Card>
            ))}
          </div>
        )}

        {activeTab === "Typography" && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Card><CardHeader title="Fonts" /><CardContent className="text-xs space-y-1.5 text-slate-300"><div className="flex justify-between"><span className="text-slate-500">Heading</span><span>{t.headingFont}</span></div><div className="flex justify-between"><span className="text-slate-500">Body</span><span>{t.bodyFont}</span></div><div className="flex justify-between"><span className="text-slate-500">Display</span><span>{t.displayFont}</span></div><div className="flex justify-between"><span className="text-slate-500">Fallback</span><span>{t.fallbackFonts.join(", ")}</span></div></CardContent></Card>
            <Card><CardHeader title="Type Scale" /><CardContent className="text-xs space-y-1.5">{Object.entries(t.typeScale).map(([level, spec]) => <div key={level} className="flex justify-between p-1.5 rounded-lg bg-slate-800/20"><span className="text-slate-400 capitalize">{level.replace("-", " ")}</span><span className="text-slate-500">{spec.size} / {spec.lineHeight} / {spec.letterSpacing}</span></div>)}</CardContent></Card>
          </div>
        )}

        {activeTab === "Voice" && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Card><CardHeader title="Brand Voice" /><CardContent className="text-xs space-y-2 text-slate-300"><p><strong className="text-slate-400">Tone:</strong> {v.tone}</p><p><strong className="text-slate-400">Writing:</strong> {v.writingStyle}</p><p><strong className="text-slate-400">Communication:</strong> {v.communicationStyle}</p><p><strong className="text-slate-400">CTA Style:</strong> {v.ctaStyle}</p><p><strong className="text-slate-400">Capitalization:</strong> {v.capitalizationRules}</p><p><strong className="text-slate-400">Emoji:</strong> {v.emojiUsage}</p></CardContent></Card>
            <Card><CardHeader title="Vocabulary" /><CardContent className="text-xs space-y-2"><div className="flex flex-wrap gap-1">{v.preferredVocabulary.map(w => <span key={w} className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px]">{w}</span>)}</div><p className="text-slate-400 mt-2 font-semibold">Forbidden:</p><div className="flex flex-wrap gap-1">{v.forbiddenWords.map(w => <span key={w} className="px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 text-[10px]">{w}</span>)}</div></CardContent></Card>
          </div>
        )}

        {activeTab === "Visual Style" && (
          <div className="grid gap-4 sm:grid-cols-2">
            {Object.entries(vg).map(([key, val]) => <Card key={key}><CardHeader title={key.replace(/([A-Z])/g, " $1").replace(/^./, s => s.toUpperCase())} /><CardContent className="text-xs text-slate-300">{val}</CardContent></Card>)}
          </div>
        )}

        {activeTab === "Assets" && (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {brand.assets.map(a => <Card key={a.id} padding="sm"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-700/50 text-xs font-bold text-cyan-400">{a.type[0].toUpperCase()}</div><div className="min-w-0"><p className="text-xs text-white truncate">{a.name}</p><p className="text-[10px] text-slate-500">{a.format} • {a.size}</p></div></div></Card>)}
          </div>
        )}

        {activeTab === "Platform Overrides" && (
          <div className="space-y-3">
            {brand.platformOverrides.length === 0 ? <p className="text-sm text-slate-500">No platform overrides configured.</p> : brand.platformOverrides.map((o, i) => <Card key={i}><CardHeader title={o.platform} /><CardContent className="text-xs text-slate-300 space-y-1">{Object.entries(o).filter(([k]) => k !== "platform").map(([k, v]) => <div key={k} className="flex justify-between"><span className="text-slate-500 capitalize">{k}</span><span>{typeof v === "string" ? v : JSON.stringify(v)}</span></div>)}</CardContent></Card>)}
          </div>
        )}

        {activeTab === "AI Settings" && (
          <Card><CardContent className="text-xs space-y-2 text-slate-300">{Object.entries(brand.aiSettings).map(([k, v]) => <div key={k} className="flex justify-between p-1.5 rounded bg-slate-800/20"><span className="text-slate-400 capitalize">{k.replace(/([A-Z])/g, " $1")}</span><span>{String(v)}</span></div>)}</CardContent></Card>
        )}

        {activeTab === "Validation" && (
          <div className="space-y-4">
            {validation ? (
              <>
                <div className="grid gap-4 sm:grid-cols-2 mb-4">
                  <Card><CardHeader title="Overall Score" /><CardContent><p className={cn("text-4xl font-bold", validation.overallScore > 80 ? "text-emerald-400" : validation.overallScore > 60 ? "text-amber-400" : "text-red-400")}>{validation.overallScore}</p><p className="text-xs text-slate-500">/100</p></CardContent></Card>
                  <Card><CardHeader title="Completeness" /><CardContent><p className="text-4xl font-bold text-cyan-400">{validation.completeness}%</p><p className="text-xs text-slate-500">{validation.results.filter(r => r.passed).length}/{validation.results.length} checks passed</p></CardContent></Card>
                </div>
                {validation.results.map(r => <Card key={r.category} className={r.passed ? "" : "border-amber-500/30"}><CardHeader title={r.category} description={`Score: ${r.score}/100`} action={r.passed ? <CheckCircle size={16} className="text-emerald-400" /> : <AlertTriangle size={16} className="text-amber-400" />} /><CardContent><div className="space-y-1 text-[10px]">{r.issues.length === 0 ? <p className="text-emerald-400">All checks passed</p> : r.issues.map((i, idx) => <p key={idx} className="text-amber-400">• {i}</p>)}</div></CardContent></Card>)}
              </>
            ) : (
              <div className="text-center py-8"><CheckCircle size={40} className="text-slate-600 mx-auto mb-3" /><p className="text-sm text-slate-500">Click "Validate" to run brand compliance checks.</p></div>
            )}
          </div>
        )}

        {activeTab === "Export" && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[{ format: "json", label: "Full Brand JSON", desc: "Complete brand kit as JSON" }, { format: "bundle", label: "Brand Bundle", desc: "Brand + metadata + version" }, { format: "creative-presets", label: "Creative Presets", desc: "Ready for Creative Composer" }, { format: "ai-config", label: "AI Configuration", desc: "For AI Generation Engine" }, { format: "design-tokens", label: "Design Tokens", desc: "Colours, typography, spacing" }].map(exp => <Card key={exp.format} padding="sm" hoverable onClick={() => handleExport(exp.format)}><div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-500/10"><FileJson size={16} className="text-cyan-400" /></div><div><p className="text-sm font-semibold text-white">{exp.label}</p><p className="text-[10px] text-slate-500">{exp.desc}</p></div></div></Card>)}
          </div>
        )}
      </div>
    </div>
  );
}