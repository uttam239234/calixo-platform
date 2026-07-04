"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import {
  Brain, Search, BarChart3, Shield, Type, CheckCircle, AlertTriangle, TrendingUp, Eye,
  MousePointerClick, Zap, ChevronRight, RefreshCw, ArrowRight, Lightbulb, Hash, FileText,
  Clock, RotateCcw, Sparkles, Wand2, ChevronDown, ChevronUp, X,
} from "lucide-react";
import { ContentIntelligenceEngine, type ContentAnalysis, type AIInsight, type ContentScores } from "@/core/intelligence/ContentIntelligenceEngine";

const SCORE_LABELS: { key: keyof ContentScores; label: string; icon: React.ComponentType<{size?:number;className?:string}> }[] = [
  { key: "overall", label: "Overall", icon: BarChart3 }, { key: "seo", label: "SEO", icon: Search }, { key: "readability", label: "Readability", icon: Type }, { key: "grammar", label: "Grammar", icon: CheckCircle }, { key: "brand", label: "Brand", icon: Shield }, { key: "accessibility", label: "Accessibility", icon: Eye }, { key: "cta", label: "CTA", icon: MousePointerClick }, { key: "engagement", label: "Engagement", icon: TrendingUp }, { key: "conversion", label: "Conversion", icon: ArrowRight }, { key: "structure", label: "Structure", icon: FileText }, { key: "keywordDensity", label: "Keywords", icon: Hash }, { key: "tone", label: "Tone", icon: Sparkles },
];

const INSIGHT_COLORS: Record<AIInsight["type"], string> = {
  strength: "border-emerald-500/30 bg-emerald-500/5 text-emerald-400",
  weakness: "border-red-500/30 bg-red-500/5 text-red-400",
  opportunity: "border-cyan-500/30 bg-cyan-500/5 text-cyan-400",
  recommendation: "border-blue-500/30 bg-blue-500/5 text-blue-400",
  risk: "border-amber-500/30 bg-amber-500/5 text-amber-400",
  "missing-section": "border-purple-500/30 bg-purple-500/5 text-purple-400",
  "duplicate-warning": "border-amber-500/30 bg-amber-500/5 text-amber-400",
  "brand-violation": "border-red-500/30 bg-red-500/5 text-red-400",
};

const INSIGHT_ICONS: Record<AIInsight["type"], React.ComponentType<{size?:number;className?:string}>> = {
  strength: CheckCircle, weakness: AlertTriangle, opportunity: Lightbulb,
  recommendation: Sparkles, risk: AlertTriangle, "missing-section": FileText,
  "duplicate-warning": Hash, "brand-violation": Shield,
};

const OPTIMIZATION_ACTIONS = ["Rewrite","Improve SEO","Improve CTA","Improve Headline","Improve Meta Description","Simplify","Professional","Friendly","Academic","Technical","Humanize"];

