"use client";

import { motion } from "framer-motion";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/button";
import { alertRules, crisisAlerts } from "@/lib/brand-data";
import { Bell, AlertTriangle, Info, Mail, MessageSquare, Smartphone, ToggleLeft, ToggleRight, Plus } from "lucide-react";

export function BrandAlerts() {
  const recentAlerts = crisisAlerts.slice(0, 4);
  
  const channelIcons: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
    email: Mail,
    in_app: Bell,
    slack: MessageSquare,
    push: Smartphone,
    sms: Smartphone,
  };

  return (
    <div className="space-y-6 pb-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20 border border-amber-500/30">
              <Bell size={20} className="text-amber-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Alerts Center</h2>
              <p className="text-sm text-slate-400">Configure and monitor brand alerts</p>
            </div>
          </div>
          <Button size="sm" className="gap-2">
            <Plus size={14} /> New Alert Rule
          </Button>
        </div>
      </motion.div>

      {/* Recent Alerts */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.05 }}>
        <Card>
          <CardHeader title="Recent Alerts" description={`${recentAlerts.filter(a => !a.isResolved).length} unread`} />
          <CardContent>
            <div className="space-y-3">
              {recentAlerts.map((alert) => (
                <div key={alert.id} className={`flex items-start gap-3 p-3 rounded-xl border transition-all ${
                  alert.isResolved ? 'bg-slate-800/20 border-slate-700/30' : 'bg-slate-800/40 border-slate-600/50'
                }`}>
                  <div className={`flex h-8 w-8 items-center justify-center rounded-lg flex-shrink-0 ${
                    alert.severity === 'critical' ? 'bg-red-500/20 text-red-400' :
                    alert.severity === 'warning' ? 'bg-amber-500/20 text-amber-400' :
                    'bg-blue-500/20 text-blue-400'
                  }`}>
                    {alert.severity === 'critical' ? <AlertTriangle size={16} /> :
                     alert.severity === 'warning' ? <Bell size={16} /> :
                     <Info size={16} />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-white">{alert.title}</p>
                      <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                        alert.severity === 'critical' ? 'bg-red-500/20 text-red-400' :
                        alert.severity === 'warning' ? 'bg-amber-500/20 text-amber-400' :
                        'bg-blue-500/20 text-blue-400'
                      }`}>{alert.severity}</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{alert.description}</p>
                    <p className="text-[10px] text-slate-500 mt-1">Risk Score: {alert.riskScore} • {alert.mentionCount} mentions • {(alert.reach / 1000).toFixed(0)}K reach</p>
                  </div>
                  <span className="text-[10px] text-slate-500 whitespace-nowrap">{new Date(alert.detectedAt).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
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
                <div key={rule.id} className="flex items-center justify-between p-4 rounded-xl bg-slate-800/30 border border-slate-700/40 hover:border-slate-600/60 transition-all">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-semibold text-white">{rule.name}</h4>
                      <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
                        rule.enabled ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-500/10 text-slate-500'
                      }`}>{rule.enabled ? 'Active' : 'Disabled'}</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{rule.description}</p>
                    <div className="flex items-center gap-3 mt-2 text-[10px] text-slate-500">
                      <span className="font-medium">Threshold: {rule.threshold}</span>
                      <div className="flex items-center gap-1">
                        {rule.channels.map(ch => {
                          const ChIcon = channelIcons[ch] || Bell;
                          return <ChIcon key={ch} size={11} className="text-slate-500" />;
                        })}
                      </div>
                    </div>
                  </div>
                  <button className="flex-shrink-0 p-1">
                    {rule.enabled ? (
                      <ToggleRight size={24} className="text-emerald-400" />
                    ) : (
                      <ToggleLeft size={24} className="text-slate-600" />
                    )}
                  </button>
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
                  <div key={channel.name} className={`p-3 rounded-xl border ${channel.enabled ? 'bg-slate-800/30 border-slate-600/50' : 'bg-slate-800/10 border-slate-700/30 opacity-60'}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <Icon size={16} className={channel.enabled ? 'text-cyan-400' : 'text-slate-600'} />
                      <span className="text-sm font-medium text-white">{channel.name}</span>
                    </div>
                    <p className="text-[11px] text-slate-500">{channel.description}</p>
                    <span className={`text-[10px] font-medium mt-2 inline-block ${channel.enabled ? 'text-emerald-400' : 'text-slate-500'}`}>
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