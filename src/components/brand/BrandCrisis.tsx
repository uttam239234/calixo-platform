"use client";

import { motion } from "framer-motion";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { crisisAlerts } from "@/lib/brand-data";
import { AlertTriangle, Shield, CheckCircle2, Clock, Eye, MessageSquare } from "lucide-react";

export function BrandCrisis() {
  const active = crisisAlerts.filter(a => !a.isResolved);
  const resolved = crisisAlerts.filter(a => a.isResolved);

  return (
    <div className="space-y-6 pb-8">
      {/* Risk Score Overview */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <div className="grid gap-4 sm:grid-cols-3">
          <Card gradient>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/20 border border-red-500/30">
                <AlertTriangle size={22} className="text-red-400" />
              </div>
              <div>
                <p className="text-3xl font-bold text-white">{active.length}</p>
                <p className="text-xs text-slate-400">Active Crises</p>
              </div>
            </div>
          </Card>
          <Card gradient>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/20 border border-amber-500/30">
                <Shield size={22} className="text-amber-400" />
              </div>
              <div>
                <p className="text-3xl font-bold text-white">{Math.max(...active.map(a => a.riskScore))}</p>
                <p className="text-xs text-slate-400">Highest Risk Score</p>
              </div>
            </div>
          </Card>
          <Card gradient>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/20 border border-emerald-500/30">
                <CheckCircle2 size={22} className="text-emerald-400" />
              </div>
              <div>
                <p className="text-3xl font-bold text-white">{resolved.length}</p>
                <p className="text-xs text-slate-400">Resolved Today</p>
              </div>
            </div>
          </Card>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.05 }}>
        <Card>
          <CardHeader title="Crisis Detection Center" description="Active and resolved brand crises" />
          <CardContent>
            <div className="space-y-4">
              {crisisAlerts.map((alert) => (
                <div key={alert.id} className={`p-4 rounded-xl border transition-all ${alert.isResolved ? 'bg-slate-800/20 border-slate-700/30 opacity-70' : 'bg-slate-800/40 border-slate-600/50'}`}>
                  <div className="flex items-start gap-4">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl flex-shrink-0 ${
                      alert.severity === 'critical' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                      alert.severity === 'warning' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                      'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    }`}>
                      <AlertTriangle size={20} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-semibold text-white">{alert.title}</h4>
                        <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                          alert.severity === 'critical' ? 'bg-red-500/20 text-red-400' :
                          alert.severity === 'warning' ? 'bg-amber-500/20 text-amber-400' :
                          'bg-blue-500/20 text-blue-400'
                        }`}>{alert.severity}</span>
                        {alert.isResolved && <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400">Resolved</span>}
                      </div>
                      <p className="text-xs text-slate-400 mt-1">{alert.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-[11px] text-slate-500 flex-wrap">
                        <span className="flex items-center gap-1"><MessageSquare size={11} /> {alert.mentionCount} mentions</span>
                        <span className="flex items-center gap-1"><Eye size={11} /> {(alert.reach / 1000).toFixed(0)}K reach</span>
                        <span className="flex items-center gap-1"><Clock size={11} /> {new Date(alert.detectedAt).toLocaleString()}</span>
                        <span>Source: {alert.source}</span>
                      </div>
                      <div className="mt-2.5">
                        <div className="flex items-center gap-2 text-[11px] text-slate-400 mb-1">
                          <span>Risk Score:</span>
                          <div className="flex-1 h-2 rounded-full bg-slate-800 overflow-hidden max-w-[200px]">
                            <div className={`h-full rounded-full transition-all ${
                              alert.riskScore > 70 ? 'bg-red-500' : alert.riskScore > 40 ? 'bg-amber-500' : 'bg-blue-500'
                            }`} style={{ width: `${alert.riskScore}%` }} />
                          </div>
                          <span className={`font-bold ${alert.riskScore > 70 ? 'text-red-400' : 'text-amber-400'}`}>{alert.riskScore}/100</span>
                        </div>
                      </div>
                      {!alert.isResolved && (
                        <div className="mt-3 p-3 rounded-lg bg-slate-900/60 border border-slate-700/50">
                          <p className="text-[11px] text-cyan-400 font-medium mb-1">🤖 AI Recommended Response:</p>
                          <p className="text-xs text-slate-300 leading-relaxed">{alert.recommendedAction}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}