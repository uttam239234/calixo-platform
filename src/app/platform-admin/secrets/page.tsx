"use client";

/**
 * Calixo Platform - Internal Platform Secrets Console
 *
 * Every read/write on this page goes through the Server Actions in
 * `./actions.ts` — never a direct client-side engine import, unlike every
 * other Platform Admin console page. Secrets Add/Update/Rotate submit a
 * plaintext value exactly once, server-side, and never receive it back:
 * every response here is a `PlatformSecretSummary` (metadata only).
 */
import { useEffect, useState } from "react";
import { KeyRound, ShieldCheck, ShieldAlert, RefreshCw, Pencil, FlaskConical, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { SimpleDialog } from "@/components/settings/users/SimpleDialog";
import { formatRelativeTime } from "@/shared/utils/date";
import { SECTION_LABELS, SECTION_ORDER } from "@/core/platform/secrets/sections";
import type { PlatformSecretSummary, SecretSection } from "@/core/platform/secrets";
import { listPlatformSecretsAction, addOrUpdateSecretAction, rotateSecretAction, validateSecretAction, testConnectionAction } from "./actions";
import { OAuthApplicationsPanel } from "./OAuthApplicationsPanel";

type DialogMode = "add" | "update" | "rotate";
interface DialogState {
  mode: DialogMode;
  secret: PlatformSecretSummary;
}
interface Banner {
  tone: "success" | "error";
  text: string;
}

export default function PlatformSecretsPage() {
  const [secrets, setSecrets] = useState<PlatformSecretSummary[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [section, setSection] = useState<SecretSection>("ai_providers");
  const [dialog, setDialog] = useState<DialogState | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [banner, setBanner] = useState<Banner | null>(null);

  useEffect(() => {
    (async () => {
      const res = await listPlatformSecretsAction();
      if (res.ok && res.secrets) setSecrets(res.secrets);
      else setLoadError(res.error ?? "Failed to load platform secrets.");
    })();
  }, []);

  function patch(summary: PlatformSecretSummary) {
    setSecrets(prev => (prev ? prev.map(s => (s.id === summary.id ? summary : s)) : prev));
  }

  function flash(tone: Banner["tone"], text: string) {
    setBanner({ tone, text });
    setTimeout(() => setBanner(current => (current?.text === text ? null : current)), 4000);
  }

  async function handleSubmitDialog(plaintext: string) {
    if (!dialog) return;
    const { mode, secret } = dialog;
    setBusyId(secret.id);
    const result = mode === "rotate" ? await rotateSecretAction(secret.id, plaintext) : await addOrUpdateSecretAction(secret.id, plaintext);
    setBusyId(null);
    if (result.ok && result.summary) {
      patch(result.summary);
      setDialog(null);
      flash("success", `${secret.label} ${mode === "add" ? "added" : mode === "update" ? "updated" : "rotated"}.`);
    } else {
      flash("error", result.error ?? "Something went wrong.");
    }
  }

  async function handleGenerateRotate(secret: PlatformSecretSummary) {
    setBusyId(secret.id);
    const result = await rotateSecretAction(secret.id);
    setBusyId(null);
    if (result.ok && result.summary) {
      patch(result.summary);
      flash("success", `${secret.label} rotated — a new value was generated and sealed.`);
    } else {
      flash("error", result.error ?? "Rotation failed.");
    }
  }

  async function handleValidate(secret: PlatformSecretSummary) {
    setBusyId(secret.id);
    const result = await validateSecretAction(secret.id);
    setBusyId(null);
    if (result.ok && result.summary) patch(result.summary);
    else flash("error", result.error ?? "Validation failed.");
  }

  async function handleTest(secret: PlatformSecretSummary) {
    setBusyId(secret.id);
    const result = await testConnectionAction(secret.id);
    setBusyId(null);
    if (result.ok && result.summary) patch(result.summary);
    else flash("error", result.error ?? "Connection test failed.");
  }

  const sectionCounts = SECTION_ORDER.reduce<Record<SecretSection, { configured: number; total: number }>>((acc, s) => {
    const inSection = secrets?.filter(secret => secret.section === s) ?? [];
    acc[s] = { configured: inSection.filter(secret => secret.status === "configured").length, total: inSection.length };
    return acc;
  }, {} as Record<SecretSection, { configured: number; total: number }>);

  return (
    <div>
      <p className="mb-4 max-w-3xl text-sm text-muted-foreground">
        Platform-level API keys and secrets for Calixo itself — distinct from a customer&apos;s own connected integrations. Values are sealed on save and are never displayed
        again; every change is written to the audit trail.
      </p>

      {banner && (
        <div className={`mb-4 flex items-center justify-between gap-3 rounded-xl border px-4 py-2.5 text-sm ${banner.tone === "success" ? "border-success/20 bg-success/5 text-success" : "border-destructive/20 bg-destructive/5 text-destructive"}`}>
          <span>{banner.text}</span>
          <button onClick={() => setBanner(null)} aria-label="Dismiss" className="opacity-70 hover:opacity-100">
            <X size={14} />
          </button>
        </div>
      )}

      <nav className="mb-6 flex flex-wrap gap-1.5">
        {SECTION_ORDER.map(s => (
          <button
            key={s}
            onClick={() => setSection(s)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${section === s ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-accent hover:text-foreground"}`}
          >
            {SECTION_LABELS[s]}
            {secrets && s !== "oauth_applications" && (
              <span className="ml-1.5 text-xs tabular-nums opacity-70">
                {sectionCounts[s].configured}/{sectionCounts[s].total}
              </span>
            )}
          </button>
        ))}
      </nav>

      {section === "oauth_applications" ? (
        <OAuthApplicationsPanel />
      ) : (
        <>
          {loadError && <p className="text-sm text-destructive">{loadError}</p>}
          {!secrets && !loadError && <p className="text-sm text-muted-foreground">Loading platform secrets…</p>}

          {secrets && (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {secrets
                .filter(s => s.section === section)
                .map(s => (
                  <SecretCard
                    key={s.id}
                    secret={s}
                    busy={busyId === s.id}
                    onAdd={() => setDialog({ mode: "add", secret: s })}
                    onUpdate={() => setDialog({ mode: "update", secret: s })}
                    onRotateManual={() => setDialog({ mode: "rotate", secret: s })}
                    onRotateGenerate={() => handleGenerateRotate(s)}
                    onValidate={() => handleValidate(s)}
                    onTest={() => handleTest(s)}
                  />
                ))}
            </div>
          )}
        </>
      )}

      {dialog && (
        <SecretDialog
          mode={dialog.mode}
          label={dialog.secret.label}
          placeholder={dialog.secret.placeholder}
          busy={busyId === dialog.secret.id}
          onClose={() => setDialog(null)}
          onSubmit={handleSubmitDialog}
        />
      )}
    </div>
  );
}

function StatusPill({ status }: { status: PlatformSecretSummary["status"] }) {
  return status === "configured" ? (
    <span className="badge badge-success gap-1">
      <ShieldCheck size={12} />
      Configured
    </span>
  ) : (
    <span className="badge badge-warning gap-1">
      <ShieldAlert size={12} />
      Missing
    </span>
  );
}

function ResultBadge({ outcome }: { outcome?: string }) {
  if (!outcome) return null;
  const tone = outcome === "valid" || outcome === "success" ? "success" : outcome === "format_only" ? "warning" : "destructive";
  return <span className={`badge badge-${tone} text-[10px] uppercase tracking-wide`}>{outcome.replace("_", " ")}</span>;
}

function SecretCard({
  secret,
  busy,
  onAdd,
  onUpdate,
  onRotateManual,
  onRotateGenerate,
  onValidate,
  onTest,
}: {
  secret: PlatformSecretSummary;
  busy: boolean;
  onAdd: () => void;
  onUpdate: () => void;
  onRotateManual: () => void;
  onRotateGenerate: () => void;
  onValidate: () => void;
  onTest: () => void;
}) {
  const [confirmingRotate, setConfirmingRotate] = useState(false);
  const configured = secret.status === "configured";

  return (
    <div className="flex flex-col rounded-2xl border border-border bg-card p-5">
      <div className="flex items-start justify-between gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <KeyRound size={16} />
        </div>
        <StatusPill status={secret.status} />
      </div>

      <p className="mt-3 font-semibold text-foreground">{secret.label}</p>
      <p className="mt-1 text-xs text-muted-foreground">{secret.description}</p>

      <div className="mt-4 space-y-1.5 text-xs text-muted-foreground">
        <div className="flex justify-between gap-2">
          <span>Last Updated</span>
          <span className="text-foreground">{secret.lastUpdatedAt ? `${formatRelativeTime(secret.lastUpdatedAt)}${secret.lastUpdatedByName ? ` · ${secret.lastUpdatedByName}` : ""}` : "—"}</span>
        </div>
        <div className="flex justify-between gap-2">
          <span>Last Validated</span>
          <span className="flex items-center gap-1.5 text-foreground">
            {secret.lastValidatedAt ? formatRelativeTime(secret.lastValidatedAt) : "—"}
            <ResultBadge outcome={secret.lastValidationResult} />
          </span>
        </div>
        <div className="flex justify-between gap-2">
          <span>Last Tested</span>
          <span className="flex items-center gap-1.5 text-foreground">
            {secret.lastTestedAt ? formatRelativeTime(secret.lastTestedAt) : "—"}
            <ResultBadge outcome={secret.lastTestResult} />
          </span>
        </div>
        {secret.lastTestMessage && <p className="pt-1 text-[11px] leading-snug text-muted-foreground/80">{secret.lastTestMessage}</p>}
      </div>

      <div className="mt-4 flex flex-1 flex-wrap items-end gap-2">
        {!configured ? (
          <Button size="sm" onClick={onAdd} disabled={busy}>
            <KeyRound size={13} />
            Add Secret
          </Button>
        ) : confirmingRotate ? (
          <>
            <span className="text-xs text-muted-foreground">Rotate now?</span>
            <Button
              size="sm"
              variant="outline"
              loading={busy}
              onClick={() => {
                setConfirmingRotate(false);
                onRotateGenerate();
              }}
            >
              Yes, rotate
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setConfirmingRotate(false)}>
              Cancel
            </Button>
          </>
        ) : (
          <>
            <Button size="sm" variant="outline" onClick={onUpdate} disabled={busy}>
              <Pencil size={13} />
              Update
            </Button>
            <Button size="sm" variant="outline" onClick={secret.rotationStrategy === "generate" ? () => setConfirmingRotate(true) : onRotateManual} disabled={busy}>
              <RefreshCw size={13} />
              Rotate
            </Button>
            <Button size="sm" variant="outline" loading={busy} onClick={onValidate} disabled={busy}>
              <ShieldCheck size={13} />
              Validate
            </Button>
            <Button size="sm" variant="outline" loading={busy} onClick={onTest} disabled={busy}>
              <FlaskConical size={13} />
              Test Connection
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

function SecretDialog({
  mode,
  label,
  placeholder,
  busy,
  onClose,
  onSubmit,
}: {
  mode: DialogMode;
  label: string;
  placeholder: string;
  busy: boolean;
  onClose: () => void;
  onSubmit: (plaintext: string) => void;
}) {
  const [value, setValue] = useState("");
  const title = mode === "add" ? `Add ${label}` : mode === "update" ? `Update ${label}` : `Rotate ${label}`;
  const description =
    mode === "rotate" ? "Paste the new value obtained from the vendor's own dashboard." : "This value is sealed immediately and will never be displayed again.";

  return (
    <SimpleDialog title={title} description={description} onClose={onClose}>
      <Input label="Secret value" type="password" autoComplete="off" placeholder={placeholder} value={value} onChange={e => setValue(e.target.value)} />
      <div className="mt-5 flex justify-end gap-2">
        <Button variant="outline" onClick={onClose} disabled={busy}>
          Cancel
        </Button>
        <Button onClick={() => onSubmit(value)} disabled={busy || !value.trim()} loading={busy}>
          {mode === "add" ? "Add" : mode === "update" ? "Save" : "Rotate"}
        </Button>
      </div>
    </SimpleDialog>
  );
}
