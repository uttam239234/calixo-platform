"use client";

import { motion } from "framer-motion";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import {
  ModuleKpiGrid,
  ModuleDashboard,
  EnterpriseChartSection,
  type KpiItem,
} from "@/components/enterprise/module";
import { useBrandMonitoring } from "@/features/brand/BrandMonitoringProvider";
import { BrandHealthScoreCard } from "./BrandHealthScoreCard";
import { BrandActionCenter } from "./BrandActionCenter";
import {
  Heart, BarChart3, MessageSquare, Eye, TrendingUp, Trophy,
  AlertTriangle, MapPin, Clock,
  ChevronRight, Sparkles, ArrowUpRight, ArrowDownRight,
} from "lucide-react";

const iconMap: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  Heart, BarChart3, MessageSquare, Eye, TrendingUp, Trophy,
};

export function BrandDashboard() {
  const { mentions, kpis, sentimentTimeline, platformDistribution, countryDistribution, keywordCloud, crisisAlerts, insights, resolveMention, canUpdate } = useBrandMonitoring();

  const recentMentions = mentions.slice(0, 5);
  const activeAlerts = crisisAlerts.filter(a => !a.isResolved).slice(0, 3);
  const latestInsight = insights[0];

  const kpiItems: KpiItem[] = kpis.map(kpi => {
    const Icon = iconMap[kpi.icon] || BarChart3;
    return {
      id: kpi.id,
      title: kpi.title,
      value: kpi.value,
      change: kpi.change,
      trend: kpi.positive ? "up" : "down",
      icon: <Icon size={18} className="text-primary" />,
    };
  });

  const sections = [
    {
      id: "sentiment-timeline",
      span: "two-thirds" as const,
      content: (
        <EnterpriseChartSection
          title="Sentiment Trend"
          description="Sentiment analysis across tracked mentions"
          span="full"
        >
          <div className="h-64 flex items-end gap-2">
            {sentimentTimeline.map((point, i) => (
              <div key={i} className="flex-1 flex flex-col justify-end gap-0.5">
                <div className="flex flex-col gap-0.5" style={{ height: '200px' }}>
                  <div className="w-full bg-success/70 rounded-t-sm transition-all hover:bg-success/80"
                    style={{ height: `${point.positive}%` }} title={`Positive: ${point.positive}%`} />
                  <div className="w-full bg-warning/60 transition-all hover:bg-warning/70"
                    style={{ height: `${point.neutral}%` }} title={`Neutral: ${point.neutral}%`} />
                  <div className="w-full bg-destructive/50 rounded-b-sm transition-all hover:bg-destructive/60"
                    style={{ height: `${point.negative}%` }} title={`Negative: ${point.negative}%`} />
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
        </EnterpriseChartSection>
      ),
    },
    {
      id: "platform-distribution",
      span: "third" as const,
      content: (
        <EnterpriseChartSection
          title="Platform Distribution"
          description="Mentions by platform"
          span="full"
        >
          <div className="space-y-3">
            {platformDistribution.map((p) => (
              <div key={p.platform} className="flex items-center gap-3">
                <span className="text-sm w-5">{p.platform === 'Twitter/X' ? '🐦' : p.platform === 'Instagram' ? '📷' : p.platform === 'LinkedIn' ? '💼' : p.platform === 'Facebook' ? '📘' : p.platform === 'Reddit' ? '🤖' : p.platform === 'YouTube' ? '▶️' : '📰'}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-foreground truncate">{p.platform}</span>
                    <span className="text-muted-foreground">{p.percentage}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${p.percentage}%`, backgroundColor: p.color }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </EnterpriseChartSection>
      ),
    },
    {
      id: "country-distribution",
      span: "third" as const,
      content: (
        <EnterpriseChartSection
          title="Top Countries"
          description="Mentions by location"
          span="full"
        >
          <div className="space-y-2.5">
            {countryDistribution.slice(0, 7).map((c) => (
              <div key={c.country} className="flex items-center justify-between text-sm">
                <span className="text-foreground truncate">{c.flag} {c.country}</span>
                <span className="text-muted-foreground tabular-nums">{c.mentions.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </EnterpriseChartSection>
      ),
    },
    {
      id: "keyword-cloud",
      span: "third" as const,
      content: (
        <EnterpriseChartSection
          title="Keyword Cloud"
          description="Trending brand keywords"
          span="full"
        >
          <div className="flex flex-wrap gap-2">
            {keywordCloud.slice(0, 20).map((kw) => (
              <span
                key={kw.text}
                className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium border transition-all hover:scale-105 ${
                  kw.sentiment === 'positive'
                    ? 'bg-success/10 text-success border-success/20'
                    : kw.sentiment === 'negative'
                    ? 'bg-destructive/10 text-destructive border-destructive/20'
                    : 'bg-muted/50 text-muted-foreground border-border'
                }`}
                style={{ fontSize: `${Math.max(10, Math.min(16, kw.value / 8))}px` }}
              >
                {kw.text}
                {kw.trend === 'up' && <ArrowUpRight size={10} />}
                {kw.trend === 'down' && <ArrowDownRight size={10} />}
              </span>
            ))}
          </div>
        </EnterpriseChartSection>
      ),
    },
    {
      id: "recent-mentions",
      span: "third" as const,
      content: (
        <EnterpriseChartSection
          title="Recent Mentions"
          description="Latest brand mentions"
          viewMoreHref="/dashboard/brand/mentions"
          viewMoreLabel="View all"
          span="full"
        >
          <div className="space-y-3">
            {recentMentions.map((m) => (
              <div key={m.id} className="border-b border-border/70 pb-3 last:border-0 last:pb-0">
                <div className="flex items-start gap-2.5">
                  <span className="text-sm mt-0.5">{m.platformIcon}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-foreground truncate">{m.author}</span>
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                        m.sentiment === 'positive' ? 'bg-success/10 text-success' :
                        m.sentiment === 'negative' ? 'bg-destructive/10 text-destructive' :
                        'bg-warning/10 text-warning'
                      }`}>{m.sentiment}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{m.content}</p>
                    <div className="flex items-center gap-3 mt-1.5 text-[10px] text-muted-foreground">
                      <span className="flex items-center gap-1"><Eye size={10} /> {m.reach.toLocaleString()}</span>
                      <span className="flex items-center gap-1"><MapPin size={10} /> {m.country}</span>
                      <span className="flex items-center gap-1"><Clock size={10} /> {new Date(m.detectedAt).toLocaleDateString()}</span>
                      {!m.isResolved && canUpdate && (
                        <button onClick={() => resolveMention(m.id)} className="ml-auto text-primary hover:text-primary/80">Resolve</button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </EnterpriseChartSection>
      ),
    },
  ];

  return (
    <div className="space-y-6 pb-8">
      {/* KPI Grid */}
      <ModuleKpiGrid items={kpiItems} columns={6} />

      {/* Health Score + Action Center */}
      <div className="grid gap-6 xl:grid-cols-2">
        <BrandHealthScoreCard />
        <BrandActionCenter />
      </div>

      {/* Section Row 1: Sentiment + Platform */}
      <ModuleDashboard
        sections={sections.slice(0, 2)}
        columns={3}
      />

      {/* Section Row 2: Countries + Keywords + Mentions */}
      <ModuleDashboard
        sections={sections.slice(2, 5)}
        columns={3}
      />

      {/* Section Row 3: Crisis Alerts + AI Insight */}
      <div className="grid gap-6 xl:grid-cols-2">
        {/* Crisis Alerts */}
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.3 }}
        >
          <Card>
            <CardHeader title="Active Crisis Alerts" description="Requiring attention"
              action={<a href="/dashboard/brand/crisis" className="text-xs text-primary hover:text-primary/80 flex items-center gap-1">View all <ChevronRight size={14} /></a>} />
            <CardContent>
              {activeAlerts.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No active crises detected 🎉</p>
              ) : (
                <div className="space-y-3">
                  {activeAlerts.map((alert) => (
                    <div key={alert.id} className="flex items-start gap-3 p-3 rounded-xl bg-surface/40 border border-border">
                      <div className={`flex h-9 w-9 items-center justify-center rounded-lg flex-shrink-0 ${
                        alert.severity === 'critical' ? 'bg-destructive/20 text-destructive' :
                        alert.severity === 'warning' ? 'bg-warning/20 text-warning' :
                        'bg-info/20 text-info'
                      }`}>
                        <AlertTriangle size={18} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-foreground">{alert.title}</p>
                          <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                            alert.severity === 'critical' ? 'bg-destructive/20 text-destructive' :
                            alert.severity === 'warning' ? 'bg-warning/20 text-warning' :
                            'bg-info/20 text-info'
                          }`}>{alert.severity}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{alert.description}</p>
                        <div className="flex items-center gap-3 mt-1.5 text-[10px] text-muted-foreground">
                          <span>Risk Score: <span className={`font-bold ${
                            alert.riskScore > 70 ? 'text-destructive' : 'text-warning'
                          }`}>{alert.riskScore}</span></span>
                          <span>{alert.mentionCount} mentions</span>
                          <span>{(alert.reach / 1000).toFixed(0)}K reach</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* AI Insight */}
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.35 }}
        >
          <Card gradient>
            <CardHeader title="AI Executive Summary" description="AI-powered brand intelligence"
              action={<a href="/dashboard/brand/insights" className="text-xs text-primary hover:text-primary/80 flex items-center gap-1">More insights <ChevronRight size={14} /></a>} />
            <CardContent>
              {latestInsight ? (
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/30 to-ai/30 border border-primary/30 flex-shrink-0">
                    <Sparkles size={18} className="text-primary" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                        {latestInsight.type}
                      </span>
                      <span className="text-[10px] text-muted-foreground">{Math.round(latestInsight.confidence * 100)}% confidence</span>
                    </div>
                    <h4 className="text-sm font-semibold text-foreground mb-1">{latestInsight.title}</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-6">{latestInsight.content}</p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">No insights available yet.</p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
