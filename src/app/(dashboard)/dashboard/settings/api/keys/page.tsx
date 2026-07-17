"use client";

import { useState } from "react";
import { Plus, Copy, Ban, RotateCw, Trash2, Key as KeyIcon, Check } from "lucide-react";
import { ModuleHeader, ModuleEmptyState } from "@/components/enterprise/module";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { SimpleDialog } from "@/components/settings/users/SimpleDialog";
import { useSettingsContext } from "@/features/settings/SettingsProvider";
import { useApiKeys, useNow } from "@/features/settings/api/useApiKeys";
import { AVAILABLE_SCOPES, scopeLabel } from "@/features/settings/api/normalize";
import type { ApiKeyDefinition } from "@/core/platform/access/apiAuth/types";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" });
}

function relativeTime(iso?: string): string {
  if (!iso) return "Never used";
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.round(diffMs / 60_000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

function CreateKeyDialog({ onSubmit, onClose }: { onSubmit: (name: string, scopes: string[]) => Promise<void>; onClose: () => void }) {
  const [name, setName] = useState("");
  const [scopes, setScopes] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  return (
    <SimpleDialog title="Create API Key" description="For connecting your own tools to Calixo." onClose={onClose}>
      <div className="space-y-4">
        <Input label="Key name" placeholder="e.g. Zapier integration" value={name} onChange={e => setName(e.target.value)} />
        <div>
          <label className="label">Permissions</label>
          <div className="space-y-1.5">
            {AVAILABLE_SCOPES.map(scope => (
              <label key={scope} className="flex items-center gap-2 text-sm text-foreground">
                <input
                  type="checkbox"
                  checked={scopes.includes(scope)}
                  onChange={e => setScopes(prev => (e.target.checked ? [...prev, scope] : prev.filter(s => s !== scope)))}
                />
                {scopeLabel(scope)}
              </label>
            ))}
          </div>
        </div>
        {error && (
          <p className="text-xs font-medium text-destructive" role="alert">
            {error}
          </p>
        )}
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button
            loading={saving}
            onClick={async () => {
              if (!name.trim()) {
                setError("Give this key a name.");
                return;
              }
              setSaving(true);
              await onSubmit(name.trim(), scopes);
              setSaving(false);
            }}
          >
            Create Key
          </Button>
        </div>
      </div>
    </SimpleDialog>
  );
}

function RevealKeyDialog({ name, plaintextKey, onClose }: { name: string; plaintextKey: string; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  return (
    <SimpleDialog title={`"${name}" is ready`} description="Copy this key now — you won't be able to see it again." onClose={onClose}>
      <div className="space-y-4">
        <div className="flex items-center gap-2 rounded-lg border border-border bg-accent/30 px-3 py-2.5">
          <code className="flex-1 truncate text-xs text-foreground">{plaintextKey}</code>
          <Button
            size="sm"
            variant="outline"
            icon={copied ? <Check size={13} /> : <Copy size={13} />}
            onClick={() => {
              void navigator.clipboard.writeText(plaintextKey);
              setCopied(true);
            }}
          >
            {copied ? "Copied" : "Copy"}
          </Button>
        </div>
        <div className="flex justify-end">
          <Button onClick={onClose}>Done</Button>
        </div>
      </div>
    </SimpleDialog>
  );
}

function KeyCard({
  apiKey,
  onDisable,
  onRotate,
  onDelete,
  canUpdate,
  canManage,
  busy,
}: {
  apiKey: ApiKeyDefinition;
  onDisable: () => void;
  onRotate: () => void;
  onDelete: () => void;
  canUpdate: boolean;
  canManage: boolean;
  busy: boolean;
}) {
  return (
    <Card className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-foreground">{apiKey.name}</p>
          <p className="mt-0.5 font-mono text-xs text-muted-foreground">{apiKey.keyPrefix}••••••••••••</p>
        </div>
        <span className={`flex-shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${apiKey.isActive ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}`}>
          {apiKey.isActive ? "Active" : "Disabled"}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
        <div>
          <p className="text-[11px] uppercase tracking-wide">Created</p>
          <p className="mt-0.5 text-foreground">{formatDate(apiKey.createdAt)}</p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-wide">Last Used</p>
          <p className="mt-0.5 text-foreground">{relativeTime(apiKey.lastUsedAt)}</p>
        </div>
      </div>

      <div>
        <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Permissions</p>
        <p className="mt-0.5 text-xs text-foreground">{apiKey.scopes.map(scopeLabel).join(", ")}</p>
      </div>

      <div className="flex flex-wrap gap-1.5 pt-1">
        {apiKey.isActive && canUpdate && (
          <>
            <Button size="sm" variant="outline" icon={<Ban size={13} />} disabled={busy} onClick={onDisable}>
              Disable
            </Button>
            <Button size="sm" variant="outline" icon={<RotateCw size={13} />} loading={busy} onClick={onRotate}>
              Rotate
            </Button>
          </>
        )}
        {canManage && (
          <Button size="sm" variant="outline" icon={<Trash2 size={13} />} disabled={busy} onClick={onDelete}>
            Delete
          </Button>
        )}
      </div>
    </Card>
  );
}

export default function ApiKeysPage() {
  const { tenantContext, canUpdateApi, canManageApi } = useSettingsContext();
  const keys = useApiKeys(tenantContext.organizationId);
  const now = useNow();
  const [createOpen, setCreateOpen] = useState(false);
  const [deleting, setDeleting] = useState<ApiKeyDefinition | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="API Keys"
        description="For connecting your own tools to Calixo."
        quickActions={
          canManageApi && (
            <Button icon={<Plus size={16} />} onClick={() => setCreateOpen(true)}>
              Create
            </Button>
          )
        }
      />

      {keys.usage?.rule && now !== null && (
        <Card className="flex items-center justify-between text-sm">
          <div>
            <p className="font-semibold text-foreground">
              {(keys.usage.rule.limit - (keys.usage.remaining ?? keys.usage.rule.limit)).toLocaleString()} of {keys.usage.rule.limit.toLocaleString()} API requests used
            </p>
            <p className="text-xs text-muted-foreground">This minute · resets in {Math.max(0, Math.round(((keys.usage.resetAt ?? now) - now) / 1000))}s</p>
          </div>
        </Card>
      )}

      {!keys.loading && keys.keys.length === 0 && (
        <ModuleEmptyState icon={<KeyIcon size={28} />} title="No API keys yet" description="Create a key to let your own tools connect to Calixo." />
      )}

      {actionError && <p className="text-sm text-destructive">{actionError}</p>}

      <div className="grid gap-4 sm:grid-cols-2">
        {keys.keys.map(apiKey => (
          <KeyCard
            key={apiKey.id}
            apiKey={apiKey}
            canUpdate={canUpdateApi}
            canManage={canManageApi}
            busy={busyId === apiKey.id}
            onDisable={async () => {
              setBusyId(apiKey.id);
              setActionError(null);
              try {
                await keys.disable(apiKey.id);
              } catch (error) {
                setActionError(error instanceof Error ? error.message : `Couldn't disable "${apiKey.name}". Please try again.`);
              } finally {
                setBusyId(null);
              }
            }}
            onRotate={async () => {
              setBusyId(apiKey.id);
              setActionError(null);
              try {
                await keys.rotate(apiKey);
              } catch (error) {
                setActionError(error instanceof Error ? error.message : `Couldn't rotate "${apiKey.name}". Please try again.`);
              } finally {
                setBusyId(null);
              }
            }}
            onDelete={() => setDeleting(apiKey)}
          />
        ))}
      </div>

      {createOpen && (
        <CreateKeyDialog
          onSubmit={async (name, scopes) => {
            await keys.create(name, scopes);
            setCreateOpen(false);
          }}
          onClose={() => setCreateOpen(false)}
        />
      )}

      {keys.justIssued && <RevealKeyDialog name={keys.justIssued.name} plaintextKey={keys.justIssued.plaintextKey} onClose={keys.dismissJustIssued} />}

      {deleting && (
        <SimpleDialog title="Delete this API key?" description={`"${deleting.name}" will stop working immediately.`} onClose={() => setDeleting(null)}>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDeleting(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                await keys.archive(deleting.id);
                setDeleting(null);
              }}
            >
              Delete
            </Button>
          </div>
        </SimpleDialog>
      )}
    </div>
  );
}
