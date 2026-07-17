"use client";

import { useState } from "react";
import { Zap, Plus, Pencil, Ban, CheckCircle2, ArrowUp, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { SimpleDialog } from "@/components/settings/users/SimpleDialog";
import { UndoToast } from "@/features/platform-admin/UndoToast";
import { useCreditPacks } from "@/features/platform-admin/creditPacks/useCreditPacks";
import type { CreditPackDefinition } from "@/core/platform/commercial";

export default function CreditPacksPage() {
  const { packs, addPack, editPack, setActive, reorder } = useCreditPacks();
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<CreditPackDefinition | null>(null);
  const [undo, setUndo] = useState<{ token: string; message: string; windowMs: number } | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Changes here reflect instantly in the Credit Wallet and Buy Credits checkout.</p>
        <Button size="sm" onClick={() => setAdding(true)}>
          <Plus size={14} />
          Add Pack
        </Button>
      </div>
      {actionError && <p className="mb-3 text-sm text-destructive">{actionError}</p>}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {packs.map((pack, index) => (
          <div key={pack.id} className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-start justify-between gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Zap size={16} />
              </div>
              {pack.isActive ? (
                <span className="rounded-full bg-success/10 px-2 py-0.5 text-xs font-semibold text-success">Active</span>
              ) : (
                <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground">Disabled</span>
              )}
            </div>
            <p className="mt-3 text-2xl font-bold text-foreground">${pack.price}</p>
            <p className="text-sm text-muted-foreground">{pack.credits.toLocaleString()} credits</p>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setEditing(pack)}>
                <Pencil size={13} />
                Edit
              </Button>
              <Button variant="outline" size="sm" onClick={async () => { const result = await setActive(pack.id, !pack.isActive); setActionError(result.error ?? null); }}>
                {pack.isActive ? <Ban size={13} /> : <CheckCircle2 size={13} />}
                {pack.isActive ? "Disable" : "Enable"}
              </Button>
              <Button variant="outline" size="icon-sm" aria-label="Move up" disabled={index === 0} onClick={async () => { const result = await reorder(pack.id, "up"); setActionError(result.error ?? null); }}>
                <ArrowUp size={13} />
              </Button>
              <Button variant="outline" size="icon-sm" aria-label="Move down" disabled={index === packs.length - 1} onClick={async () => { const result = await reorder(pack.id, "down"); setActionError(result.error ?? null); }}>
                <ArrowDown size={13} />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {adding && (
        <PackDialog
          title="Add Credit Pack"
          onClose={() => setAdding(false)}
          onSave={async (price, credits) => {
            const result = await addPack(`pack-${Date.now()}`, price, credits);
            if (result.error) return { error: result.error };
            setAdding(false);
            return {};
          }}
        />
      )}

      {editing && (
        <PackDialog
          title={`Edit $${editing.price} Pack`}
          initialPrice={editing.price}
          initialCredits={editing.credits}
          onClose={() => setEditing(null)}
          onSave={async (price, credits) => {
            const result = await editPack(editing, price, credits);
            if (result.error) return { error: result.error };
            if (result.undoToken) setUndo({ token: result.undoToken, message: "Credit pack updated.", windowMs: result.undoWindowMs ?? 0 });
            setEditing(null);
            return {};
          }}
        />
      )}

      {undo && <UndoToast token={undo.token} message={undo.message} windowMs={undo.windowMs} onDismiss={() => setUndo(null)} onUndo={() => setUndo(null)} />}
    </div>
  );
}

function PackDialog({
  title,
  initialPrice = 0,
  initialCredits = 0,
  onClose,
  onSave,
}: {
  title: string;
  initialPrice?: number;
  initialCredits?: number;
  onClose: () => void;
  onSave: (price: number, credits: number) => Promise<{ error?: string }>;
}) {
  const [price, setPrice] = useState(String(initialPrice));
  const [credits, setCredits] = useState(String(initialCredits));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setSaving(true);
    setError(null);
    const result = await onSave(Number(price) || 0, Number(credits) || 0);
    setSaving(false);
    if (result.error) setError(result.error);
  }

  return (
    <SimpleDialog title={title} onClose={onClose}>
      <div className="space-y-3">
        <Input label="Price ($)" type="number" min={0} value={price} onChange={e => setPrice(e.target.value)} />
        <Input label="Credits" type="number" min={0} value={credits} onChange={e => setCredits(e.target.value)} />
      </div>
      {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
      <div className="mt-5 flex justify-end gap-2">
        <Button variant="outline" onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button disabled={saving} loading={saving} onClick={handleSave}>
          Save
        </Button>
      </div>
    </SimpleDialog>
  );
}
