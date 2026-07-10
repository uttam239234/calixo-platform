"use client";

import { motion } from "framer-motion";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { useBrandMonitoring } from "@/features/brand/BrandMonitoringProvider";
import { ArrowUpRight, TrendingUp, Hash, Clock, Sparkles, Lightbulb } from "lucide-react";

export function BrandTrends() {
  const { trendingTopics, keywordCloud, sentimentForecast, insights } = useBrandMonitoring();
  const maxGrowth = Math.max(...trendingTopics.map(t => t.growth), 1);
  const topForecastTopics = [...trendingTopics].sort((a, b) => b.growth - a.growth).slice(0, 3);
  const opportunityInsight = insights.find(i => i.type === "opportunity");

  return (
    <div className="space-y-6 pb-8">
      {/* Trending Topics */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <Card>
          <CardHeader title="Trending Topics" description="Industry-wide conversation volume — a distinct signal from our own tracked mentions" />
          <CardContent>
            <div className="space-y-4">
              {trendingTopics.map((topic) => (
                <div key={topic.id} className="p-4 rounded-xl bg-surface/30 border border-border hover:border-primary/30 transition-all">
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-semibold text-foreground">{topic.topic}</h4>
                      <div className="flex items-center gap-3 mt-1.5 text-[11px] text-muted-foreground">
                        <span className="flex items-center gap-1"><TrendingUp size={11} /> {topic.volume.toLocaleString()} mentions</span>
                        <span className="flex items-center gap-1 text-success"><ArrowUpRight size={11} /> +{topic.growth}%</span>
                        <span className="flex items-center gap-1">Sentiment: <span className={`font-medium ${topic.sentiment > 75 ? 'text-success' : topic.sentiment > 60 ? 'text-warning' : 'text-destructive'}`}>{topic.sentiment}%</span></span>
                      </div>
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        {topic.relatedTopics.map(rt => (
                          <span key={rt} className="text-[10px] text-primary bg-primary/10 px-1.5 py-0.5 rounded">{rt}</span>
                        ))}
                      </div>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <div className="h-16 w-16 rounded-full border-4 border-success/30 flex items-center justify-center">
                        <span className="text-xs font-bold text-success">{topic.growth}%</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-1">growth</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border/70 text-[10px] text-muted-foreground">
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
            <CardHeader title="Emerging Keywords" description="Fastest growing tags across tracked mentions" />
            <CardContent>
              <div className="space-y-3">
                {keywordCloud.filter(k => k.trend === 'up').slice(0, 10).map((kw) => (
                  <div key={kw.text} className="flex items-center justify-between p-2.5 rounded-lg bg-surface/30 border border-border/70">
                    <div className="flex items-center gap-2.5">
                      <Hash size={14} className="text-primary" />
                      <span className="text-sm text-foreground">{kw.text}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                        kw.sentiment === 'positive' ? 'bg-success/10 text-success' :
                        kw.sentiment === 'negative' ? 'bg-destructive/10 text-destructive' :
                        'bg-warning/10 text-warning'
                      }`}>{kw.sentiment}</span>
                      <span className="text-xs font-bold text-success flex items-center gap-0.5"><ArrowUpRight size={12} /> {kw.value}</span>
                    </div>
                  </div>
                ))}
                {keywordCloud.filter(k => k.trend === 'up').length === 0 && <p className="text-xs text-muted-foreground text-center py-6">No rising keywords detected yet.</p>}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Reputation Forecast */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.1 }}>
          <Card gradient>
            <CardHeader title="Reputation Forecast" description="Linear trend projection over real tracked data" />
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles size={16} className="text-primary" />
                    <span className="text-xs font-semibold text-primary">Top Industry Topics by Growth</span>
                  </div>
                  <div className="space-y-3">
                    {topForecastTopics.map(topic => (
                      <div key={topic.id}>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-foreground">{topic.topic}</span>
                          <span className="text-success">+{topic.growth}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-muted overflow-hidden">
                          <div className="h-full bg-success/60 rounded-full" style={{ width: `${(topic.growth / maxGrowth) * 100}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                {sentimentForecast.length > 0 && (
                  <div className="p-3 rounded-xl bg-surface/60 border border-border">
                    <div className="flex items-center gap-2">
                      <Lightbulb size={14} className="text-warning" />
                      <p className="text-xs text-foreground">
                        Positive sentiment projected at <span className="text-primary font-medium">{sentimentForecast[sentimentForecast.length - 1].projectedValue}%</span> {sentimentForecast[sentimentForecast.length - 1].label} — linear trend over tracked sentiment history.
                      </p>
                    </div>
                  </div>
                )}
                {opportunityInsight && (
                  <div className="p-3 rounded-xl bg-surface/60 border border-border">
                    <div className="flex items-center gap-2">
                      <Lightbulb size={14} className="text-warning" />
                      <p className="text-xs text-foreground">{opportunityInsight.content}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
