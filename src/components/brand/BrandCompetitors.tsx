"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { competitorData, shareOfVoiceTimeline } from "@/lib/brand-data";
import { ArrowUpRight, ArrowDownRight, BarChart3, Users, Eye, TrendingUp, MessageSquare, Target, Zap } from "lucide-react";

export function BrandCompetitors() {
  const [selectedCompetitors, setSelectedCompetitors] = useState<string[]>(competitorData.map(c => c.id));
  const colors = ['#06B6D4', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444'];

  const toggleCompetitor = (id: string) => {
    setSelectedCompetitors(prev => {
      if (prev.includes(id)) {
        return prev.filter(c => c !== id);
      }
      return [...prev, id];
    });
  };

  const displayedCompetitors = competitorData.filter(c => selectedCompetitors.includes(c.id));

  return (
    <div className="space-y-6 pb-8">
      {/* Competitor KPI Cards */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {displayedCompetitors.map((comp, i) => (
            <Card key={comp.id} padding="sm" gradient>
              <div className="flex items-center justify-between">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl font-bold text-white text-sm"
                  style={{ background: `linear-gradient(135deg, ${colors[i]}30, ${colors[i]}10)`, border: `1px solid ${colors[i]}40` }}>
                  {comp.logo}
                </div>
                <span className="text-[10px] text-slate-500">Rank #{i + 1}</span>
              </div>
              <div className="mt-2">
                <p className="text-sm font-semibold text-white">{comp.name}</p>
                <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-400">
                  <span>{comp.shareOfVoice}% SOV</span>
                  <span className={comp.growth > 0 ? 'text-emerald-400' : 'text-red-400'}>
                    <ArrowUpRight size={10} className="inline" /> {comp.growth}%
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </motion.div>

      {/* Share of Voice Timeline */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.05 }}>
        <Card>
          <CardHeader title="Share of Voice Trend" description="Market conversation share over time" />
          <CardContent>
            <div className="flex flex-wrap gap-3 mb-4">
              {competitorData.map((comp, i) => (
                <button
                  key={comp.id}
                  onClick={() => toggleCompetitor(comp.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                    selectedCompetitors.includes(comp.id)
                      ? `bg-slate-800 border-slate-600 text-white`
                      : 'bg-transparent border-slate-700/50 text-slate-500 line-through'
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: colors[i] }} />
                  {comp.name}
                </button>
              ))}
            </div>
            <div className="h-72 flex items-end gap-6">
              {shareOfVoiceTimeline.map((point, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="flex items-end gap-1 w-full" style={{ height: '240px' }}>
                    {competitorData.filter(c => selectedCompetitors.includes(c.id)).map((comp, j) => {
                      const value = point[comp.name as keyof typeof point] as number;
                      return (
                        <div key={comp.id} className="flex-1 flex flex-col justify-end">
                          <div
                            className="w-full rounded-t-sm transition-all hover:opacity-80"
                            style={{
                              height: `${(value / 40) * 100}%`,
                              backgroundColor: colors[competitorData.findIndex(c => c.id === comp.id)],
                              minHeight: '4px',
                            }}
                            title={`${comp.name}: ${value}%`}
                          />
                        </div>
                      );
                    })}
                  </div>
                  <span className="text-[10px] text-slate-500">{point.date}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Comparison Table */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.1 }}>
        <Card>
          <CardHeader title="Competitor Comparison" description="Side-by-side competitive analysis" />
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700/50">
                    <th className="text-left py-3 px-3 text-slate-400 font-medium text-xs">Metric</th>
                    {displayedCompetitors.map((comp, i) => (
                      <th key={comp.id} className="text-right py-3 px-3 text-white font-semibold text-xs" style={{ color: colors[i] }}>
                        {comp.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { label: 'Share of Voice', key: 'shareOfVoice', suffix: '%', icon: BarChart3 },
                    { label: 'Total Mentions', key: 'totalMentions', suffix: '', format: true, icon: MessageSquare },
                    { label: 'Total Reach', key: 'reach', suffix: '', format: true, icon: Eye },
                    { label: 'Avg Sentiment', key: 'avgSentiment', suffix: '%', icon: TrendingUp },
                    { label: 'Engagement', key: 'engagement', suffix: '', format: true, icon: Target },
                    { label: 'Growth', key: 'growth', suffix: '%', icon: Zap },
                    { label: 'Campaign Activity', key: 'campaignActivity', suffix: '', icon: Zap },
                  ].map((row) => (
                    <tr key={row.key} className="border-b border-slate-800/50 hover:bg-slate-800/20">
                      <td className="py-2.5 px-3 text-slate-300 text-xs flex items-center gap-2">
                        <row.icon size={14} className="text-slate-500" /> {row.label}
                      </td>
                      {displayedCompetitors.map((comp) => {
                        const value = comp[row.key as keyof typeof comp] as number;
                        const isHighest = value === Math.max(...displayedCompetitors.map(c => c[row.key as keyof typeof comp] as number));
                        return (
                          <td key={comp.id} className={`py-2.5 px-3 text-right text-xs tabular-nums ${isHighest ? 'font-bold text-emerald-400' : 'text-slate-300'}`}>
                            {row.format ? value.toLocaleString() : value}{row.suffix}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                  <tr className="border-b border-slate-800/50">
                    <td className="py-2.5 px-3 text-slate-300 text-xs flex items-center gap-2">
                      <TrendingUp size={14} className="text-slate-500" /> Top Keywords
                    </td>
                    {displayedCompetitors.map((comp) => (
                      <td key={comp.id} className="py-2.5 px-3 text-right">
                        <div className="flex flex-wrap gap-1 justify-end">
                          {comp.topKeywords.map(kw => (
                            <span key={kw} className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400">{kw}</span>
                          ))}
                        </div>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}