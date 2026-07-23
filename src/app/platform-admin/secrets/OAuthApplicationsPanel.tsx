"use client";

/**
 * Calixo Platform - OAuth Applications Console (Platform Admin -> Platform Secrets)
 *
 * Renders inside the existing Platform Secrets page when the "OAuth
 * Applications" tab is selected — no new route, no new navigation. Every
 * read/write goes through `./oauthActions.ts`; secret fields (Client
 * Secret, Signing Secret, Bot Token) are masked password inputs and the
 * server never echoes a plaintext value back after save.
 */
import { useEffect, useState } from "react";
import {
  ShieldCheck, ShieldAlert, ShieldX, ShieldOff, RefreshCw, Save, FlaskConical, History, X, Lock, ChevronDown, ChevronUp, Copy, Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { SimpleDialog } from "@/components/settings/users/SimpleDialog";
import { formatRelativeTime } from "@/shared/utils/date";
import { listOAuthApplicationsAction, saveOAuthApplicationAction, resetOAuthApplicationAction, validateOAuthApplicationAction, testOAuthApplicationAction, getOAuthAuditLogAction } from "./oauthActions";
import type { OAuthApplicationInput, OAuthApplicationSummary, OAuthAuditEntry, OAuthProviderId } from "@/core/platform/secrets/oauth";

interface DraftState {
  clientId: string;
  clientSecret: string;
  projectId: string;
  tenantId: string;
  scopes: string[];
  googleSelectedServices: string[];
  extraFieldValues: Record<string, string>;
  extraSecretValues: Record<string, string>;
}

function draftFromSummary(summary: OAuthApplicationSummary): DraftState {
  const extraFieldValues: Record<string, string> = {};
  const extraSecretValues: Record<string, string> = {};
  for (const field of summary.extraFields) {
    if (field.kind === "plain") extraFieldValues[field.key] = field.value ?? "";
    else extraSecretValues[field.key] = "";
  }
  return {
    clientId: summary.clientId ?? "",
    clientSecret: "",
    projectId: summary.projectId ?? "",
    tenantId: summary.tenantId ?? "",
    scopes: summary.scopes,
    googleSelectedServices: summary.googleServices?.selected ?? [],
    extraFieldValues,
    extraSecretValues,
  };
}

/**
 * The Universal Connector Framework has exactly one, provider-agnostic
 * OAuth callback (`src/app/api/connectors/oauth/callback/route.ts`) — every
 * provider's `redirectPathHint` now points at it. The Redirect URI a vendor
 * needs is therefore fully determined by the browser's own origin plus that
 * one path; there is nothing for an admin to type, and typing the wrong
 * thing (the historical bug: a stale per-provider hint that had no matching
 * route) is exactly what this removes. `window.location.origin` — not a
 * hardcoded prod domain — is what makes this genuinely environment-aware:
 * it's correct in dev (`http://localhost:3000`), in production, and on any
 * preview/staging origin without needing separate configuration.
 */
function callbackRedirectUri(origin: string, redirectPathHint: string): string {
  return origin ? `${origin}${redirectPathHint}` : "";
}

/** Pure client-side scope preview — dedupes/orders scopes for whatever is currently checked in the picker, before Save even runs, so "Automatically Generated" feels live. */
function computeGeneratedScopes(catalog: NonNullable<OAuthApplicationSummary["googleServices"]>["catalog"], selected: string[]): string[] {
  const selectedSet = new Set(selected);
  const scopes = new Set<string>();
  for (const service of catalog) {
    if (!selectedSet.has(service.id)) continue;
    for (const scope of service.scopes) scopes.add(scope);
  }
  return Array.from(scopes);
}

function StatusBadge({ status }: { status: OAuthApplicationSummary["status"] }) {
  const config = {
    configured: { icon: ShieldCheck, label: "Configured", tone: "success" },
    missing: { icon: ShieldOff, label: "Missing", tone: "warning" },
    validation_failed: { icon: ShieldAlert, label: "Validation Failed", tone: "destructive" },
    disabled: { icon: ShieldX, label: "Disabled", tone: "secondary" },
  }[status];
  const Icon = config.icon;
  return (
    <span className={`badge badge-${config.tone} gap-1`}>
      <Icon size={12} />
      {config.label}
    </span>
  );
}

function ResultBadge({ outcome }: { outcome?: string }) {
  if (!outcome) return null;
  const tone = outcome === "valid" || outcome === "success" ? "success" : outcome === "format_only" ? "warning" : "destructive";
  return <span className={`badge badge-${tone} text-[10px] uppercase tracking-wide`}>{outcome.replace(/_/g, " ")}</span>;
}

export function OAuthApplicationsPanel() {
  const [applications, setApplications] = useState<OAuthApplicationSummary[] | null>(null);
  const [canManage, setCanManage] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [busyProvider, setBusyProvider] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, DraftState>>({});
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [confirmingReset, setConfirmingReset] = useState<string | null>(null);
  const [auditProvider, setAuditProvider] = useState<OAuthProviderId | null>(null);
  const [banner, setBanner] = useState<{ tone: "success" | "error"; text: string } | null>(null);
  // Resolved after mount, not inline in render — matches server-rendered "" so hydration never mismatches, then fills in the real origin.
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    (async () => {
      setOrigin(window.location.origin);
    })();
  }, []);

  async function load() {
    const res = await listOAuthApplicationsAction();
    if (res.ok && res.applications) {
      setApplications(res.applications);
      setCanManage(Boolean(res.canManage));
      setDrafts(prev => {
        const next = { ...prev };
        for (const app of res.applications!) if (!next[app.provider]) next[app.provider] = draftFromSummary(app);
        return next;
      });
    } else {
      setLoadError(res.error ?? "Failed to load OAuth applications.");
    }
  }

  useEffect(() => {
    (async () => {
      await load();
    })();
  }, []);

  function flash(tone: "success" | "error", text: string) {
    setBanner({ tone, text });
    setTimeout(() => setBanner(current => (current?.text === text ? null : current)), 4500);
  }

  function updateDraft(provider: string, patch: Partial<DraftState>) {
    setDrafts(prev => ({ ...prev, [provider]: { ...prev[provider], ...patch } }));
  }

  function patchSummary(summary: OAuthApplicationSummary) {
    setApplications(prev => (prev ? prev.map(a => (a.provider === summary.provider ? summary : a)) : prev));
    setDrafts(prev => ({ ...prev, [summary.provider]: draftFromSummary(summary) }));
  }

  async function handleSave(provider: OAuthProviderId) {
    const draft = drafts[provider];
    if (!draft) return;
    setBusyProvider(provider);
    const input: OAuthApplicationInput = {
      clientId: draft.clientId,
      clientSecret: draft.clientSecret || undefined,
      projectId: draft.projectId || undefined,
      tenantId: draft.tenantId || undefined,
      scopes: draft.scopes,
      googleSelectedServices: draft.googleSelectedServices,
      extraFieldValues: draft.extraFieldValues,
      extraSecretValues: draft.extraSecretValues,
    };
    const result = await saveOAuthApplicationAction(provider, input);
    setBusyProvider(null);
    if (result.ok && result.summary) {
      patchSummary(result.summary);
      flash("success", `${result.summary.cardTitle} saved.`);
    } else {
      flash("error", result.error ?? "Save failed.");
    }
  }

  async function handleReset(provider: OAuthProviderId) {
    setConfirmingReset(null);
    setBusyProvider(provider);
    const result = await resetOAuthApplicationAction(provider);
    setBusyProvider(null);
    if (result.ok && result.summary) {
      patchSummary(result.summary);
      flash("success", `${result.summary.cardTitle} reset.`);
    } else {
      flash("error", result.error ?? "Reset failed.");
    }
  }

  async function handleValidate(provider: OAuthProviderId) {
    setBusyProvider(provider);
    const result = await validateOAuthApplicationAction(provider);
    setBusyProvider(null);
    if (result.ok && result.summary) patchSummary(result.summary);
    else flash("error", result.error ?? "Validation failed.");
  }

  async function handleTest(provider: OAuthProviderId) {
    setBusyProvider(provider);
    const result = await testOAuthApplicationAction(provider);
    setBusyProvider(null);
    if (result.ok && result.summary) patchSummary(result.summary);
    else flash("error", result.error ?? "Test failed.");
  }

  if (loadError) return <p className="text-sm text-destructive">{loadError}</p>;
  if (!applications) return <p className="text-sm text-muted-foreground">Loading OAuth applications…</p>;

  return (
    <div>
      <p className="mb-4 max-w-3xl text-sm text-muted-foreground">
        Platform-owned OAuth applications Calixo registers with each vendor — never a customer&apos;s connected account or access token. Client Secrets are sealed on save and
        never displayed again.
        {!canManage && (
          <span className="ml-1.5 inline-flex items-center gap-1 text-warning">
            <Lock size={12} /> Read-only — only the Platform Owner can make changes.
          </span>
        )}
      </p>

      {banner && (
        <div className={`mb-4 flex items-center justify-between gap-3 rounded-xl border px-4 py-2.5 text-sm ${banner.tone === "success" ? "border-success/20 bg-success/5 text-success" : "border-destructive/20 bg-destructive/5 text-destructive"}`}>
          <span>{banner.text}</span>
          <button onClick={() => setBanner(null)} aria-label="Dismiss" className="opacity-70 hover:opacity-100">
            <X size={14} />
          </button>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {applications.map(app => (
          <OAuthApplicationCard
            key={app.provider}
            app={app}
            draft={drafts[app.provider] ?? draftFromSummary(app)}
            busy={busyProvider === app.provider}
            canManage={canManage}
            origin={origin}
            expanded={Boolean(expanded[app.provider])}
            confirmingReset={confirmingReset === app.provider}
            onToggleExpanded={() => setExpanded(prev => ({ ...prev, [app.provider]: !prev[app.provider] }))}
            onDraftChange={patch => updateDraft(app.provider, patch)}
            onSave={() => handleSave(app.provider)}
            onValidate={() => handleValidate(app.provider)}
            onTest={() => handleTest(app.provider)}
            onRequestReset={() => setConfirmingReset(app.provider)}
            onCancelReset={() => setConfirmingReset(null)}
            onConfirmReset={() => handleReset(app.provider)}
            onViewAuditLog={() => setAuditProvider(app.provider)}
          />
        ))}
      </div>

      {auditProvider && <AuditLogDialog provider={auditProvider} title={applications.find(a => a.provider === auditProvider)?.cardTitle ?? auditProvider} onClose={() => setAuditProvider(null)} />}
    </div>
  );
}

function OAuthApplicationCard({
  app,
  draft,
  busy,
  canManage,
  origin,
  expanded,
  confirmingReset,
  onToggleExpanded,
  onDraftChange,
  onSave,
  onValidate,
  onTest,
  onRequestReset,
  onCancelReset,
  onConfirmReset,
  onViewAuditLog,
}: {
  app: OAuthApplicationSummary;
  draft: DraftState;
  busy: boolean;
  canManage: boolean;
  origin: string;
  expanded: boolean;
  confirmingReset: boolean;
  onToggleExpanded: () => void;
  onDraftChange: (patch: Partial<DraftState>) => void;
  onSave: () => void;
  onValidate: () => void;
  onTest: () => void;
  onRequestReset: () => void;
  onCancelReset: () => void;
  onConfirmReset: () => void;
  onViewAuditLog: () => void;
}) {
  const readOnly = !canManage;
  const redirectUri = callbackRedirectUri(origin, app.redirectPathHint);
  const canSave = draft.clientId.trim() && (app.hasClientSecret || draft.clientSecret.trim());
  const [copied, setCopied] = useState(false);

  async function copyRedirectUri() {
    if (!redirectUri) return;
    await navigator.clipboard.writeText(redirectUri);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex flex-col rounded-2xl border border-border bg-card p-5">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-semibold text-foreground">{app.cardTitle}</p>
          <div className="mt-1 flex flex-wrap gap-1">
            {app.connectors.map(c => (
              <span key={c} className="rounded-full bg-surface/60 px-2 py-0.5 text-[10px] text-muted-foreground">
                {c}
              </span>
            ))}
          </div>
        </div>
        <StatusBadge status={app.status} />
      </div>

      <p className="mt-2 text-xs text-muted-foreground">{app.description}</p>

      {/* Completion */}
      <div className="mt-3">
        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
          <span>Configuration</span>
          <span className="tabular-nums">{app.completionPercent}%</span>
        </div>
        <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-surface/60">
          <div className={`h-full rounded-full ${app.completionPercent === 100 ? "bg-success" : "bg-primary"}`} style={{ width: `${app.completionPercent}%` }} />
        </div>
      </div>

      {/* Core fields */}
      <div className="mt-4 space-y-3">
        <Input label={app.clientIdLabel} value={draft.clientId} onChange={e => onDraftChange({ clientId: e.target.value })} disabled={readOnly} placeholder={`Real ${app.clientIdLabel}`} />
        <Input
          label={app.clientSecretLabel}
          type="password"
          autoComplete="off"
          value={draft.clientSecret}
          onChange={e => onDraftChange({ clientSecret: e.target.value })}
          disabled={readOnly}
          placeholder={app.hasClientSecret ? "•••••••••••••• (sealed — enter a new value to replace)" : `Real ${app.clientSecretLabel}`}
        />
        {app.hasProjectId && <Input label="Project ID" value={draft.projectId} onChange={e => onDraftChange({ projectId: e.target.value })} disabled={readOnly} />}
        {app.hasTenantId && <Input label="Tenant ID" value={draft.tenantId} onChange={e => onDraftChange({ tenantId: e.target.value })} disabled={readOnly} placeholder="GUID, or 'common'" />}
        <div>
          <label className="label">Redirect URI</label>
          <div className="mt-1 flex items-center gap-2">
            <code className="min-w-0 flex-1 truncate rounded-lg border border-border bg-surface/60 px-3 py-2 text-xs text-foreground" title={redirectUri}>
              {redirectUri || "Resolving…"}
            </code>
            <Button type="button" size="sm" variant="outline" onClick={copyRedirectUri} disabled={!redirectUri}>
              {copied ? <Check size={13} /> : <Copy size={13} />}
              {copied ? "Copied" : "Copy"}
            </Button>
          </div>
          <p className="mt-1.5 text-[11px] text-muted-foreground">
            Auto-generated from the Universal Connector Framework&apos;s single OAuth callback — register this exact URL in {app.cardTitle}.
          </p>
        </div>
      </div>

      {/* Advanced: Google Services picker, or the generic scope chips + extra fields for every other provider */}
      {app.provider === "google" && app.googleServices ? (
        <GoogleServicesCard app={app} selected={draft.googleSelectedServices} readOnly={readOnly} expanded={expanded} onToggleExpanded={onToggleExpanded} onChange={next => onDraftChange({ googleSelectedServices: next })} />
      ) : (
        (app.hasScopes || app.extraFields.length > 0) && (
          <div className="mt-3">
            <button onClick={onToggleExpanded} className="flex w-full items-center justify-between rounded-lg px-1 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground">
              <span>{expanded ? "Hide" : "Show"} scopes{app.extraFields.length > 0 ? " & additional fields" : ""}</span>
              {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
            {expanded && (
              <div className="space-y-3 rounded-xl border border-dashed border-border bg-surface/30 p-3">
                {app.hasScopes && (
                  <div>
                    <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Default OAuth Scopes</p>
                    <div className="flex flex-wrap gap-1.5">
                      {app.scopeOptions.map(opt => {
                        const active = draft.scopes.includes(opt.scope);
                        return (
                          <button
                            key={opt.scope}
                            disabled={readOnly}
                            onClick={() => onDraftChange({ scopes: active ? draft.scopes.filter(s => s !== opt.scope) : [...draft.scopes, opt.scope] })}
                            title={opt.scope}
                            className={`rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors ${active ? "border-primary/40 bg-primary/10 text-primary" : "border-border bg-card text-muted-foreground"} ${readOnly ? "opacity-70" : "hover:border-primary/30"}`}
                          >
                            {opt.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
                {app.extraFields.map(field => (
                  <Input
                    key={field.key}
                    label={field.label}
                    type={field.kind === "secret" ? "password" : "text"}
                    autoComplete="off"
                    value={field.kind === "secret" ? draft.extraSecretValues[field.key] ?? "" : draft.extraFieldValues[field.key] ?? ""}
                    onChange={e =>
                      field.kind === "secret"
                        ? onDraftChange({ extraSecretValues: { ...draft.extraSecretValues, [field.key]: e.target.value } })
                        : onDraftChange({ extraFieldValues: { ...draft.extraFieldValues, [field.key]: e.target.value } })
                    }
                    disabled={readOnly}
                    placeholder={field.kind === "secret" && field.configured ? "•••••••••••••• (sealed)" : field.placeholder}
                  />
                ))}
              </div>
            )}
          </div>
        )
      )}

      {/* Metadata */}
      <div className="mt-4 space-y-1.5 text-xs text-muted-foreground">
        {app.provider === "google" && app.googleServices && (
          <div className="mb-2 grid grid-cols-2 gap-x-3 gap-y-1 rounded-lg bg-surface/60 p-2.5 text-[11px]">
            <span>Provider</span>
            <span className="text-right font-medium text-foreground">Google</span>
            <span>Selected Services</span>
            <span className="text-right font-medium tabular-nums text-foreground">{app.googleServices.selected.length}</span>
            <span>Generated Scope Count</span>
            <span className="text-right font-medium tabular-nums text-foreground">{app.googleServices.generatedScopes.length}</span>
            <span>Validation Result</span>
            <span className="flex justify-end"><ResultBadge outcome={app.validationResult} /></span>
            <span>Network Result</span>
            <span className="flex justify-end"><ResultBadge outcome={app.testResult} /></span>
          </div>
        )}
        <div className="flex justify-between gap-2">
          <span>Last Updated</span>
          <span className="text-foreground">{app.updatedAt ? `${formatRelativeTime(app.updatedAt)}${app.updatedByName ? ` · ${app.updatedByName}` : ""}` : "—"}</span>
        </div>
        <div className="flex justify-between gap-2">
          <span>Last Validated</span>
          <span className="flex items-center gap-1.5 text-foreground">
            {app.validatedAt ? formatRelativeTime(app.validatedAt) : "—"}
            <ResultBadge outcome={app.validationResult} />
          </span>
        </div>
        <div className="flex justify-between gap-2">
          <span>Last Tested</span>
          <span className="flex items-center gap-1.5 text-foreground">
            {app.testedAt ? formatRelativeTime(app.testedAt) : "—"}
            <ResultBadge outcome={app.testResult} />
          </span>
        </div>
        {app.validationMessage && app.validationResult === "invalid" && (
          app.provider === "google" && app.validationMessage.includes("Configuration Incomplete") ? (
            <div className="mt-1 rounded-lg border border-warning/25 bg-warning/5 px-2.5 py-2">
              <p className="text-[11px] font-semibold text-warning">Configuration Incomplete</p>
              <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">
                No Google services have been selected. Select one or more Google services to automatically generate the required OAuth scopes.
              </p>
            </div>
          ) : (
            <p className="pt-1 text-[11px] leading-snug text-destructive/90">{app.validationMessage}</p>
          )
        )}
        {app.testMessage && <p className="pt-1 text-[11px] leading-snug text-muted-foreground/80">{app.testMessage}</p>}
      </div>

      {/* Actions */}
      <div className="mt-4 flex flex-1 flex-wrap items-end gap-2">
        {confirmingReset ? (
          <>
            <span className="text-xs text-muted-foreground">Reset this application?</span>
            <Button size="sm" variant="outline" loading={busy} onClick={onConfirmReset}>
              Yes, reset
            </Button>
            <Button size="sm" variant="ghost" onClick={onCancelReset}>
              Cancel
            </Button>
          </>
        ) : (
          <>
            <Button size="sm" loading={busy} onClick={onSave} disabled={busy || readOnly || !canSave}>
              <Save size={13} />
              Save
            </Button>
            <Button size="sm" variant="outline" loading={busy} onClick={onValidate} disabled={busy || readOnly || app.status === "missing"}>
              <ShieldCheck size={13} />
              Validate
            </Button>
            <Button size="sm" variant="outline" loading={busy} onClick={onTest} disabled={busy || readOnly || app.status === "missing"}>
              <FlaskConical size={13} />
              Test OAuth
            </Button>
            <Button size="sm" variant="outline" onClick={onRequestReset} disabled={busy || readOnly || app.status === "missing"}>
              <RefreshCw size={13} />
              Reset
            </Button>
            <Button size="sm" variant="ghost" onClick={onViewAuditLog}>
              <History size={13} />
              Audit Log
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

/**
 * Google Cloud OAuth's Scope Manager — a Platform Owner picks products
 * ("Google Ads", "Gmail", ...), never a raw scope URL. The real OAuth
 * scopes are generated automatically (read-only, shown only if expanded)
 * from whichever services are checked; nothing here is manually typed.
 */
function GoogleServicesCard({
  app,
  selected,
  readOnly,
  expanded,
  onToggleExpanded,
  onChange,
}: {
  app: OAuthApplicationSummary;
  selected: string[];
  readOnly: boolean;
  expanded: boolean;
  onToggleExpanded: () => void;
  onChange: (next: string[]) => void;
}) {
  const [showScopes, setShowScopes] = useState(false);
  const catalog = app.googleServices!.catalog;
  const generatedScopes = computeGeneratedScopes(catalog, selected);

  function toggle(id: string) {
    onChange(selected.includes(id) ? selected.filter(s => s !== id) : [...selected, id]);
  }

  return (
    <div className="mt-3">
      <button onClick={onToggleExpanded} className="flex w-full items-center justify-between rounded-lg px-1 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground">
        <span>
          Google Services <span className="text-foreground">· {selected.length} selected</span>
        </span>
        {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>
      {expanded && (
        <div className="space-y-3 rounded-xl border border-dashed border-border bg-surface/30 p-3">
          <div>
            <p className="text-xs font-semibold text-foreground">Google Services</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">Select the Google services Calixo should access.</p>
          </div>

          <div className="space-y-0.5">
            {catalog.map(svc => {
              const checked = selected.includes(svc.id);
              return (
                <label
                  key={svc.id}
                  title={svc.description}
                  className={`flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs ${readOnly ? "" : "cursor-pointer hover:bg-surface/60"}`}
                >
                  <input type="checkbox" checked={checked} disabled={readOnly} onChange={() => toggle(svc.id)} className="size-3.5 rounded border-border accent-primary" />
                  <span className={checked ? "text-foreground" : "text-muted-foreground"}>{svc.label}</span>
                </label>
              );
            })}
          </div>

          <div className="space-y-1.5 rounded-lg bg-surface/60 p-2.5 text-[11px]">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Selected Services</span>
              <span className="font-semibold tabular-nums text-foreground">{selected.length} Selected</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Required OAuth Scopes</span>
              <span className="font-medium text-primary">Automatically Generated</span>
            </div>
          </div>

          <div>
            <button onClick={() => setShowScopes(s => !s)} disabled={generatedScopes.length === 0} className="flex w-full items-center justify-between text-[11px] font-medium text-muted-foreground hover:text-foreground disabled:opacity-50">
              <span>Show Generated Scopes ({generatedScopes.length})</span>
              {showScopes ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </button>
            {showScopes && (
              <div className="mt-1.5 space-y-1 rounded-lg border border-border bg-card p-2">
                {generatedScopes.length === 0 ? (
                  <p className="text-[11px] text-muted-foreground">No services selected yet — no scopes to show.</p>
                ) : (
                  generatedScopes.map(scope => (
                    <p key={scope} className="truncate font-mono text-[10px] text-muted-foreground" title={scope}>
                      {scope}
                    </p>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function AuditLogDialog({ provider, title, onClose }: { provider: OAuthProviderId; title: string; onClose: () => void }) {
  const [entries, setEntries] = useState<OAuthAuditEntry[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const res = await getOAuthAuditLogAction(provider);
      if (res.ok && res.entries) setEntries(res.entries);
      else setError(res.error ?? "Failed to load audit log.");
    })();
  }, [provider]);

  return (
    <SimpleDialog title={`Audit Log — ${title}`} description="Every change made to this OAuth application, most recent first." onClose={onClose}>
      {error && <p className="text-sm text-destructive">{error}</p>}
      {!entries && !error && <p className="text-sm text-muted-foreground">Loading…</p>}
      {entries && entries.length === 0 && <p className="text-sm text-muted-foreground">No changes recorded yet.</p>}
      {entries && entries.length > 0 && (
        <div className="max-h-80 space-y-2 overflow-y-auto">
          {entries
            .slice()
            .reverse()
            .map(entry => (
              <div key={entry.id} className="rounded-xl border border-border bg-surface/40 p-3 text-xs">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="font-medium text-foreground">{entry.userName ?? entry.userId}</span>
                  <span>{formatRelativeTime(entry.timestamp)}</span>
                </div>
                <p className="mt-1 text-foreground">{entry.description}</p>
              </div>
            ))}
        </div>
      )}
      <div className="mt-4 flex justify-end">
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      </div>
    </SimpleDialog>
  );
}
