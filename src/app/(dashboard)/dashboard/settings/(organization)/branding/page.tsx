"use client";

import { useEffect, useState } from "react";
import { ModuleSettingsLayout, type SettingsSection } from "@/components/enterprise/module";
import { Input } from "@/components/ui/Input";
import { WhatDoesThisDo } from "@/components/ui/Tooltip";
import { useSettingsContext } from "@/features/settings/SettingsProvider";
import type { ThemePreference } from "@/features/theme/ThemeContext";

interface FormState {
  logo: string;
  favicon: string;
  primary: string;
  secondary: string;
  theme: ThemePreference;
}

export default function BrandingPage() {
  const { organization, canUpdate, updateOrganization } = useSettingsContext();
  const [form, setForm] = useState<FormState | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      if (organization) {
        setForm({
          logo: organization.branding.logo ?? "",
          favicon: organization.branding.favicon ?? "",
          primary: organization.branding.colors.primary,
          secondary: organization.branding.colors.secondary,
          theme: organization.preferences.theme,
        });
      }
    })();
  }, [organization]);

  if (!organization || !form) return null;

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm(prev => (prev ? { ...prev, [key]: value } : prev));
  }

  async function handleSave() {
    if (!form) return;
    setSaving(true);
    await updateOrganization({
      branding: { logo: form.logo || undefined, favicon: form.favicon || undefined, colors: { primary: form.primary, secondary: form.secondary, accent: organization!.branding.colors.accent } },
      preferences: { theme: form.theme },
    });
    setSaving(false);
  }

  const sections: SettingsSection[] = [
    {
      id: "logo",
      title: "Logo & Favicon",
      description: "Shown across Calixo and in browser tabs.",
      content: (
        <div className="grid gap-3 sm:grid-cols-2">
          <Input label="Organization Logo URL" value={form.logo} onChange={e => set("logo", e.target.value)} placeholder="https://…/logo.png" disabled={!canUpdate} />
          <Input label="Favicon URL" value={form.favicon} onChange={e => set("favicon", e.target.value)} placeholder="https://…/favicon.ico" disabled={!canUpdate} />
        </div>
      ),
    },
    {
      id: "colors",
      title: "Colors",
      description: "Your organization's two brand colors.",
      content: (
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="label flex items-center gap-1.5">
              Primary Color <WhatDoesThisDo>The main color used for buttons and highlights across your organization&apos;s Calixo experience.</WhatDoesThisDo>
            </label>
            <div className="flex items-center gap-2">
              <input type="color" value={form.primary} onChange={e => set("primary", e.target.value)} disabled={!canUpdate} className="h-10 w-12 cursor-pointer rounded-lg border border-border bg-transparent p-1" />
              <Input value={form.primary} onChange={e => set("primary", e.target.value)} disabled={!canUpdate} />
            </div>
          </div>
          <div>
            <label className="label">Secondary Color</label>
            <div className="flex items-center gap-2">
              <input type="color" value={form.secondary} onChange={e => set("secondary", e.target.value)} disabled={!canUpdate} className="h-10 w-12 cursor-pointer rounded-lg border border-border bg-transparent p-1" />
              <Input value={form.secondary} onChange={e => set("secondary", e.target.value)} disabled={!canUpdate} />
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "theme",
      title: "Theme Preference",
      description: "How Calixo looks for people in your organization by default.",
      content: (
        <div className="flex gap-2">
          {(["light", "dark", "system"] as ThemePreference[]).map(t => (
            <button
              key={t}
              type="button"
              disabled={!canUpdate}
              onClick={() => set("theme", t)}
              className={`flex-1 rounded-xl border px-3 py-2.5 text-sm font-medium capitalize transition-colors ${form.theme === t ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:bg-accent"}`}
            >
              {t}
            </button>
          ))}
        </div>
      ),
    },
    {
      id: "preview",
      title: "Live Preview",
      span: "full",
      content: (
        <div className="overflow-hidden rounded-2xl border border-border">
          <div className="flex items-center gap-3 px-4 py-3" style={{ backgroundColor: form.primary }}>
            <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg bg-white/20 text-sm font-bold text-white">
              {form.logo ? (
                // eslint-disable-next-line @next/next/no-img-element -- user-provided URL preview, not a static asset
                <img src={form.logo} alt="" className="h-full w-full object-cover" />
              ) : (
                organization.name.charAt(0).toUpperCase()
              )}
            </div>
            <span className="text-sm font-semibold text-white">{organization.name}</span>
          </div>
          <div className="space-y-2 bg-card p-4">
            <div className="h-2.5 w-2/3 rounded-full bg-accent" />
            <div className="h-2.5 w-1/2 rounded-full bg-accent" />
            <button type="button" className="mt-2 rounded-lg px-3 py-1.5 text-xs font-medium text-white" style={{ backgroundColor: form.secondary }}>
              Sample Button
            </button>
          </div>
        </div>
      ),
    },
  ];

  return <ModuleSettingsLayout title="Branding" description="Keep it simple — a logo, two colors, and a theme." sections={sections} onSave={canUpdate ? handleSave : undefined} saving={saving} />;
}
