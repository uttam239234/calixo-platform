"use client";

import { useEffect, useState, type ReactNode } from "react";
import { ChevronDown, Key, Lock, Network, ShieldCheck, Trash2, Users, Webhook, X } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { ModuleEmptyState } from "@/components/enterprise/module";
import { useSettingsContext } from "@/features/settings/SettingsProvider";
import { ssoProviderRegistry } from "@/core/platform/identity/sso/SsoProviderRegistry";
import type { SsoConnectionConfig } from "@/core/platform/identity/sso/types";
import { apiClientRegistry } from "@/core/platform/access/apiAuth/ApiClientRegistry";
import type { ApiKeyDefinition } from "@/core/platform/access/apiAuth/types";
import { dataGovernanceRegistry, type RetentionPolicy, type DataClassification } from "@/core/platform/data/governance";
import { policyEngine } from "@/core/platform/identity/policies/PolicyEngine";
import type { IpRestrictionPolicy } from "@/core/platform/identity/types";
import { generateId } from "@/shared/utils/string";

const CLASSIFICATIONS: DataClassification[] = ["public", "internal", "confidential", "restricted", "pii"];

function Section({ icon, title, description, defaultOpen = false, children }: { icon: ReactNode; title: string; description: string; defaultOpen?: boolean; children: ReactNode }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <Card padding="none">
      <button type="button" onClick={() => setOpen(v => !v)} className="flex w-full items-center gap-3 px-5 py-4 text-left">
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-accent/50 text-muted-foreground">{icon}</div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-foreground">{title}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
        <ChevronDown size={16} className={`flex-shrink-0 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div className="border-t border-border/60 px-5 py-4">{children}</div>}
    </Card>
  );
}

export default function AdvancedSettingsPage() {
  const { organization, canAdmin } = useSettingsContext();
  const [ssoConnections, setSsoConnections] = useState<SsoConnectionConfig[]>([]);
  const [apiKeys, setApiKeys] = useState<ApiKeyDefinition[]>([]);
  const [retentionPolicies, setRetentionPolicies] = useState<RetentionPolicy[]>([]);
  const [ipPolicy, setIpPolicy] = useState<IpRestrictionPolicy | null>(null);
  const [newKeyName, setNewKeyName] = useState("");
  const [newPolicy, setNewPolicy] = useState({ entityType: "", classification: "internal" as DataClassification, retentionDays: 365 });
  const [newCidr, setNewCidr] = useState("");

  useEffect(() => {
    (async () => {
      if (!organization) return;
      setSsoConnections(ssoProviderRegistry.getConnectionsForOrganization(organization.id));
      setApiKeys(apiClientRegistry.listApiKeysForOrganization(organization.id));
      setRetentionPolicies(dataGovernanceRegistry.list());
      setIpPolicy(policyEngine.getIpRestriction(organization.id));
    })();
  }, [organization]);

  if (!organization) return null;

  if (!canAdmin) {
    return (
      <div className="flex items-center justify-center py-24">
        <ModuleEmptyState icon={<Lock size={32} />} title="Administrators only" description="Advanced Settings contains SSO, API keys, and compliance controls — ask an organization admin for access." />
      </div>
    );
  }

  function createApiKey() {
    if (!newKeyName.trim()) return;
    const id = generateId(16);
    apiClientRegistry.registerApiKey({ id, organizationId: organization!.id, name: newKeyName.trim(), keyPrefix: `sk_${id.slice(0, 6)}`, scopes: ["*"], isActive: true, createdAt: new Date().toISOString() });
    setApiKeys(apiClientRegistry.listApiKeysForOrganization(organization!.id));
    setNewKeyName("");
  }

  function revokeApiKey(id: string) {
    apiClientRegistry.revokeApiKey(id);
    setApiKeys(apiClientRegistry.listApiKeysForOrganization(organization!.id));
  }

  function addRetentionPolicy() {
    if (!newPolicy.entityType.trim()) return;
    dataGovernanceRegistry.registerPolicy(newPolicy);
    setRetentionPolicies(dataGovernanceRegistry.list());
    setNewPolicy({ entityType: "", classification: "internal", retentionDays: 365 });
  }

  function setIpMode(mode: IpRestrictionPolicy["mode"]) {
    const next: IpRestrictionPolicy = { organizationId: organization!.id, mode, cidrs: ipPolicy?.cidrs ?? [] };
    policyEngine.setIpRestriction(next);
    setIpPolicy(next);
  }

  function addCidr() {
    if (!newCidr.trim() || !ipPolicy) return;
    const next = { ...ipPolicy, cidrs: [...ipPolicy.cidrs, newCidr.trim()] };
    policyEngine.setIpRestriction(next);
    setIpPolicy(next);
    setNewCidr("");
  }

  function removeCidr(cidr: string) {
    if (!ipPolicy) return;
    const next = { ...ipPolicy, cidrs: ipPolicy.cidrs.filter(c => c !== cidr) };
    policyEngine.setIpRestriction(next);
    setIpPolicy(next);
  }

  return (
    <div className="mx-auto max-w-3xl space-y-3">
      <div>
        <h2 className="text-lg font-bold text-foreground">Advanced Settings</h2>
        <p className="text-sm text-muted-foreground">Administrator-only controls. Collapsed by default — most people never need to open these.</p>
      </div>

      <Section icon={<Users size={16} />} title="Single Sign-On (SSO)" description="Let your organization sign in through an identity provider.">
        {ssoConnections.length === 0 ? (
          <p className="text-xs text-muted-foreground">No identity provider connected yet.</p>
        ) : (
          <ul className="space-y-1.5">
            {ssoConnections.map(c => (
              <li key={c.id} className="flex items-center justify-between rounded-lg bg-accent/30 px-3 py-2 text-xs">
                <span className="text-foreground">{c.displayName}</span>
                <span className="text-muted-foreground">{c.protocol.toUpperCase()}</span>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-2 text-[11px] text-muted-foreground">Connections are registered here for the organizations that need them; completing a live sign-in handshake with your identity provider (Okta, Azure AD, Google Workspace) is not available yet.</p>
      </Section>

      <Section icon={<Network size={16} />} title="SCIM Provisioning" description="Automatically add and remove people as they join or leave your identity provider.">
        <ModuleEmptyState icon={<Network size={24} />} title="Not yet available" description="Automatic user provisioning via SCIM isn't ready yet — add and remove people from Users & Teams in the meantime." />
      </Section>

      <Section icon={<Key size={16} />} title="API Keys" description="For connecting your own tools to Calixo.">
        <div className="space-y-1.5">
          {apiKeys.length === 0 ? (
            <p className="text-xs text-muted-foreground">No API keys yet.</p>
          ) : (
            apiKeys.map(k => (
              <div key={k.id} className="flex items-center justify-between rounded-lg bg-accent/30 px-3 py-2 text-xs">
                <div>
                  <span className="font-medium text-foreground">{k.name}</span>{" "}
                  <span className="text-muted-foreground">{k.keyPrefix}••••••</span>
                  {!k.isActive && <span className="ml-1.5 text-destructive">(revoked)</span>}
                </div>
                {k.isActive && (
                  <button onClick={() => revokeApiKey(k.id)} className="text-muted-foreground hover:text-destructive">
                    <Trash2 size={12} />
                  </button>
                )}
              </div>
            ))
          )}
        </div>
        <div className="mt-2 flex gap-1.5">
          <Input inputSize="sm" placeholder="Key name (e.g. Zapier integration)" value={newKeyName} onChange={e => setNewKeyName(e.target.value)} />
          <Button size="sm" variant="outline" onClick={createApiKey}>
            Create Key
          </Button>
        </div>
        <p className="mt-2 text-[11px] text-muted-foreground">Keys are registered for real, but issuing a real usable secret is not available yet.</p>
      </Section>

      <Section icon={<Webhook size={16} />} title="Webhooks" description="Send real-time events to your own systems.">
        <p className="text-xs text-muted-foreground">Webhook payloads are signed and verified with real HMAC-SHA256 signatures. Manage individual webhook connections from a connected integration under Integrations.</p>
      </Section>

      <Section icon={<ShieldCheck size={16} />} title="Data Retention" description="How long different kinds of data are kept.">
        <div className="space-y-1.5">
          {retentionPolicies.length === 0 ? (
            <p className="text-xs text-muted-foreground">No retention policies configured — data is kept indefinitely.</p>
          ) : (
            retentionPolicies.map(p => (
              <div key={p.entityType} className="flex items-center justify-between rounded-lg bg-accent/30 px-3 py-2 text-xs">
                <span className="text-foreground">{p.entityType}</span>
                <span className="text-muted-foreground capitalize">
                  {p.classification} · {p.retentionDays} days
                </span>
              </div>
            ))
          )}
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          <Input inputSize="sm" placeholder="Data type (e.g. audit-log)" value={newPolicy.entityType} onChange={e => setNewPolicy(p => ({ ...p, entityType: e.target.value }))} className="w-40" />
          <select className="input w-32" value={newPolicy.classification} onChange={e => setNewPolicy(p => ({ ...p, classification: e.target.value as DataClassification }))}>
            {CLASSIFICATIONS.map(c => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <Input inputSize="sm" type="number" placeholder="Days" value={newPolicy.retentionDays} onChange={e => setNewPolicy(p => ({ ...p, retentionDays: Number(e.target.value) }))} className="w-24" />
          <Button size="sm" variant="outline" onClick={addRetentionPolicy}>
            Add
          </Button>
        </div>
      </Section>

      <Section icon={<ShieldCheck size={16} />} title="Compliance" description="Certifications and compliance reporting.">
        <ModuleEmptyState icon={<ShieldCheck size={24} />} title="Not yet available" description="Compliance reporting beyond data classification (above) isn't ready yet." />
      </Section>

      <Section icon={<Lock size={16} />} title="Custom Policies" description="Organization-specific rules beyond the defaults.">
        <ModuleEmptyState icon={<Lock size={24} />} title="Not yet available" description="Custom policy authoring isn't ready yet." />
      </Section>

      <Section icon={<Network size={16} />} title="IP Restrictions" description="Limit sign-in to specific networks.">
        <div className="flex gap-1.5">
          {(["off", "allowlist", "denylist"] as const).map(mode => (
            <button
              key={mode}
              type="button"
              onClick={() => setIpMode(mode)}
              className={`rounded-lg border px-3 py-1.5 text-xs font-medium capitalize transition-colors ${ipPolicy?.mode === mode ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:bg-accent"}`}
            >
              {mode}
            </button>
          ))}
        </div>
        {ipPolicy && ipPolicy.mode !== "off" && (
          <div className="mt-2.5 space-y-2">
            <div className="flex flex-wrap gap-1.5">
              {ipPolicy.cidrs.map(cidr => (
                <span key={cidr} className="inline-flex items-center gap-1.5 rounded-lg bg-accent/30 px-2.5 py-1 text-xs text-foreground">
                  {cidr}
                  <button onClick={() => removeCidr(cidr)} className="text-muted-foreground hover:text-destructive">
                    <X size={11} />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-1.5">
              <Input inputSize="sm" placeholder="192.168.1.0/24" value={newCidr} onChange={e => setNewCidr(e.target.value)} />
              <Button size="sm" variant="outline" onClick={addCidr}>
                Add
              </Button>
            </div>
          </div>
        )}
      </Section>
    </div>
  );
}
