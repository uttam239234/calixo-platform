"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Play, Plus, Trash2, Zap } from "lucide-react";
import { useCampaigns } from "@/features/ads/CampaignProvider";
import { useAdsAutomationRules } from "@/hooks/useAdsAutomationRules";
import type { AdsAutomationAction } from "@/core/ads";
import type { AutomationCondition } from "@/core/platform/execution";

interface RuleTemplate {
  id: string;
  label: string;
  action: AdsAutomationAction;
  condition: (threshold: number) => AutomationCondition;
  describe: (threshold: number) => string;
  defaultThreshold: number;
}

const TEMPLATES: RuleTemplate[] = [
  {
    id: "pause-underperformers",
    label: "Pause underperforming campaigns",
    action: "Pause",
    condition: threshold => ({ field: "roas", operator: "lt", value: threshold }),
    describe: threshold => `Pause any Running campaign with ROAS below ${threshold}x.`,
    defaultThreshold: 2,
  },
  {
    id: "resume-recovering",
    label: "Resume recovering campaigns",
    action: "Resume",
    condition: threshold => ({ field: "roas", operator: "gte", value: threshold }),
    describe: threshold => `Resume any Paused campaign with ROAS at or above ${threshold}x.`,
    defaultThreshold: 5,
  },
  {
    id: "boost-winners",
    label: "Boost budget on winners",
    action: "BudgetIncrease",
    condition: threshold => ({ field: "roas", operator: "gte", value: threshold }),
    describe: threshold => `Increase budget 10% on any Running campaign with ROAS at or above ${threshold}x.`,
    defaultThreshold: 6,
  },
];

export function AdsAutomationPanel() {
  const { campaigns, tenantContext, canUpdate, showToast } = useCampaigns();
  const { rules, busyId, createRule, toggleActive, deleteRule, runRule } = useAdsAutomationRules(tenantContext.organizationId);
  const [showForm, setShowForm] = useState(false);
  const [templateId, setTemplateId] = useState(TEMPLATES[0].id);
  const [threshold, setThreshold] = useState(TEMPLATES[0].defaultThreshold);

  const template = TEMPLATES.find(t => t.id === templateId) ?? TEMPLATES[0];

  const handleCreate = async () => {
    if (!canUpdate) return;
    await createRule({
      name: template.label,
      description: template.describe(threshold),
      action: template.action,
      condition: template.condition(threshold),
    });
    showToast(`Rule "${template.label}" created.`);
    setShowForm(false);
  };

  const handleRun = async (id: string, name: string) => {
    const result = await runRule(id, campaigns);
    showToast(`"${name}" matched ${result.matchedCount} campaign${result.matchedCount === 1 ? "" : "s"}.`);
  };

  return (
    <Card>
      <CardHeader
        title="Automation Rules"
        description="Condition-based rules that act on real campaigns via the Execution Platform"
        action={
          canUpdate && (
            <Button variant="outline" size="sm" onClick={() => setShowForm(v => !v)}>
              <Plus size={14} /> New Rule
            </Button>
          )
        }
      />
      <CardContent>
        {showForm && (
          <div className="mb-4 space-y-3 rounded-2xl border border-border/50 bg-card/50 p-4">
            <select className="input h-9 text-sm" value={templateId} onChange={e => { setTemplateId(e.target.value); setThreshold(TEMPLATES.find(t => t.id === e.target.value)?.defaultThreshold ?? 2); }}>
              {TEMPLATES.map(t => (
                <option key={t.id} value={t.id}>{t.label}</option>
              ))}
            </select>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">ROAS threshold</span>
              <input type="number" step="0.5" min="0" value={threshold} onChange={e => setThreshold(Number(e.target.value))} className="input h-9 w-24 text-sm" />
            </div>
            <p className="text-xs text-muted-foreground">{template.describe(threshold)}</p>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button size="sm" onClick={handleCreate}>Create Rule</Button>
            </div>
          </div>
        )}

        {rules.length === 0 ? (
          <EmptyState icon={<Zap size={32} />} title="No automation rules yet" description="Create a rule to automatically pause, resume, or boost budget on campaigns that meet a condition." />
        ) : (
          <div className="space-y-2">
            {rules.map(rule => (
              <div key={rule.id} className="flex items-start justify-between gap-3 rounded-xl border border-border/50 bg-background/60 px-4 py-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground">{rule.name}</p>
                  <p className="text-xs text-muted-foreground">{rule.description}</p>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    {rule.runCount} run{rule.runCount === 1 ? "" : "s"}{rule.lastRunAt ? ` · last ${new Date(rule.lastRunAt).toLocaleString()}` : ""} · {rule.isActive ? "Active" : "Inactive"}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  <Button variant="outline" size="sm" className="h-7 px-2 text-xs" disabled={busyId === rule.id || !canUpdate} onClick={() => handleRun(rule.id, rule.name)}>
                    <Play size={12} /> Run now
                  </Button>
                  <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" disabled={busyId === rule.id || !canUpdate} onClick={() => toggleActive(rule.id, !rule.isActive)}>
                    {rule.isActive ? "Deactivate" : "Activate"}
                  </Button>
                  <button onClick={() => deleteRule(rule.id)} disabled={!canUpdate} className="text-muted-foreground hover:text-destructive transition-colors disabled:opacity-40">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
