"use client";

import { Toggle } from "@/components/ui/Toggle";
import { useFeatureMatrix, MATRIX_ROWS, isRowEnabled } from "@/features/platform-admin/features/useFeatureMatrix";

export default function FeaturesPage() {
  const { tiers, toggle } = useFeatureMatrix();

  return (
    <div>
      <p className="mb-4 text-sm text-muted-foreground">One toggle — no deployment. A module or feature turned off here is unavailable to that plan&apos;s customers immediately.</p>

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
                      <Toggle checked={enabled} onChange={next => toggle(t.tier, row, next)} label={`${row.label} for ${t.definition.label}`} />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
