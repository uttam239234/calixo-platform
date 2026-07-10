"use client";

import { motion } from "framer-motion";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { useBrandMonitoring } from "@/features/brand/BrandMonitoringProvider";
import { AlertTriangle, Shield, CheckCircle2, Clock, Eye, MessageSquare, RotateCcw } from "lucide-react";

export function BrandCrisis() {
  const { crisisAlerts, resolveCrisisAlert, reopenCrisisAlert, canUpdate } = useBrandMonitoring();
  const active = crisisAlerts.filter(a => !a.isResolved);
  const resolved = crisisAlerts.filter(a => a.isResolved);

  return (
    <div className="space-y-6 pb-8">
      {/* Risk Score Overview */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <div className="grid gap-4 sm:grid-cols-3">
          <Card gradient>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/20 border border-destructive/30">
                <AlertTriangle size={22} className="text-destructive" />
              </div>
              <div>
                <p className="text-3xl font-bold text-foreground">{active.length}</p>
                <p className="text-xs text-muted-foreground">Active Crises</p>
              </div>
            </div>
          </Card>
          <Card gradient>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-warning/20 border border-warning/30">
                <Shield size={22} className="text-warning" />
              </div>
              <div>
                <p className="text-3xl font-bold text-foreground">{active.length > 0 ? Math.max(...active.map(a => a.riskScore)) : 0}</p>
                <p className="text-xs text-muted-foreground">Highest Risk Score</p>
              </div>
            </div>
          </Card>
          <Card gradient>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/20 border border-success/30">
                <CheckCircle2 size={22} className="text-success" />
              </div>
              <div>
                <p className="text-3xl font-bold text-foreground">{resolved.length}</p>
                <p className="text-xs text-muted-foreground">Resolved</p>
              </div>
            </div>
          </Card>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.05 }}>
        <Card>
          <CardHeader title="Crisis Detection Center" description="Active and resolved brand crises, detected from real mention signals" />
          <CardContent>
            {crisisAlerts.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No crisis signals detected in tracked mentions 🎉</p>
            ) : (
              <div className="space-y-4">
                {crisisAlerts.map((alert) => (
                  <div key={alert.id} className={`p-4 rounded-xl border transition-all ${alert.isResolved ? 'bg-surface/20 border-border/70 opacity-70' : 'bg-surface/40 border-border'}`}>
                    <div className="flex items-start gap-4">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-xl flex-shrink-0 ${
                        alert.severity === 'critical' ? 'bg-destructive/20 text-destructive border border-destructive/30' :
                        alert.severity === 'warning' ? 'bg-warning/20 text-warning border border-warning/30' :
                        'bg-info/20 text-info border border-info/30'
                      }`}>
                        <AlertTriangle size={20} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm font-semibold text-foreground">{alert.title}</h4>
                          <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                            alert.severity === 'critical' ? 'bg-destructive/20 text-destructive' :
                            alert.severity === 'warning' ? 'bg-warning/20 text-warning' :
                            'bg-info/20 text-info'
                          }`}>{alert.severity}</span>
                          {alert.isResolved && <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-success/10 text-success">Resolved</span>}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{alert.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-[11px] text-muted-foreground flex-wrap">
                          <span className="flex items-center gap-1"><MessageSquare size={11} /> {alert.mentionCount} mentions</span>
                          <span className="flex items-center gap-1"><Eye size={11} /> {(alert.reach / 1000).toFixed(0)}K reach</span>
                          <span className="flex items-center gap-1"><Clock size={11} /> {new Date(alert.detectedAt).toLocaleString()}</span>
                          <span>Source: {alert.source}</span>
                        </div>
                        <div className="mt-2.5">
                          <div className="flex items-center gap-2 text-[11px] text-muted-foreground mb-1">
                            <span>Risk Score:</span>
                            <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden max-w-[200px]">
                              <div className={`h-full rounded-full transition-all ${
                                alert.riskScore > 70 ? 'bg-destructive' : alert.riskScore > 40 ? 'bg-warning' : 'bg-info'
                              }`} style={{ width: `${alert.riskScore}%` }} />
                            </div>
                            <span className={`font-bold ${alert.riskScore > 70 ? 'text-destructive' : 'text-warning'}`}>{alert.riskScore}/100</span>
                          </div>
                        </div>
                        {!alert.isResolved && (
                          <div className="mt-3 p-3 rounded-lg bg-card border border-border">
                            <p className="text-[11px] text-primary font-medium mb-1">🤖 Recommended Response:</p>
                            <p className="text-xs text-foreground leading-relaxed">{alert.recommendedAction}</p>
                          </div>
                        )}
                        {canUpdate && (
                          <div className="mt-3">
                            {alert.isResolved ? (
                              <button onClick={() => reopenCrisisAlert(alert.id)} className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs text-muted-foreground hover:bg-surface hover:text-foreground">
                                <RotateCcw size={13} /> Reopen
                              </button>
                            ) : (
                              <button onClick={() => resolveCrisisAlert(alert.id)} className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs text-success hover:bg-success/10">
                                <CheckCircle2 size={13} /> Mark resolved
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
