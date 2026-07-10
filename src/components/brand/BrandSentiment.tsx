"use client";

import { motion } from "framer-motion";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { useBrandMonitoring } from "@/features/brand/BrandMonitoringProvider";
import { Sparkles, TrendingUp, TrendingDown, Minus, ArrowUpRight, ArrowDownRight } from "lucide-react";

export function BrandSentiment() {
  const { mentions, sentimentTimeline, platformDistribution, topicSentimentBreakdown, sentimentDrivers } = useBrandMonitoring();

  const positiveCount = mentions.filter(m => m.sentiment === 'positive').length;
  const neutralCount = mentions.filter(m => m.sentiment === 'neutral').length;
  const negativeCount = mentions.filter(m => m.sentiment === 'negative').length;
  const total = mentions.length || 1;
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
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/20 border border-success/30">
                <TrendingUp size={22} className="text-success" />
              </div>
              <div>
                <p className="text-3xl font-bold text-foreground">{positivePct}%</p>
                <p className="text-xs text-muted-foreground">Positive Sentiment</p>
              </div>
            </div>
            <div className="mt-3 h-2 rounded-full bg-muted overflow-hidden">
              <div className="h-full bg-success/60 rounded-full" style={{ width: `${positivePct}%` }} />
            </div>
            <p className="text-[11px] text-muted-foreground mt-1.5">{positiveCount} positive mentions</p>
          </Card>
          <Card gradient>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-warning/20 border border-warning/30">
                <Minus size={22} className="text-warning" />
              </div>
              <div>
                <p className="text-3xl font-bold text-foreground">{neutralPct}%</p>
                <p className="text-xs text-muted-foreground">Neutral Sentiment</p>
              </div>
            </div>
            <div className="mt-3 h-2 rounded-full bg-muted overflow-hidden">
              <div className="h-full bg-warning/60 rounded-full" style={{ width: `${neutralPct}%` }} />
            </div>
            <p className="text-[11px] text-muted-foreground mt-1.5">{neutralCount} neutral mentions</p>
          </Card>
          <Card gradient>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/20 border border-destructive/30">
                <TrendingDown size={22} className="text-destructive" />
              </div>
              <div>
                <p className="text-3xl font-bold text-foreground">{negativePct}%</p>
                <p className="text-xs text-muted-foreground">Negative Sentiment</p>
              </div>
            </div>
            <div className="mt-3 h-2 rounded-full bg-muted overflow-hidden">
              <div className="h-full bg-destructive/60 rounded-full" style={{ width: `${negativePct}%` }} />
            </div>
            <p className="text-[11px] text-muted-foreground mt-1.5">{negativeCount} negative mentions</p>
          </Card>
        </div>
      </motion.div>

      <div className="grid gap-6 xl:grid-cols-2">
        {/* Sentiment Timeline */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.05 }}>
          <Card>
            <CardHeader title="Sentiment Timeline" description="Sentiment trend across tracked mentions" />
            <CardContent>
              <div className="h-64 flex items-end gap-2">
                {sentimentTimeline.map((point, i) => (
                  <div key={i} className="flex-1 flex flex-col justify-end gap-0.5">
                    <div className="flex flex-col gap-0.5" style={{ height: '200px' }}>
                      <div className="w-full bg-success/70 rounded-t-sm transition-all hover:bg-success/80"
                        style={{ height: `${point.positive}%` }} />
                      <div className="w-full bg-warning/60 transition-all hover:bg-warning/70"
                        style={{ height: `${point.neutral}%` }} />
                      <div className="w-full bg-destructive/50 rounded-b-sm transition-all hover:bg-destructive/60"
                        style={{ height: `${point.negative}%` }} />
                    </div>
                    <span className="text-[10px] text-muted-foreground text-center mt-1">{point.date}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-center justify-center gap-6 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-success/70" /> Positive</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-warning/60" /> Neutral</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-destructive/50" /> Negative</span>
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
                  const platformMentions = mentions.filter(m => m.platform === p.platform);
                  const pos = platformMentions.filter(m => m.sentiment === 'positive').length;
                  const neg = platformMentions.filter(m => m.sentiment === 'negative').length;
                  const neu = platformMentions.filter(m => m.sentiment === 'neutral').length;
                  const platTotal = pos + neg + neu || 1;
                  return (
                    <div key={p.platform}>
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="text-foreground font-medium">{p.platform}</span>
                        <span className="text-muted-foreground">{platTotal} mentions</span>
                      </div>
                      <div className="h-3 rounded-full bg-muted overflow-hidden flex">
                        <div className="h-full bg-success/70" style={{ width: `${(pos / platTotal) * 100}%` }} />
                        <div className="h-full bg-warning/60" style={{ width: `${(neu / platTotal) * 100}%` }} />
                        <div className="h-full bg-destructive/50" style={{ width: `${(neg / platTotal) * 100}%` }} />
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-[10px] text-muted-foreground">
                        <span className="text-success">{pos} positive</span>
                        <span className="text-warning">{neu} neutral</span>
                        <span className="text-destructive">{neg} negative</span>
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
          <CardHeader title="AI Sentiment Analysis" description="Topic-level sentiment computed from real mention tags" />
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 rounded-xl bg-surface/50 border border-border">
                <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                  <Sparkles size={16} className="text-primary" /> Topic Analysis
                </h4>
                <div className="space-y-2 text-sm">
                  {topicSentimentBreakdown.length === 0 && <p className="text-xs text-muted-foreground">Not enough tagged mentions yet.</p>}
                  {topicSentimentBreakdown.map(topic => (
                    <div key={topic.tag} className="flex items-center justify-between">
                      <span className="text-foreground">{topic.tag}</span>
                      <span className={`font-medium ${topic.label === 'positive' ? 'text-success' : topic.label === 'negative' ? 'text-destructive' : 'text-warning'}`}>
                        {topic.positivePct}% positive ({topic.mentionCount})
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-4 rounded-xl bg-surface/50 border border-border">
                <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                  <Sparkles size={16} className="text-primary" /> Top Sentiment Drivers
                </h4>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1.5">Driving positive sentiment</p>
                    {sentimentDrivers.positive.length === 0 && <p className="text-xs text-muted-foreground">Not enough data yet.</p>}
                    {sentimentDrivers.positive.map(driver => (
                      <div key={driver.tag} className="flex items-center justify-between">
                        <span className="text-foreground">{driver.tag}</span>
                        <span className="text-success font-medium flex items-center gap-0.5"><ArrowUpRight size={12} /> {driver.positivePct}%</span>
                      </div>
                    ))}
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1.5">Driving negative sentiment</p>
                    {sentimentDrivers.negative.length === 0 && <p className="text-xs text-muted-foreground">No significant negative drivers detected.</p>}
                    {sentimentDrivers.negative.map(driver => (
                      <div key={driver.tag} className="flex items-center justify-between">
                        <span className="text-foreground">{driver.tag}</span>
                        <span className="text-destructive font-medium flex items-center gap-0.5"><ArrowDownRight size={12} /> {driver.positivePct}%</span>
                      </div>
                    ))}
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
