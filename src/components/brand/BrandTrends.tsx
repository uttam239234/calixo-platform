"use client";

import { motion } from "framer-motion";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { trendingTopics, keywordCloud } from "@/lib/brand-data";
import { ArrowUpRight, TrendingUp, Hash, Clock, Sparkles, Lightbulb } from "lucide-react";

export function BrandTrends() {
  return (
    <div className="space-y-6 pb-8">
      {/* Trending Topics */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <Card>
          <CardHeader title="Trending Topics" description="Emerging conversations and keywords" />
          <CardContent>
            <div className="space-y-4">
              {trendingTopics.map((topic) => (
                <div key={topic.id} className="p-4 rounded-xl bg-slate-800/30 border border-slate-700/40 hover:border-slate-600/60 transition-all">
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-semibold text-white">{topic.topic}</h4>
                      <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-500">
                        <span className="flex items-center gap-1"><TrendingUp size={11} /> {topic.volume.toLocaleString()} mentions</span>
                        <span className="flex items-center gap-1 text-emerald-400"><ArrowUpRight size={11} /> +{topic.growth}%</span>
                        <span className="flex items-center gap-1">Sentiment: <span className={`font-medium ${topic.sentiment > 75 ? 'text-emerald-400' : topic.sentiment > 60 ? 'text-amber-400' : 'text-red-400'}`}>{topic.sentiment}%</span></span>
                      </div>
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        {topic.relatedTopics.map(rt => (
                          <span key={rt} className="text-[10px] text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded">{rt}</span>
                        ))}
                      </div>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <div className="h-16 w-16 rounded-full border-4 border-emerald-500/30 flex items-center justify-center">
                        <span className="text-xs font-bold text-emerald-400">{topic.growth}%</span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1">growth</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-700/30 text-[10px] text-slate-500">
                    <span className="flex items-center gap-1"><Clock size={10} /> First detected: {topic.firstDetected}</span>
                    <span className="flex items-center gap-1"><TrendingUp size={10} /> Peak: {topic.peak}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid gap-6 xl:grid-cols-2">
        {/* Emerging Keywords */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.05 }}>
          <Card>
            <CardHeader title="Emerging Keywords" description="Fastest growing brand keywords" />
            <CardContent>
              <div className="space-y-3">
                {keywordCloud.filter(k => k.trend === 'up').slice(0, 10).map((kw) => (
                  <div key={kw.text} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-800/30 border border-slate-700/30">
                    <div className="flex items-center gap-2.5">
                      <Hash size={14} className="text-cyan-400" />
                      <span className="text-sm text-slate-200">{kw.text}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                        kw.sentiment === 'positive' ? 'bg-emerald-500/10 text-emerald-400' :
                        kw.sentiment === 'negative' ? 'bg-red-500/10 text-red-400' :
                        'bg-amber-500/10 text-amber-400'
                      }`}>{kw.sentiment}</span>
                      <span className="text-xs font-bold text-emerald-400 flex items-center gap-0.5"><ArrowUpRight size={12} /> {kw.value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* AI Trend Forecast */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.1 }}>
          <Card gradient>
            <CardHeader title="AI Trend Forecast" description="AI-powered trend predictions" />
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles size={16} className="text-cyan-400" />
                    <span className="text-xs font-semibold text-cyan-300">30-Day Forecast</span>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-slate-300">AI Campaign Optimization</span>
                        <span className="text-emerald-400">+280% expected</span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                        <div className="h-full bg-emerald-500/60 rounded-full" style={{ width: '85%' }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-slate-300">Privacy-First Marketing</span>
                        <span className="text-emerald-400">+195% expected</span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                        <div className="h-full bg-amber-500/60 rounded-full" style={{ width: '65%' }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-slate-300">Video-First Strategy</span>
                        <span className="text-emerald-400">+150% expected</span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                        <div className="h-full bg-blue-500/60 rounded-full" style={{ width: '55%' }} />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
                  <div className="flex items-center gap-2">
                    <Lightbulb size={14} className="text-amber-400" />
                    <p className="text-xs text-slate-300">AI predicts <span className="text-cyan-300 font-medium">SMB segment</span> will shift focus to AI-powered tools in Q4. Prepare targeted content and pricing strategy.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}