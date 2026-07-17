"use client";

import { useState } from "react";
import { Pencil, Copy, Ban, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { SimpleDialog } from "@/components/settings/users/SimpleDialog";
import { UndoToast } from "@/features/platform-admin/UndoToast";
import { usePlans, type PlanRow } from "@/features/platform-admin/plans/usePlans";
import type { SubscriptionTier } from "@/core/platform/subscription";

export default function PlansPage() {
  const { plans, updatePrice, updateIncludedCredits, setActive, duplicate } = usePlans();
  const [editing, setEditing] = useState<PlanRow | null>(null);
  const [duplicating, setDuplicating] = useState<PlanRow | null>(null);
  const [confirmDisable, setConfirmDisable] = useState<PlanRow | null>(null);
  const [undo, setUndo] = useState<{ token: string; message: string; windowMs: number } | null>(null);

  const renderCard = (plan: PlanRow) => (
    <div key={plan.tier} className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-lg font-bold text-foreground">{plan.definition.label}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{plan.definition.isActive ? "Active" : "Disabled"}</p>
        </div>
        {plan.definition.isActive ? (
          <span className="rounded-full bg-success/10 px-2 py-0.5 text-xs font-semibold text-success">Active</span>
        ) : (
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground">Disabled</span>
        )}
      </div>

      <div className="mt-4 space-y-1 text-sm">
        <p className="text-foreground">
          <span className="font-semibold">${plan.pricingRule?.monthlyPrice ?? 0}</span>
          <span className="text-muted-foreground">/mo · ${plan.pricingRule?.annualPrice ?? 0}/yr</span>
        </p>
        <p className="text-muted-foreground">{plan.definition.limits.aiCredits.toLocaleString()} included AI credits</p>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={() => setEditing(plan)}>
          <Pencil size={13} />
          Edit
        </Button>
        <Button variant="outline" size="sm" onClick={() => setDuplicating(plan)}>
          <Copy size={13} />
          Duplicate
        </Button>
        {plan.definition.isActive ? (
          <Button variant="outline" size="sm" onClick={() => setConfirmDisable(plan)}>
            <Ban size={13} />
            Disable
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              const result = await setActive(plan.tier, true);
              if (result.undoToken) setUndo({ token: result.undoToken, message: `${plan.definition.label} re-enabled.`, windowMs: result.undoWindowMs ?? 0 });
            }}
          >
            <CheckCircle2 size={13} />
            Enable
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <div>
      <p className="mb-4 text-sm text-muted-foreground">Every change here updates Billing, Subscriptions, and the Upgrade Center immediately — no deploy required.</p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{plans.map(renderCard)}</div>

      {editing && (
        <EditPlanDialog
          plan={editing}
          onClose={() => setEditing(null)}
          onSave={async (monthlyPrice, annualPrice, aiCredits) => {
            const priceResult = await updatePrice(editing.tier, monthlyPrice, annualPrice);
            if (priceResult.error) return { error: priceResult.error };
            const creditsResult = await updateIncludedCredits(editing.tier, aiCredits);
            if (creditsResult.error) return { error: creditsResult.error };
            const result = creditsResult.undoToken ? creditsResult : priceResult;
            if (result.undoToken) setUndo({ token: result.undoToken, message: `${editing.definition.label} updated.`, windowMs: result.undoWindowMs ?? 0 });
            setEditing(null);
            return {};
          }}
        />
      )}

      {duplicating && (
        <DuplicatePlanDialog
          plan={duplicating}
          allTiers={plans.map(p => p.tier)}
          onClose={() => setDuplicating(null)}
          onDuplicate={async destination => {
            const result = await duplicate(duplicating.tier, destination);
            if (result.error) return { error: result.error };
            setDuplicating(null);
            return {};
          }}
        />
      )}

      {confirmDisable && (
        <SimpleDialog
          title={`Disable ${confirmDisable.definition.label}?`}
          description="Customers on this plan keep their access, but it will no longer be offered as an upgrade target. You can undo this for 5 minutes."
          onClose={() => setConfirmDisable(null)}
        >
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setConfirmDisable(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                const result = await setActive(confirmDisable.tier, false);
                if (result.undoToken) setUndo({ token: result.undoToken, message: `${confirmDisable.definition.label} disabled.`, windowMs: result.undoWindowMs ?? 0 });
                setConfirmDisable(null);
              }}
            >
              Disable Plan
            </Button>
          </div>
        </SimpleDialog>
      )}

      {undo && <UndoToast token={undo.token} message={undo.message} windowMs={undo.windowMs} onDismiss={() => setUndo(null)} onUndo={() => setUndo(null)} />}
    </div>
  );
}

function EditPlanDialog({
  plan,
  onClose,
  onSave,
}: {
  plan: PlanRow;
  onClose: () => void;
  onSave: (monthlyPrice: number, annualPrice: number, aiCredits: number) => Promise<{ error?: string }>;
}) {
  const [monthlyPrice, setMonthlyPrice] = useState(String(plan.pricingRule?.monthlyPrice ?? 0));
  const [annualPrice, setAnnualPrice] = useState(String(plan.pricingRule?.annualPrice ?? 0));
  const [aiCredits, setAiCredits] = useState(String(plan.definition.limits.aiCredits));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setSaving(true);
    setError(null);
    const result = await onSave(Number(monthlyPrice) || 0, Number(annualPrice) || 0, Number(aiCredits) || 0);
    setSaving(false);
    if (result.error) setError(result.error);
  }

  return (
    <SimpleDialog title={`Edit ${plan.definition.label}`} onClose={onClose}>
      <div className="space-y-3">
        <Input label="Monthly Price ($)" type="number" min={0} value={monthlyPrice} onChange={e => setMonthlyPrice(e.target.value)} />
        <Input label="Annual Price ($)" type="number" min={0} value={annualPrice} onChange={e => setAnnualPrice(e.target.value)} />
        <Input label="Included AI Credits / month" type="number" min={0} value={aiCredits} onChange={e => setAiCredits(e.target.value)} />
      </div>
      {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
      <div className="mt-5 flex justify-end gap-2">
        <Button variant="outline" onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button disabled={saving} loading={saving} onClick={handleSave}>
          Save Changes
        </Button>
      </div>
    </SimpleDialog>
  );
}

function DuplicatePlanDialog({
  plan,
  allTiers,
  onClose,
  onDuplicate,
}: {
  plan: PlanRow;
  allTiers: SubscriptionTier[];
  onClose: () => void;
  onDuplicate: (destination: SubscriptionTier) => Promise<{ error?: string }>;
}) {
  const destinations = allTiers.filter(t => t !== plan.tier);
  const [destination, setDestination] = useState<SubscriptionTier>(destinations[0]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDuplicate() {
    setSaving(true);
    setError(null);
    const result = await onDuplicate(destination);
    setSaving(false);
    if (result.error) setError(result.error);
  }

  return (
    <SimpleDialog title={`Duplicate ${plan.definition.label}`} description="Plans are a fixed set of slots — pick another slot to copy this plan's price, credits, and limits into." onClose={onClose}>
      <div className="space-y-3">
        <label className="label">Destination plan slot</label>
        <select value={destination} onChange={e => setDestination(e.target.value as SubscriptionTier)} className="input w-full">
          {destinations.map(tier => (
            <option key={tier} value={tier}>
              {tier}
            </option>
          ))}
        </select>
      </div>
      {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
      <div className="mt-5 flex justify-end gap-2">
        <Button variant="outline" onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button disabled={saving} loading={saving} onClick={handleDuplicate}>
          Duplicate
        </Button>
      </div>
    </SimpleDialog>
  );
}
