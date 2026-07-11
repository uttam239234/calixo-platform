"use client";

import { useEffect, useState } from "react";
import { ModuleSettingsLayout, type SettingsSection } from "@/components/enterprise/module";
import { useSettingsContext } from "@/features/settings/SettingsProvider";
import type { ThemePreference } from "@/features/theme/ThemeContext";
import {
  LANGUAGE_OPTIONS,
  TIMEZONE_OPTIONS,
  CURRENCY_OPTIONS,
  DATE_FORMAT_OPTIONS,
  TIME_FORMAT_OPTIONS,
  MEASUREMENT_UNIT_OPTIONS,
  DEFAULT_DASHBOARD_OPTIONS,
} from "@/features/settings/constants";

interface FormState {
  language: string;
  timezone: string;
  currency: string;
  dateFormat: string;
  timeFormat: "12h" | "24h";
  measurementUnit: "metric" | "imperial";
  defaultDashboard: string;
  theme: ThemePreference;
}

function Field({ label, value, onChange, options, disabled }: { label: string; value: string; onChange: (v: string) => void; options: { id: string; label: string }[]; disabled?: boolean }) {
  return (
    <div>
      <label className="label">{label}</label>
      <select className="input" value={value} onChange={e => onChange(e.target.value)} disabled={disabled}>
        {options.map(o => (
          <option key={o.id} value={o.id}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export default function PreferencesPage() {
  const { organization, canUpdate, updateOrganization } = useSettingsContext();
  const [form, setForm] = useState<FormState | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      if (organization) {
        setForm({
          language: organization.settings.language,
          timezone: organization.settings.timezone,
          currency: organization.settings.defaultCurrency,
          dateFormat: organization.settings.dateFormat,
          timeFormat: organization.settings.timeFormat,
          measurementUnit: organization.settings.measurementUnit,
          defaultDashboard: organization.preferences.defaultLandingModule,
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
      settings: { language: form.language, timezone: form.timezone, defaultCurrency: form.currency, dateFormat: form.dateFormat, timeFormat: form.timeFormat, measurementUnit: form.measurementUnit },
      preferences: { defaultLandingModule: form.defaultDashboard, theme: form.theme },
    });
    setSaving(false);
  }

  const sections: SettingsSection[] = [
    {
      id: "regional",
      title: "Regional",
      description: "How dates, times, and numbers show up for your organization.",
      content: (
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Language" value={form.language} onChange={v => set("language", v)} options={LANGUAGE_OPTIONS} disabled={!canUpdate} />
          <Field label="Time Zone" value={form.timezone} onChange={v => set("timezone", v)} options={TIMEZONE_OPTIONS} disabled={!canUpdate} />
          <Field label="Currency" value={form.currency} onChange={v => set("currency", v)} options={CURRENCY_OPTIONS} disabled={!canUpdate} />
          <Field label="Date Format" value={form.dateFormat} onChange={v => set("dateFormat", v)} options={DATE_FORMAT_OPTIONS} disabled={!canUpdate} />
          <Field label="Time Format" value={form.timeFormat} onChange={v => set("timeFormat", v as "12h" | "24h")} options={TIME_FORMAT_OPTIONS} disabled={!canUpdate} />
          <Field label="Measurement Units" value={form.measurementUnit} onChange={v => set("measurementUnit", v as "metric" | "imperial")} options={MEASUREMENT_UNIT_OPTIONS} disabled={!canUpdate} />
        </div>
      ),
    },
    {
      id: "experience",
      title: "Experience",
      description: "What you see first, and how Calixo looks.",
      content: (
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Default Dashboard" value={form.defaultDashboard} onChange={v => set("defaultDashboard", v)} options={DEFAULT_DASHBOARD_OPTIONS} disabled={!canUpdate} />
          <Field label="Theme" value={form.theme} onChange={v => set("theme", v as ThemePreference)} options={[{ id: "light", label: "Light" }, { id: "dark", label: "Dark" }, { id: "system", label: "System" }]} disabled={!canUpdate} />
        </div>
      ),
    },
  ];

  return <ModuleSettingsLayout title="Preferences" description="Simple dropdowns — no technical setup." sections={sections} onSave={canUpdate ? handleSave : undefined} saving={saving} />;
}
