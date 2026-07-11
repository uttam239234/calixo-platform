"use client";

import { useEffect, useMemo, useState } from "react";
import { Archive, Building2, ImagePlus } from "lucide-react";
import { ModuleSettingsLayout, type SettingsSection } from "@/components/enterprise/module";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/button";
import { WhatDoesThisDo } from "@/components/ui/Tooltip";
import { useSettingsContext } from "@/features/settings/SettingsProvider";
import { useOrganization } from "@/organizations/hooks/useOrganization";
import { OrganizationSwitcher } from "@/organizations/components/OrganizationSwitcher";
import { commercialPlatformAPI } from "@/core/platform/commercial/CommercialPlatformAPI";
import type { CommercialOverview } from "@/core/platform/commercial/CommercialPlatformAPI";
import { usersPlatformAPI } from "@/core/users";
import { INDUSTRY_OPTIONS, COMPANY_SIZE_OPTIONS, TIMEZONE_OPTIONS, CURRENCY_OPTIONS, DATE_FORMAT_OPTIONS } from "@/features/settings/constants";

interface FormState {
  name: string;
  email: string;
  phone: string;
  website: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  industry: string;
  companySize: string;
  timezone: string;
  currency: string;
  dateFormat: string;
}

function toFormState(organization: NonNullable<ReturnType<typeof useSettingsContext>["organization"]>): FormState {
  return {
    name: organization.name,
    email: organization.profile.email ?? "",
    phone: organization.profile.phone ?? "",
    website: organization.profile.website ?? "",
    line1: organization.profile.address?.line1 ?? "",
    line2: organization.profile.address?.line2 ?? "",
    city: organization.profile.address?.city ?? "",
    state: organization.profile.address?.state ?? "",
    country: organization.profile.address?.country ?? "",
    postalCode: organization.profile.address?.postalCode ?? "",
    industry: organization.profile.industry ?? "",
    companySize: organization.profile.companySize ?? "",
    timezone: organization.settings.timezone,
    currency: organization.settings.defaultCurrency,
    dateFormat: organization.settings.dateFormat,
  };
}

