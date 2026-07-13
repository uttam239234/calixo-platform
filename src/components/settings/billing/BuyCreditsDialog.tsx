"use client";

import { useState } from "react";
import { Zap } from "lucide-react";
import { SimpleDialog } from "@/components/settings/users/SimpleDialog";
import type { CreditPackDefinition } from "@/core/platform/commercial";

interface BuyCreditsDialogProps {
  packs: CreditPackDefinition[];
  onClose: () => void;
  onBuy: (packId: string) => void;
}

/** One click to buy — per the brief's "Simple one-click purchase flow." Packs come from the real, Internal Plan Management Console-editable catalog, not a hardcoded list. */
export function BuyCreditsDialog({ packs, onClose, onBuy }: BuyCreditsDialogProps) {
  const [purchasedId, setPurchasedId] = useState<string | null>(null);

  return (
    <SimpleDialog title="Buy Additional Credits" description="Prices are fixed — pick a pack and it's added instantly." onClose={onClose}>
      {purchasedId ? (
        <div className="py-6 text-center">
          <p className="text-lg font-semibold text-foreground">Credits added!</p>
          <p className="mt-1 text-sm text-muted-foreground">Your new balance is ready to use right away.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {packs.map(pack => (
            <button
              key={pack.id}
              type="button"
              onClick={() => {
                onBuy(pack.id);
                setPurchasedId(pack.id);
              }}
              className="flex flex-col items-center gap-2 rounded-2xl border border-border p-4 text-center transition-colors hover:border-primary hover:bg-primary/5"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Zap size={16} />
              </div>
              <p className="text-lg font-bold text-foreground">${pack.price}</p>
              <p className="text-xs text-muted-foreground">{pack.credits.toLocaleString()} credits</p>
            </button>
          ))}
        </div>
      )}
    </SimpleDialog>
  );
}
