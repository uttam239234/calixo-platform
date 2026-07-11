"use client";

import { useEffect, useState } from "react";
import { Plus, X } from "lucide-react";
import { ModuleSettingsLayout, type SettingsSection } from "@/components/enterprise/module";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/Toggle";
import { WhatDoesThisDo } from "@/components/ui/Tooltip";
import { useSettingsContext } from "@/features/settings/SettingsProvider";
import { PASSWORD_POLICY_OPTIONS, SESSION_TIMEOUT_OPTIONS } from "@/features/settings/constants";
import type { PasswordPolicyStrength } from "@/core/platform/organizations";

interface FormState {
  twoFactorRequired: boolean;
  sessionTimeoutMinutes: number;
  passwordPolicyStrength: PasswordPolicyStrength;
  allowedEmailDomains: string[];
}

function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes} minutes`;
  const hours = minutes / 60;
  return `${hours} hour${hours === 1 ? "" : "s"}`;
}

export default function SecurityPage() {
  const { organization, canUpdate, updateOrganization } = useSettingsContext();
  const [form, setForm] = useState<FormState | null>(null);
  const [saving, setSaving] = useState(false);
  const [newDomain, setNewDomain] = useState("");

  useEffect(() => {
    (async () => {
      if (organization) {
        setForm({
          twoFactorRequired: organization.settings.security.twoFactorRequired,
          sessionTimeoutMinutes: organization.settings.security.sessionTimeoutMinutes,
          passwordPolicyStrength: organization.settings.security.passwordPolicyStrength,
          allowedEmailDomains: organization.settings.security.allowedEmailDomains,
        });
      }
    })();
  }, [organization]);

  if (!organization || !form) return null;

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm(prev => (prev ? { ...prev, [key]: value } : prev));
  }

  function addDomain() {
    const domain = newDomain.trim().replace(/^@/, "");
    if (!domain || !form) return;
    if (!form.allowedEmailDomains.includes(domain)) set("allowedEmailDomains", [...form.allowedEmailDomains, domain]);
    setNewDomain("");
  }

  async function handleSave() {
    if (!form) return;
    setSaving(true);
    await updateOrganization({
      settings: {
        security: {
          twoFactorRequired: form.twoFactorRequired,
          sessionTimeoutMinutes: form.sessionTimeoutMinutes,
          passwordPolicyStrength: form.passwordPolicyStrength,
          allowedEmailDomains: form.allowedEmailDomains,
        },
      },
    });
    setSaving(false);
  }

  const sections: SettingsSection[] = [
    {
      id: "authentication",
      title: "Two-Factor Authentication",
      content: (
        <div className="flex items-center justify-between gap-4">
          <p className="flex items-center gap-1.5 text-sm text-foreground">
            Require everyone in your organization to verify their identity with a second step when they sign in.
            <WhatDoesThisDo>Adds a code from your phone or an authenticator app, on top of your password — the single biggest way to stop stolen passwords from being used.</WhatDoesThisDo>
          </p>
          <Toggle checked={form.twoFactorRequired} onChange={v => set("twoFactorRequired", v)} disabled={!canUpdate} label="Require two-factor authentication" />
        </div>
      ),
    },
    {
      id: "session",
      title: "Session Timeout",
      description: "How long someone can stay signed in without activity before they need to sign in again.",
      content: (
        <div className="flex flex-wrap gap-2">
          {SESSION_TIMEOUT_OPTIONS.map(minutes => (
            <button
              key={minutes}
              type="button"
              disabled={!canUpdate}
              onClick={() => set("sessionTimeoutMinutes", minutes)}
              className={`rounded-xl border px-3 py-2 text-sm font-medium transition-colors ${form.sessionTimeoutMinutes === minutes ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:bg-accent"}`}
            >
              {formatMinutes(minutes)}
            </button>
          ))}
        </div>
      ),
    },
    {
      id: "password",
      title: "Password Policy Strength",
      description: "How strong passwords must be for everyone in your organization.",
      content: (
        <div className="space-y-2">
          {PASSWORD_POLICY_OPTIONS.map(o => (
            <button
              key={o.id}
              type="button"
              disabled={!canUpdate}
              onClick={() => set("passwordPolicyStrength", o.id)}
              className={`flex w-full items-start gap-3 rounded-xl border p-3 text-left transition-colors ${form.passwordPolicyStrength === o.id ? "border-primary bg-primary/5" : "border-border hover:bg-accent"}`}
            >
              <div className={`mt-0.5 h-4 w-4 flex-shrink-0 rounded-full border-2 ${form.passwordPolicyStrength === o.id ? "border-primary bg-primary" : "border-border"}`} />
              <div>
                <p className="text-sm font-medium text-foreground">{o.label}</p>
                <p className="text-xs text-muted-foreground">{o.description}</p>
              </div>
            </button>
          ))}
        </div>
      ),
    },
    {
      id: "domains",
      title: "Allowed Email Domains",
      description: "Only people with an email address at these domains can join your organization. Leave empty to allow anyone you invite.",
      content: (
        <div className="space-y-2">
          <div className="flex flex-wrap gap-1.5">
            {form.allowedEmailDomains.map(domain => (
              <span key={domain} className="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 px-2.5 py-1 text-xs text-primary">
                @{domain}
                {canUpdate && (
                  <button type="button" onClick={() => set("allowedEmailDomains", form.allowedEmailDomains.filter(d => d !== domain))} className="hover:text-destructive">
                    <X size={11} />
                  </button>
                )}
              </span>
            ))}
            {form.allowedEmailDomains.length === 0 && <p className="text-xs text-muted-foreground">No restrictions — anyone you invite can join.</p>}
          </div>
          {canUpdate && (
            <div className="flex gap-1.5">
              <Input inputSize="sm" placeholder="yourcompany.com" value={newDomain} onChange={e => setNewDomain(e.target.value)} onKeyDown={e => e.key === "Enter" && addDomain()} />
              <Button size="sm" variant="outline" onClick={addDomain}>
                <Plus size={13} />
              </Button>
            </div>
          )}
        </div>
      ),
    },
  ];

  return <ModuleSettingsLayout title="Security" description="Plain-language controls — the details are handled for you." sections={sections} onSave={canUpdate ? handleSave : undefined} saving={saving} />;
}
