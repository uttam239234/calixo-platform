"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/button";
import { useBrandMonitoring } from "@/features/brand/BrandMonitoringProvider";
import type { AlertRuleType } from "@/core/reputation";
import { Bell, AlertTriangle, Info, Mail, MessageSquare, Smartphone, ToggleLeft, ToggleRight, Plus, Trash2 } from "lucide-react";

const RULE_TYPE_LABEL: Record<AlertRuleType, string> = {
  mention_spike: "Mention Spike",
  sentiment_drop: "Sentiment Drop",
  competitor_activity: "Competitor Activity",
  crisis_detection: "Crisis Detection",
  keyword_match: "Keyword Match",
};

export function BrandAlerts() {
  const { crisisAlerts, alertRules, createAlertRule, toggleAlertRule, deleteAlertRule, canManage } = useBrandMonitoring();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState<AlertRuleType>("mention_spike");
  const [threshold, setThreshold] = useState("");

  const recentAlerts = crisisAlerts.slice(0, 4);

  const channelIcons: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
    email: Mail,
    in_app: Bell,
    slack: MessageSquare,
    push: Smartphone,
    sms: Smartphone,
  };

  const handleCreate = () => {
    if (!name.trim() || !threshold.trim()) return;
    createAlertRule({ name: name.trim(), description: `Custom rule: ${RULE_TYPE_LABEL[type]}`, type, enabled: true, threshold: threshold.trim(), channels: ["in_app"] });
    setName("");
    setThreshold("");
    setShowForm(false);
  };

  return (
    <div className="space-y-6 pb-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-warning/20 border border-warning/30">
              <Bell size={20} className="text-warning" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">Alerts Center</h2>
              <p className="text-sm text-muted-foreground">Configure and monitor brand alerts</p>
            </div>
          </div>
          {canManage && (
            <Button size="sm" className="gap-2" onClick={() => setShowForm(v => !v)}>
              <Plus size={14} /> New Alert Rule
            </Button>
          )}
        </div>
      </motion.div>

      {showForm && (
        <Card>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-3">
              <input value={name} onChange={e => setName(e.target.value)} placeholder="Rule name" className="h-9 rounded-xl border border-border bg-surface/60 px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground" />
              <select value={type} onChange={e => setType(e.target.value as AlertRuleType)} className="h-9 rounded-xl border border-border bg-surface/60 px-3 text-sm text-foreground outline-none">
                {(Object.keys(RULE_TYPE_LABEL) as AlertRuleType[]).map(key => (
                  <option key={key} value={key}>{RULE_TYPE_LABEL[key]}</option>
                ))}
              </select>
              <input value={threshold} onChange={e => setThreshold(e.target.value)} placeholder="Threshold (e.g. 20% increase in 1 hour)" className="h-9 rounded-xl border border-border bg-surface/60 px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground" />
            </div>
            <div className="mt-3 flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={() => setShowForm(false)} className="text-muted-foreground">Cancel</Button>
              <Button size="sm" onClick={handleCreate}>Create rule</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Alerts */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.05 }}>
        <Card>
          <CardHeader title="Recent Alerts" description={`${recentAlerts.filter(a => !a.isResolved).length} unread`} />
          <CardContent>
            {recentAlerts.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No alerts detected in tracked mentions.</p>
            ) : (
              <div className="space-y-3">
                {recentAlerts.map((alert) => (
                  <div key={alert.id} className={`flex items-start gap-3 p-3 rounded-xl border transition-all ${
                    alert.isResolved ? 'bg-surface/20 border-border/70' : 'bg-surface/40 border-border'
                  }`}>
                    <div className={`flex h-8 w-8 items-center justify-center rounded-lg flex-shrink-0 ${
                      alert.severity === 'critical' ? 'bg-destructive/20 text-destructive' :
                      alert.severity === 'warning' ? 'bg-warning/20 text-warning' :
                      'bg-info/20 text-info'
                    }`}>
                      {alert.severity === 'critical' ? <AlertTriangle size={16} /> :
                       alert.severity === 'warning' ? <Bell size={16} /> :
                       <Info size={16} />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-foreground">{alert.title}</p>
                        <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                          alert.severity === 'critical' ? 'bg-destructive/20 text-destructive' :
                          alert.severity === 'warning' ? 'bg-warning/20 text-warning' :
                          'bg-info/20 text-info'
                        }`}>{alert.severity}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{alert.description}</p>
                      <p className="text-[10px] text-muted-foreground mt-1">Risk Score: {alert.riskScore} • {alert.mentionCount} mentions • {(alert.reach / 1000).toFixed(0)}K reach</p>
                    </div>
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap">{new Date(alert.detectedAt).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Alert Rules */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.1 }}>
        <Card>
          <CardHeader title="Alert Rules" description="Configure automated alert triggers" />
          <CardContent>
            <div className="space-y-3">
              {alertRules.map((rule) => (
                <div key={rule.id} className="flex items-center justify-between p-4 rounded-xl bg-surface/30 border border-border hover:border-primary/30 transition-all">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-semibold text-foreground">{rule.name}</h4>
                      <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
                        rule.enabled ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'
                      }`}>{rule.enabled ? 'Active' : 'Disabled'}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{rule.description}</p>
                    <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground">
                      <span className="font-medium">Threshold: {rule.threshold}</span>
                      <div className="flex items-center gap-1">
                        {rule.channels.map(ch => {
                          const ChIcon = channelIcons[ch] || Bell;
                          return <ChIcon key={ch} size={11} className="text-muted-foreground" />;
                        })}
                      </div>
                    </div>
                  </div>
                  {canManage && (
                    <div className="flex shrink-0 items-center gap-1">
                      <button onClick={() => toggleAlertRule(rule.id, !rule.enabled)} className="p-1">
                        {rule.enabled ? (
                          <ToggleRight size={24} className="text-success" />
                        ) : (
                          <ToggleLeft size={24} className="text-muted-foreground" />
                        )}
                      </button>
                      <button onClick={() => deleteAlertRule(rule.id)} className="p-1 text-muted-foreground hover:text-destructive">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Notification Settings Summary */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.15 }}>
        <Card>
          <CardHeader title="Notification Channels" description="Where alerts are delivered" />
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { name: 'In-App', icon: Bell, enabled: true, description: 'Dashboard notifications' },
                { name: 'Email', icon: Mail, enabled: true, description: 'sent to admin@calixo.io' },
                { name: 'Slack', icon: MessageSquare, enabled: true, description: '#brand-alerts channel' },
                { name: 'SMS', icon: Smartphone, enabled: false, description: 'Critical alerts only' },
              ].map((channel) => {
                const Icon = channel.icon;
                return (
                  <div key={channel.name} className={`p-3 rounded-xl border ${channel.enabled ? 'bg-surface/30 border-border' : 'bg-surface/10 border-border/50 opacity-60'}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <Icon size={16} className={channel.enabled ? 'text-primary' : 'text-muted-foreground'} />
                      <span className="text-sm font-medium text-foreground">{channel.name}</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground">{channel.description}</p>
                    <span className={`text-[10px] font-medium mt-2 inline-block ${channel.enabled ? 'text-success' : 'text-muted-foreground'}`}>
                      {channel.enabled ? '● Active' : '○ Disabled'}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