export default function OrganizationProfilePage() {
  const { organization, canUpdate, canAdmin, updateOrganization, archiveOrganization } = useSettingsContext();
  const { organizations } = useOrganization();
  const [form, setForm] = useState<FormState | null>(organization ? toFormState(organization) : null);
  const [saving, setSaving] = useState(false);
  const [overview, setOverview] = useState<CommercialOverview | null>(null);
  const [confirmingArchive, setConfirmingArchive] = useState(false);

  useEffect(() => {
    (async () => {
      if (organization) setForm(toFormState(organization));
    })();
  }, [organization]);

  useEffect(() => {
    (async () => {
      if (organization) setOverview(commercialPlatformAPI.getOverview(organization.id));
    })();
  }, [organization]);

  const owner = useMemo(() => (organization ? usersPlatformAPI.getUserSummary(organization.ownerId) : undefined), [organization]);

  if (!organization || !form) {
    return (
      <div className="flex items-center justify-center py-24 text-sm text-muted-foreground">
        <Building2 className="mr-2 animate-pulse" size={18} /> Loading your organization…
      </div>
    );
  }

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm(prev => (prev ? { ...prev, [key]: value } : prev));
  }

  async function handleSave() {
    if (!form) return;
    setSaving(true);
    await updateOrganization({
      name: form.name,
      profile: {
        email: form.email || undefined,
        phone: form.phone || undefined,
        website: form.website || undefined,
        industry: form.industry || undefined,
        companySize: form.companySize || undefined,
        address: { line1: form.line1 || undefined, line2: form.line2 || undefined, city: form.city || undefined, state: form.state || undefined, country: form.country || undefined, postalCode: form.postalCode || undefined },
      },
      settings: { timezone: form.timezone, defaultCurrency: form.currency, dateFormat: form.dateFormat },
    });
    setSaving(false);
  }

  const sections: SettingsSection[] = [
    {
      id: "company",
      title: "Company Details",
      description: "The basics — how your organization is identified across Calixo.",
      content: (
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="flex items-center gap-3 sm:col-span-2">
            <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-border bg-accent/30">
              {organization.branding.logo ? (
                // eslint-disable-next-line @next/next/no-img-element -- data/user-provided URL, not a static asset next/image can optimize
                <img src={organization.branding.logo} alt={`${organization.name} logo`} className="h-full w-full object-cover" />
              ) : (
                <ImagePlus size={20} className="text-muted-foreground" />
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Logo shown here is managed on the <span className="font-medium text-foreground">Branding</span> page.
            </p>
          </div>
          <Input label="Organization Name" value={form.name} onChange={e => set("name", e.target.value)} disabled={!canUpdate} />
          <Input label="Organization Email" type="email" value={form.email} onChange={e => set("email", e.target.value)} disabled={!canUpdate} />
          <Input label="Organization Phone Number" value={form.phone} onChange={e => set("phone", e.target.value)} disabled={!canUpdate} />
          <Input label="Organization Website" value={form.website} onChange={e => set("website", e.target.value)} placeholder="https://" disabled={!canUpdate} />
        </div>
      ),
    },
    {
      id: "address",
      title: "Address",
      content: (
        <div className="grid gap-3 sm:grid-cols-2">
          <Input label="Address Line 1" value={form.line1} onChange={e => set("line1", e.target.value)} disabled={!canUpdate} className="sm:col-span-2" />
          <Input label="Address Line 2" value={form.line2} onChange={e => set("line2", e.target.value)} disabled={!canUpdate} className="sm:col-span-2" />
          <Input label="City" value={form.city} onChange={e => set("city", e.target.value)} disabled={!canUpdate} />
          <Input label="State" value={form.state} onChange={e => set("state", e.target.value)} disabled={!canUpdate} />
          <Input label="Country" value={form.country} onChange={e => set("country", e.target.value)} disabled={!canUpdate} />
          <Input label="Postal Code" value={form.postalCode} onChange={e => set("postalCode", e.target.value)} disabled={!canUpdate} />
        </div>
      ),
    },
    {
      id: "business",
      title: "Business Information",
      content: (
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="label">Industry</label>
            <select className="input" value={form.industry} onChange={e => set("industry", e.target.value)} disabled={!canUpdate}>
              <option value="">Select…</option>
              {INDUSTRY_OPTIONS.map(o => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Company Size</label>
            <select className="input" value={form.companySize} onChange={e => set("companySize", e.target.value)} disabled={!canUpdate}>
              <option value="">Select…</option>
              {COMPANY_SIZE_OPTIONS.map(o => (
                <option key={o} value={o}>
                  {o} employees
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label flex items-center gap-1.5">
              Time Zone <WhatDoesThisDo>Used to schedule reports and show dates/times correctly for your team.</WhatDoesThisDo>
            </label>
            <select className="input" value={form.timezone} onChange={e => set("timezone", e.target.value)} disabled={!canUpdate}>
              {TIMEZONE_OPTIONS.map(o => (
                <option key={o.id} value={o.id}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Currency</label>
            <select className="input" value={form.currency} onChange={e => set("currency", e.target.value)} disabled={!canUpdate}>
              {CURRENCY_OPTIONS.map(o => (
                <option key={o.id} value={o.id}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Date Format</label>
            <select className="input" value={form.dateFormat} onChange={e => set("dateFormat", e.target.value)} disabled={!canUpdate}>
              {DATE_FORMAT_OPTIONS.map(o => (
                <option key={o.id} value={o.id}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      ),
    },
    {
      id: "ownership",
      title: "Ownership",
      description: "Who owns this organization's account.",
      content: (
        <div className="grid gap-3 sm:grid-cols-2">
          <Input label="Owner Name" value={owner?.displayName ?? organization.ownerId} disabled readOnly />
          <Input label="Owner Email" value={owner?.email ?? "—"} disabled readOnly />
        </div>
      ),
    },
    {
      id: "subscription",
      title: "Subscription",
      description: "Your current plan and this billing period's usage.",
      content: overview ? (
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-border bg-accent/20 p-3">
              <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Current Plan</p>
              <p className="mt-0.5 text-sm font-semibold capitalize text-foreground">{overview.subscription.tier}</p>
            </div>
            <div className="rounded-xl border border-border bg-accent/20 p-3">
              <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Renewal Date</p>
              <p className="mt-0.5 text-sm font-semibold text-foreground">{overview.subscription.renewsAt ? new Date(overview.subscription.renewsAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) : "—"}</p>
            </div>
          </div>
          <div>
            <p className="mb-1.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Usage Summary</p>
            <div className="space-y-1">
              {overview.usageBreakdown.map(u => (
                <div key={u.usageTypeId} className="flex items-center justify-between rounded-lg bg-accent/20 px-3 py-1.5 text-xs">
                  <span className="text-muted-foreground">{u.usageTypeId}</span>
                  <span className="font-medium tabular-nums text-foreground">{u.total.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">Loading subscription details…</p>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      {organizations.length > 1 && (
        <div className="max-w-xs">
          <p className="mb-1.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Current Organization</p>
          <div className="rounded-xl border border-border bg-card">
            <OrganizationSwitcher />
          </div>
        </div>
      )}

      <ModuleSettingsLayout title="Organization Profile" description="How your organization appears across Calixo." sections={sections} onSave={canUpdate ? handleSave : undefined} saving={saving} />

      {canAdmin && (
        <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-4">
          <p className="text-sm font-semibold text-foreground">Archive this organization</p>
          <p className="mt-1 text-xs text-muted-foreground">Archiving hides {organization.name} from your organization list. This can&apos;t be undone from here.</p>
          {confirmingArchive ? (
            <div className="mt-3 flex gap-2">
              <Button size="sm" variant="destructive" className="gap-1.5" onClick={() => archiveOrganization()}>
                <Archive size={13} /> Yes, archive {organization.name}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setConfirmingArchive(false)}>
                Cancel
              </Button>
            </div>
          ) : (
            <Button size="sm" variant="outline" className="mt-3 gap-1.5" onClick={() => setConfirmingArchive(true)}>
              <Archive size={13} /> Archive Organization
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
