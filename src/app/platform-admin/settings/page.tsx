"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { useGlobalSettings } from "@/features/platform-admin/globalSettings/useGlobalSettings";

export default function GlobalSettingsPage() {
  const { settings, update } = useGlobalSettings();
  const [trialLength, setTrialLength] = useState(String(settings.freeTrialLengthDays));
  const [trialCredits, setTrialCredits] = useState(String(settings.trialAiCredits));
  const [currency, setCurrency] = useState(settings.defaultCurrency);
  const [taxPercent, setTaxPercent] = useState(String(settings.taxPercent));
  const [contactEmail, setContactEmail] = useState(settings.enterpriseContactEmail);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="max-w-xl">
      <p className="mb-4 text-sm text-muted-foreground">These apply globally, across every organization and plan.</p>

      <div className="space-y-4 rounded-2xl border border-border bg-card p-6">
        <Input label="Free Trial Length (days)" type="number" min={0} value={trialLength} onChange={e => setTrialLength(e.target.value)} />
        <Input label="Trial AI Credits" type="number" min={0} value={trialCredits} onChange={e => setTrialCredits(e.target.value)} helperText="Writes through to the Trial plan's included AI credits." />
        <Input label="Default Currency" value={currency} onChange={e => setCurrency(e.target.value.toUpperCase())} maxLength={3} />
        <Input label="Tax Rate (%)" type="number" min={0} value={taxPercent} onChange={e => setTaxPercent(e.target.value)} />
        <Input label="Enterprise Contact Email" type="email" value={contactEmail} onChange={e => setContactEmail(e.target.value)} />

        <div className="flex items-center gap-3 pt-2">
          <Button
            disabled={saving}
            loading={saving}
            onClick={async () => {
              setSaving(true);
              setError(null);
              const result = await update({
                freeTrialLengthDays: Number(trialLength) || 0,
                trialAiCredits: Number(trialCredits) || 0,
                defaultCurrency: currency,
                taxPercent: Number(taxPercent) || 0,
                enterpriseContactEmail: contactEmail,
              });
              setSaving(false);
              if (result.error) {
                setError(result.error);
                return;
              }
              setSaved(true);
              setTimeout(() => setSaved(false), 2000);
            }}
          >
            Save Changes
          </Button>
          {saved && <span className="text-sm text-success">Saved.</span>}
          {error && <span className="text-sm text-destructive">{error}</span>}
        </div>
      </div>
    </div>
  );
}
