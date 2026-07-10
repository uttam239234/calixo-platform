"use client";

import { useMemo, useState } from "react";
import { ModuleSettingsLayout, type SettingsSection } from "@/components/enterprise/module";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { useBrandMonitoring } from "@/features/brand/BrandMonitoringProvider";
import { getReputationSourceStatuses } from "@/core/reputation";
import { Save, X, Hash, Globe, MapPin, Radio, CheckCircle2 } from "lucide-react";

export function BrandSettings() {
  const { settings, addKeyword, removeKeyword, addCompetitor, removeCompetitor, saveThresholds, canManage } = useBrandMonitoring();
  const [newKeyword, setNewKeyword] = useState("");
  const [newCompetitor, setNewCompetitor] = useState("");
  const [thresholds, setThresholds] = useState(settings.alertThresholds);

  const sourceStatuses = useMemo(() => getReputationSourceStatuses(settings.trackedSources), [settings.trackedSources]);

  const sections: SettingsSection[] = [
    {
      id: "keywords",
      title: "Tracked Keywords",
      description: "Brand and product keywords to monitor",
      content: (
        <>
          <div className="flex flex-wrap gap-2">
            {settings.trackedKeywords.map((kw) => (
              <span key={kw} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-sm border border-primary/20">
                <Hash size={12} /> {kw}
                {canManage && (
                  <button onClick={() => removeKeyword(kw)} className="hover:text-destructive transition-colors ml-1"><X size={12} /></button>
                )}
              </span>
            ))}
          </div>
          {canManage && (
            <div className="mt-4 flex gap-2">
              <Input value={newKeyword} onChange={e => setNewKeyword(e.target.value)} placeholder="Add keyword..." className="bg-surface/60 border-border text-sm h-9" />
              <Button size="sm" className="h-9" onClick={() => { addKeyword(newKeyword); setNewKeyword(""); }}>Add</Button>
            </div>
          )}
        </>
      ),
    },
    {
      id: "competitors",
      title: "Tracked Competitors",
      description: "Competitor brands to compare against",
      content: (
        <>
          <div className="space-y-2">
            {settings.trackedCompetitors.map((comp) => (
              <div key={comp} className="flex items-center justify-between p-3 rounded-lg bg-surface/30 border border-border">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface text-xs font-bold text-primary">
                    {comp[0]}
                  </div>
                  <span className="text-sm text-foreground">{comp}</span>
                </div>
                {canManage && (
                  <button onClick={() => removeCompetitor(comp)} className="p-1 rounded-lg hover:bg-surface text-muted-foreground hover:text-destructive transition-colors">
                    <X size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
          {canManage && (
            <div className="mt-4 flex gap-2">
              <Input value={newCompetitor} onChange={e => setNewCompetitor(e.target.value)} placeholder="Add competitor..." className="bg-surface/60 border-border text-sm h-9" />
              <Button size="sm" className="h-9" onClick={() => { addCompetitor(newCompetitor); setNewCompetitor(""); }}>Add</Button>
            </div>
          )}
        </>
      ),
    },
    {
      id: "languages",
      title: "Monitored Languages",
      description: "Languages to include in tracking",
      content: (
        <div className="flex flex-wrap gap-2">
          {settings.trackedLanguages.map((lang) => (
            <span key={lang} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface/60 text-foreground text-sm border border-border">
              <Globe size={12} className="text-muted-foreground" /> {lang}
            </span>
          ))}
        </div>
      ),
    },
    {
      id: "countries",
      title: "Monitored Countries",
      description: "Geographic regions to track",
      content: (
        <div className="flex flex-wrap gap-2">
          {settings.trackedCountries.map((country) => (
            <span key={country} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface/60 text-foreground text-sm border border-border">
              <MapPin size={12} className="text-muted-foreground" /> {country}
            </span>
          ))}
        </div>
      ),
    },
    {
      id: "sources",
      title: "Monitored Sources",
      description: "Platforms and channels to track — status reflects the real Connector Platform where a connector exists",
      content: (
        <div className="flex flex-wrap gap-2">
          {sourceStatuses.map((source) => (
            <span key={source.source} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm border ${
              source.isLiveConnector ? 'bg-success/10 text-success border-success/20' : 'bg-surface/60 text-foreground border-border'
            }`}>
              {source.isLiveConnector ? <CheckCircle2 size={12} /> : <Radio size={12} className="text-muted-foreground" />}
              {source.source}
              <span className="text-[10px] text-muted-foreground">{source.isLiveConnector ? "connected" : "demo"}</span>
            </span>
          ))}
        </div>
      ),
    },
    {
      id: "thresholds",
      title: "Alert Thresholds",
      description: "Configure when alerts trigger",
      footer: canManage ? (
        <Button size="sm" className="gap-2 w-full" onClick={() => saveThresholds(thresholds)}><Save size={14} /> Save Thresholds</Button>
      ) : undefined,
      content: (
        <div className="space-y-4">
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">Mention Spike Threshold</label>
            <div className="flex items-center gap-3">
              <input type="range" min="50" max="500" value={thresholds.mentionSpike} onChange={e => setThresholds(t => ({ ...t, mentionSpike: Number(e.target.value) }))} disabled={!canManage} className="flex-1 accent-primary" />
              <span className="text-sm text-foreground font-bold tabular-nums w-12 text-right">{thresholds.mentionSpike}</span>
            </div>
            <p className="text-[10px] text-muted-foreground mt-0.5">Alert when mentions exceed this count in 1 hour</p>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">Sentiment Drop Threshold</label>
            <div className="flex items-center gap-3">
              <input type="range" min="5" max="50" value={thresholds.sentimentDrop} onChange={e => setThresholds(t => ({ ...t, sentimentDrop: Number(e.target.value) }))} disabled={!canManage} className="flex-1 accent-primary" />
              <span className="text-sm text-foreground font-bold tabular-nums w-12 text-right">{thresholds.sentimentDrop}%</span>
            </div>
            <p className="text-[10px] text-muted-foreground mt-0.5">Alert when sentiment drops by this percentage</p>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">Crisis Risk Score Threshold</label>
            <div className="flex items-center gap-3">
              <input type="range" min="30" max="90" value={thresholds.crisisScore} onChange={e => setThresholds(t => ({ ...t, crisisScore: Number(e.target.value) }))} disabled={!canManage} className="flex-1 accent-primary" />
              <span className="text-sm text-foreground font-bold tabular-nums w-12 text-right">{thresholds.crisisScore}</span>
            </div>
            <p className="text-[10px] text-muted-foreground mt-0.5">Alert when crisis risk score exceeds this threshold</p>
          </div>
        </div>
      ),
    },
  ];

  return (
    <ModuleSettingsLayout
      title="Brand Monitoring Settings"
      description="Configure tracking parameters and alert thresholds"
      sections={sections}
      onSave={() => saveThresholds(thresholds)}
    />
  );
}
