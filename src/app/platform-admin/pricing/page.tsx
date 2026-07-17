"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { SimpleDialog } from "@/components/settings/users/SimpleDialog";
import { UndoToast } from "@/features/platform-admin/UndoToast";
import { usePricingRules, type PricingRow } from "@/features/platform-admin/pricing/usePricingRules";

export default function PricingPage() {
  const { rows, updateRule } = usePricingRules();
  const [editing, setEditing] = useState<PricingRow | null>(null);
  const [undo, setUndo] = useState<{ token: string; message: string; windowMs: number } | null>(null);

  return (
    <div>
      <p className="mb-4 text-sm text-muted-foreground">Changes here affect Checkout, Billing, and the Upgrade Center immediately.</p>

      <div className="overflow-x-auto rounded-2xl border border-border">
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-border bg-surface/60">
              <th className="px-4 py-3 text-left font-semibold text-foreground">Plan</th>
              <th className="px-3 py-3 text-right font-semibold text-foreground">Monthly</th>
              <th className="px-3 py-3 text-right font-semibold text-foreground">Yearly</th>
              <th className="px-3 py-3 text-right font-semibold text-foreground">Savings</th>
              <th className="px-3 py-3 text-right font-semibold text-foreground">Regional Pricing</th>
              <th className="px-3 py-3" />
            </tr>
          </thead>
          <tbody>
            {rows.map(row => (
              <tr key={row.tier} className="border-b border-border/70 last:border-0 hover:bg-accent/40">
                <td className="px-4 py-3 font-medium text-foreground">{row.label}</td>
                <td className="px-3 py-3 text-right tabular-nums text-foreground">{row.rule ? `$${row.rule.monthlyPrice}` : "Quote-only"}</td>
                <td className="px-3 py-3 text-right tabular-nums text-foreground">{row.rule ? `$${row.rule.annualPrice}` : "Quote-only"}</td>
                <td className="px-3 py-3 text-right tabular-nums text-foreground">{row.savingsPercent > 0 ? `${row.savingsPercent}%` : "—"}</td>
                <td className="px-3 py-3 text-right text-xs text-muted-foreground">USD only</td>
                <td className="px-3 py-3 text-right">
                  <Button variant="outline" size="icon-sm" aria-label={`Edit ${row.label} pricing`} disabled={!row.rule} onClick={() => setEditing(row)}>
                    <Pencil size={13} />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <EditPricingDialog
          row={editing}
          onClose={() => setEditing(null)}
          onSave={async (monthlyPrice, annualPrice) => {
            const result = await updateRule(editing.tier, monthlyPrice, annualPrice);
            if (result.error) return { error: result.error };
            if (result.undoToken) setUndo({ token: result.undoToken, message: `${editing.label}'s pricing updated.`, windowMs: result.undoWindowMs ?? 0 });
            setEditing(null);
            return {};
          }}
        />
      )}

      {undo && <UndoToast token={undo.token} message={undo.message} windowMs={undo.windowMs} onDismiss={() => setUndo(null)} onUndo={() => setUndo(null)} />}
    </div>
  );
}

function EditPricingDialog({
  row,
  onClose,
  onSave,
}: {
  row: PricingRow;
  onClose: () => void;
  onSave: (monthlyPrice: number, annualPrice: number) => Promise<{ error?: string }>;
}) {
  const [monthlyPrice, setMonthlyPrice] = useState(String(row.rule?.monthlyPrice ?? 0));
  const [annualPrice, setAnnualPrice] = useState(String(row.rule?.annualPrice ?? 0));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setSaving(true);
    setError(null);
    const result = await onSave(Number(monthlyPrice) || 0, Number(annualPrice) || 0);
    setSaving(false);
    if (result.error) setError(result.error);
  }

  return (
    <SimpleDialog title={`Edit ${row.label} Pricing`} description="Confirm to apply — this changes what customers are charged." onClose={onClose}>
      <div className="space-y-3">
        <Input label="Monthly Price ($)" type="number" min={0} value={monthlyPrice} onChange={e => setMonthlyPrice(e.target.value)} />
        <Input label="Yearly Price ($)" type="number" min={0} value={annualPrice} onChange={e => setAnnualPrice(e.target.value)} />
      </div>
      {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
      <div className="mt-5 flex justify-end gap-2">
        <Button variant="outline" onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button disabled={saving} loading={saving} onClick={handleSave}>
          Confirm Price Change
        </Button>
      </div>
    </SimpleDialog>
  );
}