export default function IntelligencePage() {
  const [title, setTitle] = useState("Enterprise SEO Guide 2025");
  const [sample, setSample] = useState("This is paragraph 1 of an enterprise content piece. It contains sample content for demonstrating the workspace capabilities. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.\n\nThis is paragraph 2 with additional marketing insights and strategic recommendations for enterprise content teams.");
  const [analysis, setAnalysis] = useState<ContentAnalysis | null>(null);
  const [showOptimized, setShowOptimized] = useState(false);
  const [activePanel, setActivePanel] = useState<"scores" | "insights" | "keywords" | "brand" | "compare">("scores");
  const [optAction, setOptAction] = useState("");

  const metrics = useMemo(() => ContentIntelligenceEngine.getDashboardMetrics(), []);

  const handleAnalyze = () => {
    setAnalysis(ContentIntelligenceEngine.analyze(title, sample));
    setShowOptimized(false);
  };

  const handleOptAction = (action: string) => {
    setOptAction(action);
    setTimeout(() => setOptAction(""), 1500);
    handleAnalyze();
  };

  const scoreColor = (v: number) => v > 80 ? "text-emerald-400" : v > 60 ? "text-amber-400" : "text-red-400";
  const scoreBg = (v: number) => v > 80 ? "bg-emerald-500" : v > 60 ? "bg-amber-500" : "bg-red-500";

  return (
    <div className="h-[calc(100vh-10rem)] flex flex-col pb-4">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex-shrink-0 flex items-center justify-between mb-3 pb-3 border-b border-slate-800/60">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500/30 to-cyan-500/30 border border-purple-500/30"><Brain size={18} className="text-purple-300" /></div>
          <div><h1 className="text-base font-bold text-white">Content Intelligence Center</h1><p className="text-[11px] text-slate-400">AI-powered optimization workspace</p></div>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={handleAnalyze} className="gap-2 bg-gradient-to-r from-purple-500 to-cyan-500"><Brain size={14} /> Analyze Content</Button>
        </div>
      </motion.div>

      {/* Dashboard KPI row */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-2 lg:grid-cols-7 gap-3 mb-4">
        {[{ label: "Total Analyses", value: metrics.totalAnalyses, icon: BarChart3 }, { label: "Avg Score", value: `${metrics.avgScore}/100`, icon: TrendingUp }, { label: "Improvement Rate", value: `${metrics.improvementRate}%`, icon: Zap }, { label: "Critical Issues", value: metrics.criticalIssues, icon: AlertTriangle }, { label: "Optimizations", value: metrics.optimizationCount, icon: Sparkles }].map(kpi => <Card key={kpi.label} padding="sm" gradient><div className="flex items-center justify-between"><kpi.icon size={15} className="text-cyan-400" /><span className="text-[10px] text-slate-500">{kpi.label}</span></div><p className="text-xl font-bold text-white mt-1">{kpi.value}</p></Card>)}
      </motion.div>

      {/* Content input area */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-3">
        <Card>
          <CardHeader title="Content to Analyze" description="Paste or type content for AI-powered analysis" />
          <CardContent className="space-y-2">
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Content title..." className="w-full h-9 rounded-lg border border-slate-700/60 bg-slate-900/70 px-3 text-sm text-slate-200 outline-none" />
            <textarea value={sample} onChange={e => setSample(e.target.value)} placeholder="Paste your content here..." className="w-full h-32 rounded-lg border border-slate-700/60 bg-slate-900/70 p-3 text-sm text-slate-200 outline-none resize-none scrollbar-thin" />
          </CardContent>
        </Card>
      </motion.div>

      <div className="flex-1 flex gap-4 min-h-0">
        {!analysis ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center"><Brain size={48} className="text-slate-600 mx-auto mb-4" /><p className="text-slate-500 text-sm">Click "Analyze Content" to start AI-powered optimization.</p></div>
          </div>
        ) : (
          <>
            {/* Left panel: Scores, Insights, Keywords, Brand */}
            <div className="flex-shrink-0 w-72 overflow-y-auto scrollbar-thin space-y-3">
              {/* Tab selector */}
              <div className="flex gap-1">
                {(["scores","insights","keywords","brand","compare"] as const).map(tab => <button key={tab} onClick={() => setActivePanel(tab)} className={cn("flex-1 px-2 py-1.5 rounded-lg text-[10px] font-medium capitalize transition-colors", activePanel === tab ? "bg-cyan-500/20 text-cyan-300" : "text-slate-400 hover:bg-slate-800/50")}>{tab}</button>)}
              </div>

              {/* Scores panel */}
              {activePanel === "scores" && (
                <div className="space-y-2">
                  <p className="text-[10px] font-semibold text-slate-500 uppercase">Content Scores</p>
                  {SCORE_LABELS.map(s => (
                    <div key={s.key}>
                      <div className="flex items-center justify-between text-[10px] mb-0.5"><span className="text-slate-400 flex items-center gap-1.5"><s.icon size={11} />{s.label}</span><span className={cn("font-semibold", scoreColor(analysis.scores[s.key as keyof ContentScores]))}>{analysis.scores[s.key as keyof ContentScores]}/100</span></div>
                      <div className="h-1 rounded-full bg-slate-800 overflow-hidden"><div className={cn("h-full rounded-full", scoreBg(analysis.scores[s.key as keyof ContentScores]))} style={{ width: `${analysis.scores[s.key as keyof ContentScores]}%` }} /></div>
                    </div>
                  ))}
                </div>
              )}

              {/* Insights panel */}
              {activePanel === "insights" && (
                <div className="space-y-2">
                  <p className="text-[10px] font-semibold text-slate-500 uppercase">AI Insights ({analysis.insights.length})</p>
                  {analysis.insights.map((ins, i) => { const Ico = INSIGHT_ICONS[ins.type];
                    return <div key={i} className={cn("p-2.5 rounded-xl border text-[10px]", INSIGHT_COLORS[ins.type])}>
                      <div className="flex items-start gap-1.5"><Ico size={12} className="mt-0.5 flex-shrink-0" /><div><p className="font-semibold">{ins.title}</p><p className="text-slate-400 mt-0.5">{ins.description}</p><span className={cn("text-[9px] mt-1 inline-block px-1.5 py-0.5 rounded-full", ins.severity === "high" || ins.severity === "critical" ? "bg-red-500/10 text-red-400" : "bg-amber-500/10 text-amber-400")}>{ins.severity}</span></div></div>
                    </div>;
                  })}
                </div>
              )}

              {/* Keywords panel */}
              {activePanel === "keywords" && (
                <div className="space-y-2">
                  <p className="text-[10px] font-semibold text-slate-500 uppercase">Keyword Analysis</p>
                  <div className="text-[10px] text-slate-400 space-y-1.5">
                    <div className="p-2 rounded bg-slate-800/30"><span className="text-slate-500">Primary:</span> <span className="text-cyan-400 font-medium">{analysis.keywordAnalysis.primaryKeyword}</span></div>
                    <div className="p-2 rounded bg-slate-800/30"><span className="text-slate-500">Density:</span> <span className="text-slate-300">{analysis.keywordAnalysis.density.toFixed(1)}%</span></div>
                    <p className="text-slate-500 pt-1">Secondary:</p>
                    {analysis.keywordAnalysis.secondaryKeywords.map(k => <div key={k} className="p-1.5 rounded bg-slate-800/20 text-slate-400">{k}</div>)}
                    <p className="text-slate-500 pt-1">Suggestions:</p>
                    {analysis.keywordAnalysis.suggestions.map(k => <div key={k} className="p-1.5 rounded bg-slate-800/20 text-cyan-400"><Lightbulb size={10} className="inline mr-1" />{k}</div>)}
                    <p className="text-slate-500 pt-1">Missing:</p>
                    {analysis.keywordAnalysis.missingKeywords.map(k => <div key={k} className="p-1.5 rounded bg-slate-800/20 text-amber-400"><AlertTriangle size={10} className="inline mr-1" />{k}</div>)}
                  </div>
                </div>
              )}

              {/* Brand panel */}
              {activePanel === "brand" && (
                <div className="space-y-2">
                  <p className="text-[10px] font-semibold text-slate-500 uppercase">Brand Analysis</p>
                  <div className="text-[10px] text-slate-400 space-y-1.5">
                    <div className="flex justify-between p-2 rounded bg-slate-800/30"><span>Voice Match</span><span className={cn(analysis.brandAnalysis.voiceMatch > 80 ? "text-emerald-400" : "text-amber-400")}>{analysis.brandAnalysis.voiceMatch}%</span></div>
                    <div className="flex justify-between p-2 rounded bg-slate-800/30"><span>Tone</span><span className="text-slate-300">{analysis.brandAnalysis.tone}</span></div>
                    <div className="flex justify-between p-2 rounded bg-slate-800/30"><span>CTA Compliant</span><span className={analysis.brandAnalysis.ctaCompliant ? "text-emerald-400" : "text-red-400"}>{analysis.brandAnalysis.ctaCompliant ? "Yes" : "No"}</span></div>
                    <p className="text-slate-500 pt-1">Forbidden Words Found:</p>
                    {analysis.brandAnalysis.forbiddenWords.length > 0 ? analysis.brandAnalysis.forbiddenWords.map(w => <div key={w} className="p-1.5 rounded bg-red-500/10 text-red-400">{w}</div>) : <p className="text-emerald-400 text-[10px]">None found ✓</p>}
                    <p className="text-slate-500 pt-1">Preferred Used:</p>
                    {analysis.brandAnalysis.preferredUsed.map(w => <div key={w} className="p-1.5 rounded bg-emerald-500/10 text-emerald-400 flex items-center gap-1"><CheckCircle size={10} />{w}</div>)}
                  </div>
                </div>
              )}

              {/* Compare panel */}
              {activePanel === "compare" && (
                <div className="space-y-2">
                  <p className="text-[10px] font-semibold text-slate-500 uppercase">Side-by-Side</p>
                  <div className="text-[10px] text-slate-400 space-y-2">
                    <div className="p-2 rounded bg-slate-800/30 border border-slate-700/40"><p className="text-slate-500 mb-1">Original</p><p className="text-slate-400 line-clamp-6">{analysis.contentSample}</p></div>
                    <div className="p-2 rounded bg-emerald-500/5 border border-emerald-500/20"><p className="text-emerald-400 mb-1">AI Optimized</p><p className="text-slate-300 line-clamp-6">{analysis.optimizedSample}</p></div>
                    <div className="flex gap-1">
                      <Button size="xs" className="text-[10px] gap-1 bg-emerald-500"><CheckCircle size={11} /> Accept</Button>
                      <Button size="xs" variant="outline" className="text-[10px] gap-1 border-slate-700"><X size={11} /> Reject</Button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Center: Optimization panel + optimized preview */}
            <div className="flex-1 flex flex-col min-w-0 gap-3 overflow-y-auto scrollbar-thin">
              {/* Optimization quick actions */}
              <Card>
                <CardHeader title="AI Optimization" description="Select an action to improve content" />
                <CardContent>
                  <div className="flex flex-wrap gap-1.5">
                    {OPTIMIZATION_ACTIONS.map(action => (
                      <button key={action} onClick={() => handleOptAction(action)} className={cn("px-2 py-1 rounded-lg text-[10px] font-medium transition-colors", optAction === action ? "bg-purple-500/20 text-purple-300" : "text-slate-400 hover:bg-slate-800/50")}>{action}</button>
                    ))}
                  </div>
                  {optAction && <p className="text-[10px] text-purple-400 mt-2">🤖 Running "{optAction}" optimization...</p>}
                </CardContent>
              </Card>

              {/* Optimized content preview */}
              <Card>
                <CardHeader title="Optimized Content" description="AI-powered improvements applied" action={<button onClick={() => setShowOptimized(v => !v)} className="text-xs text-cyan-400">{showOptimized ? "Show Original" : "Show Optimized"}</button>} />
                <CardContent>
                  <div className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed bg-slate-900/60 rounded-lg p-4 max-h-96 overflow-y-auto scrollbar-thin">
                    {showOptimized ? analysis.optimizedSample : analysis.contentSample}
                  </div>
                  {showOptimized && (
                    <div className="mt-3 flex gap-2">
                      <Button size="xs" className="gap-1 text-[10px] bg-emerald-500"><CheckCircle size={11} /> Accept All Changes</Button>
                      <Button size="xs" variant="outline" className="gap-1 text-[10px] border-slate-700"><RotateCcw size={11} /> Revert</Button>
                      <Button size="xs" variant="outline" className="gap-1 text-[10px] border-slate-700"><FileText size={11} /> Create New Version</Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right: Score trend chart (mini) */}
            <div className="flex-shrink-0 w-48 space-y-3">
              <Card>
                <CardHeader title="Score Trend" />
                <CardContent>
                  <div className="h-24 flex items-end gap-1">
                    {metrics.scoreTrend.map((v, i) => <div key={i} className="flex-1 bg-cyan-500/50 rounded-t" style={{ height: `${v}%` }} title={`${v}`} />)}
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1 text-center">Last 7 analyses</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader title="Approval Readiness" />
                <CardContent>
                  <div className={cn("text-2xl font-bold text-center", scoreColor(analysis.scores.overall))}>{analysis.scores.overall}%</div>
                  <p className="text-[10px] text-slate-500 text-center mt-1">{analysis.scores.overall > 80 ? "Ready for review" : analysis.scores.overall > 60 ? "Needs improvement" : "Not ready"}</p>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  );
}