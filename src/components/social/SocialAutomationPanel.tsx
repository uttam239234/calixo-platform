"use client";

import { useState } from "react";
import Card from "@/components/dashboard/common/Card";
import { Button } from "@/components/ui/button";
import { Play, Plus, Trash2, Zap } from "lucide-react";
import { useSocial } from "@/features/social/SocialProvider";
import { useSocialAutomationRules } from "@/hooks/useSocialAutomationRules";
import type { SocialAutomationAction } from "@/core/social";
import type { AutomationCondition } from "@/core/platform/execution";

interface RuleTemplate {
  id: string;
  label: string;
  action: SocialAutomationAction;
  condition: (threshold: number) => AutomationCondition;
  describe: (threshold: number) => string;
  defaultThreshold: number;
}

const TEMPLATES: RuleTemplate[] = [
  {
    id: "publish-high-engagement-drafts",
    label: "Auto-publish high-potential drafts",
    action: "Publish",
    condition: threshold => ({ field: "likes", operator: "gte", value: threshold }),
    describe: threshold => `Publish any Draft post already showing ${threshold}+ likes (e.g. from an earlier test).`,
    defaultThreshold: 0,
  },
  {
    id: "cancel-stale-scheduled",
    label: "Cancel low-reach scheduled posts",
    action: "Cancel",
    condition: threshold => ({ field: "reach", operator: "lte", value: threshold }),
    describe: threshold => `Move any Scheduled post with projected reach at or below ${threshold} back to Draft for review.`,
    defaultThreshold: 0,
  },
];

/** Real automation, matching Ads Manager's pattern — condition-based rules that submit a real, tracked Execution via the Execution Platform rather than a bespoke scheduler. */
export function SocialAutomationPanel() {
  const { posts, tenantContext, canUpdate, showToast } = useSocial();
  const { rules, busyId, createRule, toggleActive, deleteRule, runRule } = useSocialAutomationRules(tenantContext.organizationId);
  const [showForm, setShowForm] = useState(false);
  const [templateId, setTemplateId] = useState(TEMPLATES[0].id);
  const [threshold, setThreshold] = useState(TEMPLATES[0].defaultThreshold);

  const template = TEMPLATES.find(t => t.id === templateId) ?? TEMPLATES[0];

  const handleCreate = async () => {
    if (!canUpdate) return;
    await createRule({ name: template.label, description: template.describe(threshold), action: template.action, condition: template.condition(threshold) });
    showToast(`Rule "${template.label}" created.`);
    setShowForm(false);
  };

  const handleRun = async (id: string, name: string) => {
    const result = await runRule(id, posts);
    showToast(`"${name}" matched ${result.matchedCount} post${result.matchedCount === 1 ? "" : "s"}.`);
  };

  return (
    <Card className="p-5" hover={false}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">Automation</p>
          <h2 className="mt-1 text-lg font-semibold text-foreground">Automation rules</h2>
        </div>
        {canUpdate && (
          <Button variant="outline" size="sm" onClick={() => setShowForm(v => !v)} className="border-border bg-surface text-foreground">
            <Plus size={14} /> New rule
          </Button>
        )}
      </div>

      {showForm && (
        <div className="mt-4 space-y-3 rounded-2xl border border-border bg-surface/40 p-4">
          <select
            className="h-9 w-full rounded-xl border border-border bg-surface/60 px-3 text-sm text-foreground outline-none"
            value={templateId}
            onChange={event => {
              setTemplateId(event.target.value);
              setThreshold(TEMPLATES.find(t => t.id === event.target.value)?.defaultThreshold ?? 0);
            }}
          >
            {TEMPLATES.map(t => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Threshold</span>
            <input type="number" min="0" value={threshold} onChange={event => setThreshold(Number(event.target.value))} className="h-9 w-24 rounded-xl border border-border bg-surface/60 px-3 text-sm text-foreground outline-none" />
          </div>
          <p className="text-xs text-muted-foreground">{template.describe(threshold)}</p>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setShowForm(false)} className="text-muted-foreground">
              Cancel
            </Button>
            <Button size="sm" onClick={handleCreate} className="bg-primary text-primary-foreground hover:bg-primary/90">
              Create rule
            </Button>
          </div>
        </div>
      )}

      {rules.length === 0 ? (
        <div className="mt-4 flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-8 text-center">
          <Zap size={22} className="text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">No automation rules yet.</p>
          <p className="mt-1 text-xs text-muted-foreground">Create a rule to automatically publish or cancel posts that meet a condition.</p>
        </div>
      ) : (
        <div className="mt-4 space-y-2">
          {rules.map(rule => (
            <div key={rule.id} className="flex items-start justify-between gap-3 rounded-xl border border-border bg-surface/40 p-3">
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground">{rule.name}</p>
                <p className="text-xs text-muted-foreground">{rule.description}</p>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  {rule.runCount} run{rule.runCount === 1 ? "" : "s"}
                  {rule.lastRunAt ? ` · last ${new Date(rule.lastRunAt).toLocaleString()}` : ""} · {rule.isActive ? "Active" : "Inactive"}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1.5">
                <button onClick={() => handleRun(rule.id, rule.name)} disabled={busyId === rule.id || !canUpdate} className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-primary hover:bg-primary/10 disabled:opacity-40">
                  <Play size={12} /> Run now
                </button>
                <button onClick={() => toggleActive(rule.id, !rule.isActive)} disabled={busyId === rule.id || !canUpdate} className="rounded-lg px-2 py-1 text-xs text-muted-foreground hover:bg-surface hover:text-foreground disabled:opacity-40">
                  {rule.isActive ? "Deactivate" : "Activate"}
                </button>
                <button onClick={() => deleteRule(rule.id)} disabled={!canUpdate} className="text-muted-foreground hover:text-destructive disabled:opacity-40">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
