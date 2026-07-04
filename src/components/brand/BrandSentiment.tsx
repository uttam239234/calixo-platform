"use client";

import { motion } from "framer-motion";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { sentimentTimeline, platformDistribution, brandMentions } from "@/lib/brand-data";
import { Sparkles, TrendingUp, TrendingDown, Minus } from "lucide-react";

export function BrandSentiment() {
  const positiveCount = brandMentions.filter(m => m.sentiment === 'positive').length;
  const neutralCount = brandMentions.filter(m => m.sentiment === 'neutral').length;
  const negativeCount = brandMentions.filter(m => m.sentiment === 'negative').length;
  const total = brandMentions.length;
  const positivePct = ((positiveCount / total) * 100).toFixed(0);
  const neutralPct = ((neutralCount / total) * 100).toFixed(0);
  const negativePct = ((negativeCount / total) * 100).toFixed(0);

  return (
    <div className="space-y-6 pb-8">
      {/* Sentiment Overview */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <div className="grid gap-4 sm:grid-cols-3">
          <Card gradient>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/20 border border-emerald-500/30">
                <TrendingUp size={22} className="text-emerald-400" />
              </div>
              <div>
                <p className="text-3xl font-bold text-white">{positivePct}%</p>
                <p className="text-xs text-slate-400">Positive Sentiment</p>
              </div>
            </div>
            <div className="mt-3 h-2 rounded-full bg-slate-800 overflow-hidden">
              <div className="h-full bg-emerald-500/60 rounded-full" style={{ width: `${positivePct}%` }} />
            </div>
            <p className="text-[11px] text-slate-500 mt-1.5">{positiveCount} positive mentions</p>
          </Card>
          <Card gradient>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/20 border border-amber-500/30">
                <Minus size={22} className="text-amber-400" />
              </div>
              <div>
                <p className="text-3xl font-bold text-white">{neutralPct}%</p>
                <p className="text-xs text-slate-400">Neutral Sentiment</p>
              </div>
            </div>
            <div className="mt-3 h-2 rounded-full bg-slate-800 overflow-hidden">
              <div className="h-full bg-amber-500/60 rounded-full" style={{ width: `${neutralPct}%` }} />
            </div>
            <p className="text-[11px] text-slate-500 mt-1.5">{neutralCount} neutral mentions</p>
          </Card>
          <Card gradient>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/20 border border-red-500/30">
                <TrendingDown size={22} className="text-red-400" />
              </div>
              <div>
                <p className="text-3xl font-bold text-white">{negativePct}%</p>
                <p className="text-xs text-slate-400">Negative Sentiment</p>
              </div>
            </div>
            <div className="mt-3 h-2 rounded-full bg-slate-800 overflow-hidden">
              <div className="h-full bg-red-500/60 rounded-full" style={{ width: `${negativePct}%` }} />
            </div>
            <p className="text-[11px] text-slate-500 mt-1.5">{negativeCount} negative mentions</p>
          </Card>
        </div>
      </motion.div>

      <div className="grid gap-6 xl:grid-cols-2">
        {/* Sentiment Timeline */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.05 }}>
          <Card>
            <CardHeader title="Sentiment Timeline" description="30-day sentiment trend analysis" />
            <CardContent>
              <div className="h-64 flex items-end gap-2">
                {sentimentTimeline.map((point, i) => (
                  <div key={i} className="flex-1 flex flex-col justify-end gap-0.5">
                    <div className="flex flex-col gap-0.5" style={{ height: '200px' }}>
                      <div className="w-full bg-emerald-500/70 rounded-t-sm transition-all hover:bg-emerald-400/80" 
                        style={{ height: `${point.positive}%` }} />
                      <div className="w-full bg-amber-500/60 transition-all hover:bg-amber-400/70" 
                        style={{ height: `${point.neutral}%` }} />
                      <div className="w-full bg-red-500/50 rounded-b-sm transition-all hover:bg-red-400/60" 
                        style={{ height: `${point.negative}%` }} />
                    </div>
                    <span className="text-[10px] text-slate-500 text-center mt-1">{point.date}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-center justify-center gap-6 text-xs text-slate-400">
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-emerald-500/70" /> Positive</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-amber-500/60" /> Neutral</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-red-500/50" /> Negative</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Platform Sentiment Breakdown */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.1 }}>
          <Card>
            <CardHeader title="Sentiment by Platform" description="Emotion analysis per channel" />
            <CardContent>
              <div className="space-y-4">
                {platformDistribution.map((p) => {
                  const platformMentions = brandMentions.filter(m => {
                    const plat = p.platform === 'Twitter/X' ? 'Twitter/X' : p.platform;
                    return m.platform === plat;
                  });
                  const pos = platformMentions.filter(m => m.sentiment === 'positive').length;
                  const neg = platformMentions.filter(m => m.sentiment === 'negative').length;
                  const neu = platformMentions.filter(m => m.sentiment === 'neutral').length;
                  const platTotal = pos + neg + neu || 1;
                  return (
                    <div key={p.platform}>
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="text-slate-300 font-medium">{p.platform}</span>
                        <span className="text-slate-500">{platTotal} mentions</span>
                      </div>
                      <div className="h-3 rounded-full bg-slate-800 overflow-hidden flex">
                        <div className="h-full bg-emerald-500/70" style={{ width: `${(pos / platTotal) * 100}%` }} />
                        <div className="h-full bg-amber-500/60" style={{ width: `${(neu / platTotal) * 100}%` }} />
                        <div className="h-full bg-red-500/50" style={{ width: `${(neg / platTotal) * 100}%` }} />
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-[10px] text-slate-500">
                        <span className="text-emerald-400">{pos} positive</span>
                        <span className="text-amber-400">{neu} neutral</span>
                        <span className="text-red-400">{neg} negative</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* AI Sentiment Summary */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.15 }}>
        <Card gradient>
          <CardHeader title="AI Sentiment Analysis" description="AI-powered topic and emotion analysis" />
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
                <h4 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                  <Sparkles size={16} className="text-cyan-400" /> Topic Analysis
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">Product Quality</span>
                    <span className="text-emerald-400 font-medium">92% positive</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">Customer Support</span>
                    <span className="text-amber-400 font-medium">65% mixed</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">Pricing</span>
                    <span className="text-red-400 font-medium">58% negative</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">AI Features</span>
                    <span className="text-emerald-400 font-medium">96% positive</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">Documentation</span>
                    <span className="text-amber-400 font-medium">60% mixed</span>
                  </div>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
                <h4 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                  <Sparkles size={16} className="text-cyan-400" /> Emotion Detection
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">Excitement</span>
                    <span className="text-emerald-400 font-medium">High</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">Trust</span>
                    <span className="text-emerald-400 font-medium">High</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">Frustration</span>
                    <span className="text-red-400 font-medium">Moderate</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">Curiosity</span>
                    <span className="text-amber-400 font-medium">High</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">Disappointment</span>
                    <span className="text-red-400 font-medium">Low</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}