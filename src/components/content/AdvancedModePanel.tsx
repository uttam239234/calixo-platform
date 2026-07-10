"use client";

import { useMemo, useState } from "react";
import { ChevronDown, ChevronUp, FileText, GitCompare, Megaphone, ShieldCheck } from "lucide-react";
import { adsPlatformAPI } from "@/core/ads";
import { promptTemplates } from "@/lib/prompt-templates";

interface AdvancedModePanelProps {
  kind: "creative" | "content";
  campaignId?: string;
  onCampaignChange: (id: string | undefined) => void;
  strictBrandRules: boolean;
  onStrictBrandRulesChange: (value: boolean) => void;
  abMode: boolean;
  onAbModeChange: (value: boolean) => void;
  onSelectTemplate?: (promptText: string) => void;
}

/**
 * Shared Advanced Mode drawer for both Studios — hidden by default, opt-in via the Simple/
 * Advanced toggle in `ContentStudioHeader`. Covers the brief's Advanced Mode list: prompt editing
 * (the Simple Mode objective textarea stays editable here, no duplicate control), templates,
 * campaign linking, brand rules, and A/B versions. Localization and workflow routing live on the
 * result screen (they act on an already-generated output, not a pre-generation setting).
 */
export function AdvancedModePanel({ kind, campaignId, onCampaignChange, strictBrandRules, onStrictBrandRulesChange, abMode, onAbModeChange, onSelectTemplate }: AdvancedModePanelProps) {
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const campaigns = useMemo(() => adsPlatformAPI.listCampaigns(), []);

  return (
    <div className="mx-auto max-w-2xl space-y-4 rounded-2xl border border-dashed border-primary/30 bg-primary/[0.03] p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-primary">Advanced Mode</p>

      {kind === "content" && onSelectTemplate && (
        <div>
          <button onClick={() => setTemplatesOpen(v => !v)} className="flex w-full items-center justify-between rounded-xl border border-border bg-surface/60 px-3.5 py-2.5 text-sm text-foreground">
            <span className="flex items-center gap-2">
              <FileText size={15} className="text-muted-foreground" /> Start from a template
            </span>
            {templatesOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </button>
          {templatesOpen && (
            <div className="mt-2 max-h-56 space-y-1 overflow-y-auto rounded-xl border border-border bg-surface/40 p-2">
              {promptTemplates.slice(0, 15).map(template => (
                <button
                  key={template.id}
                  onClick={() => {
                    onSelectTemplate(template.prompt);
                    setTemplatesOpen(false);
                  }}
                  className="block w-full rounded-lg px-3 py-2 text-left text-sm text-muted-foreground hover:bg-surface/70 hover:text-foreground"
                >
                  <span className="block font-medium text-foreground">{template.name}</span>
                  <span className="block truncate text-xs">{template.description}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <div>
        <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-foreground">
          <Megaphone size={15} className="text-muted-foreground" /> Link to a campaign
        </label>
        <select
          value={campaignId ?? ""}
          onChange={e => onCampaignChange(e.target.value || undefined)}
          className="w-full rounded-xl border border-border bg-surface/60 px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-primary/40"
        >
          <option value="">No campaign</option>
          {campaigns.map(campaign => (
            <option key={campaign.id} value={campaign.id}>
              {campaign.name}
            </option>
          ))}
        </select>
      </div>

      <label className="flex items-center justify-between rounded-xl border border-border bg-surface/40 px-3.5 py-2.5 text-sm text-foreground">
        <span className="flex items-center gap-2">
          <ShieldCheck size={15} className="text-muted-foreground" /> Strictly enforce brand rules
        </span>
        <input type="checkbox" checked={strictBrandRules} onChange={e => onStrictBrandRulesChange(e.target.checked)} className="h-4 w-4 accent-primary" />
      </label>

      <label className="flex items-center justify-between rounded-xl border border-border bg-surface/40 px-3.5 py-2.5 text-sm text-foreground">
        <span className="flex items-center gap-2">
          <GitCompare size={15} className="text-muted-foreground" /> Generate an A/B pair
        </span>
        <input type="checkbox" checked={abMode} onChange={e => onAbModeChange(e.target.checked)} className="h-4 w-4 accent-primary" />
      </label>
    </div>
  );
}
