"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { SimpleDialog } from "@/components/settings/users/SimpleDialog";
import { UndoToast } from "@/features/platform-admin/UndoToast";
import { useLimits, LIMIT_FIELDS, type NumericLimitKey } from "@/features/platform-admin/limits/useLimits";
import type { SubscriptionTierDefinition } from "@/core/platform/subscription";

export default function LimitsPage() {
  const { tiers, updateLimits } = useLimits();
  const [editing, setEditing] = useState<SubscriptionTierDefinition | null>(null);
  const [undo, setUndo] = useState<{ token: string; message: string; windowMs: number } | null>(null);

  return (
    <div>
      <p className="mb-4 text-sm text-muted-foreground">Changing a limit takes effect immediately for every organization on that plan.</p>

      <div className="overflow-x-auto rounded-2xl border border-border">
        <table className="w-full min-w-[860px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-border bg-surface/60">
              <th className="px-4 py-3 text-left font-semibold text-foreground">Plan</th>
              {LIMIT_FIELDS.map(field => (
                <th key={field.key} className="px-3 py-3 text-right font-semibold text-foreground">
                  {field.label}
                </th>
              ))}
              <th className="px-3 py-3" />
            </tr>
          </thead>
          <tbody>
            {tiers.map(({ tier, definition }) => (
              <tr key={tier} className="border-b border-border/70 last:border-0 hover:bg-accent/40">
                <td className="px-4 py-3 font-medium text-foreground">{definition.label}</td>
                {LIMIT_FIELDS.map(field => (
                  <td key={field.key} className="px-3 py-3 text-right tabular-nums text-foreground">
                    {definition.limits[field.key].toLocaleString()}
                  </td>
                ))}
                <td className="px-3 py-3 text-right">
                  <Button variant="outline" size="icon-sm" aria-label={`Edit ${definition.label} limits`} onClick={() => setEditing(definition)}>
                    <Pencil size={13} />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <EditLimitsDialog
          definition={editing}
          onClose={() => setEditing(null)}
          onSave={async patch => {
            const result = await updateLimits(editing.tier, patch);
            if (result.undoToken) setUndo({ token: result.undoToken, message: `${editing.label}'s limits updated.`, windowMs: result.undoWindowMs ?? 0 });
            setEditing(null);
          }}
        />
      )}

      {undo && <UndoToast token={undo.token} message={undo.message} windowMs={undo.windowMs} onDismiss={() => setUndo(null)} onUndo={() => setUndo(null)} />}
    </div>
  );
}

function EditLimitsDialog({
  definition,
  onClose,
  onSave,
}: {
  definition: SubscriptionTierDefinition;
  onClose: () => void;
  onSave: (patch: Partial<Record<NumericLimitKey, number>>) => void;
}) {
  const [values, setValues] = useState<Record<string, string>>(() => Object.fromEntries(LIMIT_FIELDS.map(f => [f.key, String(definition.limits[f.key])])));

  return (
    <SimpleDialog title={`Edit ${definition.label} Limits`} onClose={onClose}>
      <div className="grid gap-3 sm:grid-cols-2">
        {LIMIT_FIELDS.map(field => (
          <Input
            key={field.key}
            label={field.label}
            type="number"
            min={0}
            value={values[field.key]}
            onChange={e => setValues(v => ({ ...v, [field.key]: e.target.value }))}
          />
        ))}
      </div>
      <div className="mt-5 flex justify-end gap-2">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button
          onClick={() => {
            const patch: Partial<Record<NumericLimitKey, number>> = {};
            for (const field of LIMIT_FIELDS) patch[field.key] = Number(values[field.key]) || 0;
            onSave(patch);
          }}
        >
          Save Changes
        </Button>
      </div>
    </SimpleDialog>
  );
}
