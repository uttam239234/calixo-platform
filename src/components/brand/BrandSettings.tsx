"use client";

import { ModuleSettingsLayout, type SettingsSection } from "@/components/enterprise/module";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { brandSettings } from "@/lib/brand-data";
import { Save, Plus, X, Hash, Globe, MapPin, Radio } from "lucide-react";

export function BrandSettings() {
  const sections: SettingsSection[] = [
    {
      id: "keywords",
      title: "Tracked Keywords",
      description: "Brand and product keywords to monitor",
      action: (
        <Button size="sm" variant="outline" className="gap-1 h-8 text-xs">
          <Plus size={12} /> Add
        </Button>
      ),
      content: (
        <>
          <div className="flex flex-wrap gap-2">
            {brandSettings.trackedKeywords.map((kw) => (
              <span key={kw} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 text-sm border border-cyan-500/20">
                <Hash size={12} /> {kw}
                <button className="hover:text-red-400 transition-colors ml-1"><X size={12} /></button>
              </span>
            ))}
          </div>
          <div className="mt-4 flex gap-2">
            <Input placeholder="Add keyword..." className="bg-slate-900/60 border-slate-700/50 text-sm h-9" />
            <Button size="sm" className="h-9">Add</Button>
          </div>
        </>
      ),
    },
    {
      id: "competitors",
      title: "Tracked Competitors",
      description: "Competitor brands to compare against",
      action: (
        <Button size="sm" variant="outline" className="gap-1 h-8 text-xs">
          <Plus size={12} /> Add
        </Button>
      ),
      content: (
        <div className="space-y-2">
          {brandSettings.trackedCompetitors.map((comp) => (
            <div key={comp} className="flex items-center justify-between p-3 rounded-lg bg-slate-800/30 border border-slate-700/40">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-700/50 text-xs font-bold text-cyan-400">
                  {comp[0]}
                </div>
                <span className="text-sm text-slate-200">{comp}</span>
              </div>
              <button className="p-1 rounded-lg hover:bg-slate-700/50 text-slate-500 hover:text-red-400 transition-colors">
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      ),
    },
    {
      id: "languages",
      title: "Monitored Languages",
      description: "Languages to include in tracking",
      content: (
        <div className="flex flex-wrap gap-2">
          {brandSettings.trackedLanguages.map((lang) => (
            <span key={lang} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/50 text-slate-300 text-sm border border-slate-700/50">
              <Globe size={12} className="text-slate-500" /> {lang}
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
          {brandSettings.trackedCountries.map((country) => (
            <span key={country} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/50 text-slate-300 text-sm border border-slate-700/50">
              <MapPin size={12} className="text-slate-500" /> {country}
            </span>
          ))}
        </div>
      ),
    },
    {
      id: "sources",
      title: "Monitored Sources",
      description: "Platforms and channels to track",
      content: (
        <div className="flex flex-wrap gap-2">
          {brandSettings.trackedSources.map((source) => (
            <span key={source} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/50 text-slate-300 text-sm border border-slate-700/50">
              <Radio size={12} className="text-slate-500" /> {source}
            </span>
          ))}
        </div>
      ),
    },
    {
      id: "thresholds",
      title: "Alert Thresholds",
      description: "Configure when alerts trigger",
      footer: (
        <Button size="sm" className="gap-2 w-full"><Save size={14} /> Save Thresholds</Button>
      ),
      content: (
        <div className="space-y-4">
          <div>
            <label className="text-xs text-slate-400 mb-1.5 block">Mention Spike Threshold</label>
            <div className="flex items-center gap-3">
              <input type="range" min="50" max="500" defaultValue={brandSettings.alertThresholds.mentionSpike} className="flex-1 accent-cyan-500" />
              <span className="text-sm text-white font-bold tabular-nums w-12 text-right">{brandSettings.alertThresholds.mentionSpike}</span>
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">Alert when mentions exceed this count in 1 hour</p>
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1.5 block">Sentiment Drop Threshold</label>
            <div className="flex items-center gap-3">
              <input type="range" min="5" max="50" defaultValue={brandSettings.alertThresholds.sentimentDrop} className="flex-1 accent-cyan-500" />
              <span className="text-sm text-white font-bold tabular-nums w-12 text-right">{brandSettings.alertThresholds.sentimentDrop}%</span>
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">Alert when sentiment drops by this percentage</p>
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1.5 block">Crisis Risk Score Threshold</label>
            <div className="flex items-center gap-3">
              <input type="range" min="30" max="90" defaultValue={brandSettings.alertThresholds.crisisScore} className="flex-1 accent-cyan-500" />
              <span className="text-sm text-white font-bold tabular-nums w-12 text-right">{brandSettings.alertThresholds.crisisScore}</span>
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">Alert when crisis risk score exceeds this threshold</p>
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
      onSave={() => {}}
    />
  );
}