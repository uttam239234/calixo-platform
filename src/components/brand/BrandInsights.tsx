"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/button";
import { useBrandMonitoring } from "@/features/brand/BrandMonitoringProvider";
import { Sparkles, Lightbulb, AlertTriangle, TrendingUp, Clock, Loader2 } from "lucide-react";
import type { ReputationInsightType } from "@/core/reputation";

const typeConfig: Record<ReputationInsightType, { icon: typeof Sparkles; bg: string; text: string; border: string; label: string }> = {
  summary: { icon: Sparkles, bg: 'bg-primary/10 border-primary/20', text: 'text-primary', border: 'border-l-primary', label: 'Executive Summary' },
  opportunity: { icon: TrendingUp, bg: 'bg-success/10 border-success/20', text: 'text-success', border: 'border-l-success', label: 'Opportunity' },
  risk: { icon: AlertTriangle, bg: 'bg-destructive/10 border-destructive/20', text: 'text-destructive', border: 'border-l-destructive', label: 'Risk Alert' },
  recommendation: { icon: Lightbulb, bg: 'bg-warning/10 border-warning/20', text: 'text-warning', border: 'border-l-warning', label: 'Recommendation' },
};

export function BrandInsights() {
  const { insights, generateInsight, generatingInsight, insightError } = useBrandMonitoring();

  return (
    <div className="space-y-6 pb-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <div className="flex items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/30 to-ai/30 border border-primary/30">
              <Sparkles size={20} className="text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">AI-Powered Brand Intelligence</h2>
              <p className="text-sm text-muted-foreground">Most insights below are deterministic, generated live from tracked mentions, sentiment, and crisis signals — &quot;AI Analysis&quot; cards are genuine model-generated analysis</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={generateInsight} disabled={generatingInsight}>
            {generatingInsight ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
            {generatingInsight ? "Analyzing…" : "Generate AI Insight"}
          </Button>
        </div>
        {insightError && <p className="mb-4 text-sm text-destructive">{insightError}</p>}
      </motion.div>

      {insights.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-12">Not enough data yet to generate insights.</p>
      ) : (
        <div className="grid gap-6">
          {insights.map((insight, idx) => {
            const config = typeConfig[insight.type];
            const Icon = config.icon;
            return (
              <motion.div
                key={insight.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.05 * idx }}
              >
                <Card gradient className={`border-l-4 ${config.border}`}>
                  <CardContent>
                    <div className="flex items-start gap-4">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${config.bg} flex-shrink-0`}>
                        <Icon size={20} className={config.text} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${config.bg} ${config.text}`}>
                            {config.label}
                          </span>
                          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                            <Clock size={10} /> {new Date(insight.generatedAt).toLocaleString()}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            {Math.round(insight.confidence * 100)}% confidence
                          </span>
                        </div>
                        <h3 className="text-base font-semibold text-foreground mb-2">{insight.title}</h3>
                        <p className="text-sm text-foreground leading-relaxed">{insight.content}</p>
                        <div className="flex items-center gap-3 mt-3">
                          {insight.relatedData.map(data => (
                            <span key={data} className="text-[10px] text-muted-foreground bg-surface/60 px-1.5 py-0.5 rounded">
                              📊 {data}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
