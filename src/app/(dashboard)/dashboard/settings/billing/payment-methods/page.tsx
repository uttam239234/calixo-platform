"use client";

import { useState } from "react";
import { CreditCard, Wallet2, Landmark, Star, Plus, Trash2 } from "lucide-react";
import { ModuleHeader } from "@/components/enterprise/module";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { SimpleDialog } from "@/components/settings/users/SimpleDialog";
import { useSettingsContext } from "@/features/settings/SettingsProvider";
import { useBilling } from "@/hooks/useBilling";
import type { PaymentMethodType } from "@/features/settings/billing/paymentMethods";

const METHOD_ICONS: Record<PaymentMethodType, typeof CreditCard> = {
  credit_card: CreditCard,
  debit_card: CreditCard,
  paypal: Wallet2,
  bank_transfer: Landmark,
};

const METHOD_TYPE_LABELS: Record<PaymentMethodType, string> = {
  credit_card: "Credit Card",
  debit_card: "Debit Card",
  paypal: "PayPal",
  bank_transfer: "Bank Transfer",
};

export default function PaymentMethodsPage() {
  const { tenantContext, canUpdateBilling, canManageBilling, showToast } = useSettingsContext();
  const organizationId = tenantContext.organizationId;
  const billing = useBilling(organizationId);

  const [adding, setAdding] = useState(false);
  const [type, setType] = useState<PaymentMethodType>("credit_card");
  const [label, setLabel] = useState("");
  const [last4, setLast4] = useState("");
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null);

  const resetForm = () => {
    setType("credit_card");
    setLabel("");
    setLast4("");
  };

  return (
    <div>
      <ModuleHeader
        title="Payment Methods"
        description="Cards and accounts on file for billing."
        quickActions={
          canUpdateBilling && (
            <Button onClick={() => setAdding(true)}>
              <Plus size={16} />
              Add Method
            </Button>
          )
        }
      />

      {billing.loading ? (
        <p className="text-sm text-muted-foreground">Loading payment methods…</p>
      ) : billing.paymentMethods.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">No payment methods yet.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {billing.paymentMethods.map(method => {
            const Icon = METHOD_ICONS[method.type];
            return (
              <div key={method.id} className="rounded-2xl border border-border bg-card p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-foreground">{method.label}</p>
                    <p className="text-xs text-muted-foreground">{METHOD_TYPE_LABELS[method.type]}</p>
                  </div>
                  {method.isDefault && (
                    <span className="flex flex-shrink-0 items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-[11px] font-medium text-success">
                      <Star size={10} /> Default
                    </span>
                  )}
                </div>

                <div className="mt-4 flex gap-1.5 border-t border-border pt-4">
                  {!method.isDefault && canUpdateBilling && (
                    <Button
                      size="xs"
                      variant="outline"
                      onClick={() => {
                        billing.setDefaultPaymentMethod(method.id);
                        showToast("Default payment method updated.");
                      }}
                    >
                      Set Default
                    </Button>
                  )}
                  {canManageBilling && (
                    <Button size="xs" variant="outline" onClick={() => setConfirmRemove(method.id)}>
                      <Trash2 size={12} /> Remove
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {adding && (
        <SimpleDialog
          title="Add Payment Method"
          description="We never ask for your full card number here — just a label so you can recognize it."
          onClose={() => {
            setAdding(false);
            resetForm();
          }}
        >
          <div className="space-y-3">
            <div>
              <label className="label mb-1.5 block">Type</label>
              <select className="input" value={type} onChange={e => setType(e.target.value as PaymentMethodType)}>
                {Object.entries(METHOD_TYPE_LABELS).map(([value, methodLabel]) => (
                  <option key={value} value={value}>
                    {methodLabel}
                  </option>
                ))}
              </select>
            </div>
            <Input label="Label" placeholder="Visa ending in 4242" value={label} onChange={e => setLabel(e.target.value)} />
            {(type === "credit_card" || type === "debit_card") && (
              <Input label="Last 4 digits" placeholder="4242" maxLength={4} value={last4} onChange={e => setLast4(e.target.value.replace(/\D/g, "").slice(0, 4))} />
            )}
          </div>
          <div className="mt-5 flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setAdding(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button
              disabled={!label.trim()}
              onClick={() => {
                billing.addPaymentMethod({ type, label: label.trim(), last4: last4 || undefined });
                showToast("Payment method added.");
                setAdding(false);
                resetForm();
              }}
            >
              Add Method
            </Button>
          </div>
        </SimpleDialog>
      )}

      {confirmRemove && (
        <SimpleDialog title="Remove this payment method?" description="You can add it back anytime." onClose={() => setConfirmRemove(null)}>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setConfirmRemove(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                billing.removePaymentMethod(confirmRemove);
                showToast("Payment method removed.");
                setConfirmRemove(null);
              }}
            >
              Remove
            </Button>
          </div>
        </SimpleDialog>
      )}
    </div>
  );
}
