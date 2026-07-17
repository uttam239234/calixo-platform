"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { SimpleDialog } from "@/components/settings/users/SimpleDialog";
import { Toggle } from "@/components/ui/Toggle";
import { usePromotions } from "@/features/platform-admin/promotions/usePromotions";
import type { CreatePromotionResult } from "@/features/platform-admin/promotions/usePromotions";
import type { DiscountKind } from "@/core/platform/commercial";

export default function PromotionsPage() {
  const { promotions, create, setActive } = usePromotions();
  const [creating, setCreating] = useState(false);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Enable or disable a code instantly — no code affects checkout while it&apos;s off.</p>
        <Button size="sm" onClick={() => setCreating(true)}>
          <Plus size={14} />
          New Promotion
        </Button>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-border">
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-border bg-surface/60">
              <th className="px-4 py-3 text-left font-semibold text-foreground">Code</th>
              <th className="px-3 py-3 text-right font-semibold text-foreground">Discount</th>
              <th className="px-3 py-3 text-right font-semibold text-foreground">Expiry</th>
              <th className="px-3 py-3 text-right font-semibold text-foreground">Usage Limit</th>
              <th className="px-3 py-3 text-center font-semibold text-foreground">Status</th>
            </tr>
          </thead>
          <tbody>
            {promotions.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                  No promotions yet — create one to get started.
                </td>
              </tr>
            )}
            {promotions.map(promotion => (
              <tr key={promotion.id} className="border-b border-border/70 last:border-0 hover:bg-accent/40">
                <td className="px-4 py-3 font-mono font-medium text-foreground">{promotion.code}</td>
                <td className="px-3 py-3 text-right text-foreground">{promotion.discountKind === "percent" ? `${promotion.discountValue}%` : `$${promotion.discountValue}`}</td>
                <td className="px-3 py-3 text-right text-muted-foreground">{promotion.validUntil ? new Date(promotion.validUntil).toLocaleDateString() : "No expiry"}</td>
                <td className="px-3 py-3 text-right text-muted-foreground">
                  {promotion.redemptionCount}
                  {promotion.maxRedemptions ? ` / ${promotion.maxRedemptions}` : " / ∞"}
                </td>
                <td className="px-3 py-3 text-center">
                  <Toggle checked={promotion.isActive} onChange={next => setActive(promotion, next)} label={`${promotion.code} status`} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {creating && (
        <NewPromotionDialog
          onClose={() => setCreating(false)}
          onCreate={async input => {
            const result = await create(input);
            if (result.ok) setCreating(false);
            return result;
          }}
        />
      )}
    </div>
  );
}

function NewPromotionDialog({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (input: { code: string; discountKind: DiscountKind; discountValue: number; validUntil?: string; maxRedemptions?: number }) => Promise<CreatePromotionResult>;
}) {
  const [code, setCode] = useState("");
  const [discountKind, setDiscountKind] = useState<DiscountKind>("percent");
  const [discountValue, setDiscountValue] = useState("10");
  const [validUntil, setValidUntil] = useState("");
  const [maxRedemptions, setMaxRedemptions] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate() {
    setSaving(true);
    setError(null);
    const result = await onCreate({
      code: code.trim(),
      discountKind,
      discountValue: Number(discountValue) || 0,
      validUntil: validUntil ? new Date(validUntil).toISOString() : undefined,
      maxRedemptions: maxRedemptions ? Number(maxRedemptions) : undefined,
    });
    setSaving(false);
    if (!result.ok) setError(result.error ?? "Something went wrong.");
  }

  return (
    <SimpleDialog title="New Promotion" onClose={onClose}>
      <div className="space-y-3">
        <Input label="Code" value={code} onChange={e => setCode(e.target.value.toUpperCase())} placeholder="SUMMER50" />
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Discount Type</label>
            <select value={discountKind} onChange={e => setDiscountKind(e.target.value as DiscountKind)} className="input w-full">
              <option value="percent">Percent</option>
              <option value="fixed">Fixed ($)</option>
            </select>
          </div>
          <Input label="Discount Value" type="number" min={0} value={discountValue} onChange={e => setDiscountValue(e.target.value)} />
        </div>
        <Input label="Expiry (optional)" type="date" value={validUntil} onChange={e => setValidUntil(e.target.value)} />
        <Input label="Usage Limit (optional)" type="number" min={1} value={maxRedemptions} onChange={e => setMaxRedemptions(e.target.value)} />
      </div>
      {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
      <div className="mt-5 flex justify-end gap-2">
        <Button variant="outline" onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button disabled={!code.trim() || saving} loading={saving} onClick={handleCreate}>
          Create Promotion
        </Button>
      </div>
    </SimpleDialog>
  );
}
