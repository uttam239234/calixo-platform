"use client";

import { useState } from "react";
import { Toggle } from "@/components/ui/Toggle";
import { UndoToast } from "@/features/platform-admin/UndoToast";
import { useFeatureMatrix, MATRIX_ROWS, isRowEnabled } from "@/features/platform-admin/features/useFeatureMatrix";

export default function FeaturesPage() {
  const { tiers, toggle } = useFeatureMatrix();
  const [undo, setUndo] = useState<{ token: string; message: string; windowMs: number } | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  return (
    <div>
      <p className="mb-4 text-sm text-muted-foreground">One toggle — no deployment. A module or feature turned off here is unavailable to that plan&apos;s customers immediately.</p>
      {actionError && <p className="mb-4 text-sm text-destructive">{actionError}</p>}

      <div className="overflow-x-auto rounded-2xl border border-border">
        <table className="w-full min-w-[560px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-border bg-surface/60">
              <th className="px-4 py-3 text-left font-semibold text-foreground">Feature / Module</th>
              {tiers.map(t => (
                <th key={t.tier} className="px-4 py-3 text-center font-semibold text-foreground">
                  {t.definition.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {MATRIX_ROWS.map(row => (
              <tr key={row.id} className="border-b border-border/70 last:border-0 hover:bg-accent/40">
                <td className="px-4 py-3 font-medium text-foreground">{row.label}</td>
                {tiers.map(t => {
                  const enabled = isRowEnabled(t.definition.limits, row);
                  return (
                    <td key={t.tier} className="px-4 py-3 text-center">
                      <Toggle
                        checked={enabled}
                        onChange={async next => {
                          const result = await toggle(t.tier, row, next);
                          setActionError(result.error ?? null);
                          if (result.undoToken) setUndo({ token: result.undoToken, message: `${row.label} ${next ? "enabled" : "disabled"} for ${t.definition.label}.`, windowMs: result.undoWindowMs ?? 0 });
                        }}
                        label={`${row.label} for ${t.definition.label}`}
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {undo && <UndoToast token={undo.token} message={undo.message} windowMs={undo.windowMs} onDismiss={() => setUndo(null)} onUndo={() => setUndo(null)} />}
    </div>
  );
}
