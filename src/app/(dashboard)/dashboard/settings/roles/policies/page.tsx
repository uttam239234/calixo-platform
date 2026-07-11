"use client";

import { useMemo, useState } from "react";
import { Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { ModuleHeader } from "@/components/enterprise/module";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { Toggle } from "@/components/ui/Toggle";
import { useSettingsContext } from "@/features/settings/SettingsProvider";
import { useRoles } from "@/hooks/useRoles";
import { usePolicies } from "@/hooks/usePolicies";
import { buildRbacStatements, describePolicy } from "@/features/settings/roles/policySentences";
import type { PolicyConditionOperator, PolicyType } from "@/access/types";

type RuleKind = "device" | "time" | "region" | "plan";

const RULE_KIND_LABELS: Record<RuleKind, string> = {
  device: "Block admin actions on a device type",
  time: "Block approvals after a certain hour",
  region: "Restrict access to certain regions",
  plan: "Turn off AI for a subscription plan",
};

export default function PoliciesPage() {
  const { tenantContext, canManageRoles } = useSettingsContext();
  const organizationId = tenantContext.organizationId;
  const roles = useRoles(organizationId);
  const policies = usePolicies(organizationId);

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [creating, setCreating] = useState(false);
  const [ruleKind, setRuleKind] = useState<RuleKind>("device");
  const [hour, setHour] = useState(22);
  const [regions, setRegions] = useState("US, EU, CA, UK");
  const [plan, setPlan] = useState("trial");

  const rbacStatements = useMemo(() => buildRbacStatements(roles.roles, roles.permissionsByRole), [roles.roles, roles.permissionsByRole]);

  const handleCreate = async () => {
    const actorId = tenantContext.userId;
    if (ruleKind === "device") {
      await policies.createPolicy({ name: "Mobile Devices: No Admin Actions", description: "Blocks admin-level actions from mobile devices.", type: "device" as PolicyType, effect: "deny", conditions: [{ field: "action", operator: "eq" as PolicyConditionOperator, value: "admin" }, { field: "deviceType", operator: "eq" as PolicyConditionOperator, value: "mobile" }], actorId });
    } else if (ruleKind === "time") {
      await policies.createPolicy({ name: "After-Hours: No Approvals", description: `Blocks approvals after ${hour}:00.`, type: "time_based" as PolicyType, effect: "deny", conditions: [{ field: "action", operator: "eq" as PolicyConditionOperator, value: "approve" }, { field: "timeOfDayHour", operator: "gte" as PolicyConditionOperator, value: hour }], actorId });
    } else if (ruleKind === "region") {
      const list = regions.split(",").map(r => r.trim().toUpperCase()).filter(Boolean);
      await policies.createPolicy({ name: "Restricted Regions", description: `Only allows access from: ${list.join(", ")}.`, type: "location" as PolicyType, effect: "deny", conditions: [{ field: "region", operator: "exists" as PolicyConditionOperator, value: true }, { field: "region", operator: "not_in" as PolicyConditionOperator, value: list }], actorId });
    } else {
      await policies.createPolicy({ name: `${plan[0].toUpperCase()}${plan.slice(1)} Tier: No AI Execution`, description: `Turns off AI features for organizations on the ${plan} plan.`, type: "subscription" as PolicyType, effect: "deny", conditions: [{ field: "resourceType", operator: "eq" as PolicyConditionOperator, value: "ai" }, { field: "subscriptionTier", operator: "eq" as PolicyConditionOperator, value: plan }], actorId });
    }
    setCreating(false);
  };

  return (
    <div>
      <ModuleHeader
        title="Policies"
        description="Plain-language rules about who can do what."
        quickActions={
          canManageRoles && (
            <Button onClick={() => setCreating(true)}>
              <Plus size={16} />
              Create a Rule
            </Button>
          )
        }
      />

      <div className="mb-6 rounded-2xl border border-border bg-card p-5">
        <h3 className="mb-3 text-sm font-semibold text-foreground">Rules from your roles</h3>
        <ul className="space-y-2">
          {rbacStatements.map(statement => (
            <li key={statement.id} className="text-sm text-foreground">
              {statement.sentence}
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <h3 className="mb-3 text-sm font-semibold text-foreground">Custom rules</h3>
        {policies.policies.length === 0 ? (
          <p className="text-sm text-muted-foreground">No custom rules yet.</p>
        ) : (
          <ul className="space-y-3">
            {policies.policies.map(policy => (
              <li key={policy.id} className="flex items-start justify-between gap-3 rounded-xl border border-border p-3">
                <div className="min-w-0">
                  <p className="text-sm text-foreground">{describePolicy(policy)}</p>
                  {showAdvanced && (
                    <p className="mt-1 truncate text-xs text-muted-foreground">
                      {policy.effect} · priority {policy.priority} · {policy.conditions?.length ?? 0} condition{policy.conditions?.length === 1 ? "" : "s"}
                    </p>
                  )}
                </div>
                {canManageRoles && (
                  <div className="flex flex-shrink-0 items-center gap-2">
                    <Toggle checked={policy.isEnabled} onChange={enabled => (enabled ? policies.enablePolicy(policy.id, tenantContext.userId) : policies.disablePolicy(policy.id, tenantContext.userId))} label={`${policy.name} enabled`} />
                    <button onClick={() => policies.deletePolicy(policy.id, tenantContext.userId)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive" aria-label={`Delete ${policy.name}`}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}

        <button type="button" onClick={() => setShowAdvanced(v => !v)} className="mt-4 flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground">
          {showAdvanced ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          Advanced
        </button>
      </div>

      {creating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <h2 className="mb-4 text-lg font-semibold text-foreground">Create a Rule</h2>
            <div className="space-y-3">
              <div>
                <label className="label">What should this rule do?</label>
                <select className="input" value={ruleKind} onChange={e => setRuleKind(e.target.value as RuleKind)}>
                  {(Object.entries(RULE_KIND_LABELS) as [RuleKind, string][]).map(([kind, label]) => (
                    <option key={kind} value={kind}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              {ruleKind === "time" && <Input type="number" label="Hour (24h, e.g. 22 for 10pm)" value={hour} onChange={e => setHour(Number(e.target.value))} />}
              {ruleKind === "region" && <Input label="Allowed regions (comma separated)" value={regions} onChange={e => setRegions(e.target.value)} />}
              {ruleKind === "plan" && (
                <div>
                  <label className="label">Plan</label>
                  <select className="input" value={plan} onChange={e => setPlan(e.target.value)}>
                    <option value="trial">Trial</option>
                    <option value="starter">Starter</option>
                  </select>
                </div>
              )}
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setCreating(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreate}>Create</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
