"use client";

import { CheckCircle2, Loader2 } from "lucide-react";
import { SimpleDialog } from "@/components/settings/users/SimpleDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import type { useConnectWizard } from "@/hooks/useConnectWizard";
import type { WorkspaceCard } from "@/hooks/useWorkspaces";
import { iconForApp } from "@/features/settings/integrations/constants";

interface ConnectAppDialogProps {
  wizard: ReturnType<typeof useConnectWizard>;
  workspaces: WorkspaceCard[];
}

const STEP_LABELS: Record<string, string> = {
  connect: "Connect",
  authenticate: "Authenticate",
  select_account: "Select Accounts",
  done: "Done",
};

const STEP_ORDER = ["connect", "authenticate", "select_account", "done"];

/** The brief's 5-step Connect flow (Choose App is the marketplace card click that opens this dialog). Under 30 seconds, never Client ID/Redirect URI/Scopes. */
export function ConnectAppDialog({ wizard, workspaces }: ConnectAppDialogProps) {
  const { app, step, accountName, setAccountName, workspaceIds, toggleWorkspace, connecting, error, close, advance } = wizard;
  if (!app) return null;

  const stepIndex = STEP_ORDER.indexOf(step);

  return (
    <SimpleDialog title={`Connect ${app.name}`} onClose={close}>
      <div className="mb-5 flex items-center gap-1.5">
        {STEP_ORDER.map((s, i) => (
          <div key={s} className={`h-1.5 flex-1 rounded-full ${i <= stepIndex ? "bg-primary" : "bg-border"}`} title={STEP_LABELS[s]} />
        ))}
      </div>

      {step === "connect" && (
        <div className="space-y-4 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-3xl">{iconForApp(app.providerId)}</div>
          <div>
            <p className="font-semibold text-foreground">{app.name}</p>
            <p className="mt-1 text-sm text-muted-foreground">{app.description}</p>
          </div>
          <p className="text-xs text-muted-foreground">Takes about 30 seconds. You&apos;ll sign in to {app.name} and choose what to share.</p>
        </div>
      )}

      {step === "authenticate" && (
        <div className="space-y-4 text-center">
          <Loader2 className="mx-auto text-primary" size={32} />
          <p className="text-sm text-foreground">Simulating connection to {app.name} (demo mode).</p>
          <p className="text-xs text-muted-foreground">No real account access is requested — nothing connects until you confirm.</p>
        </div>
      )}

      {step === "select_account" && (
        <div className="space-y-4">
          <Input label="Account Name" value={accountName} onChange={e => setAccountName(e.target.value)} placeholder={`${app.name} Account`} />
          {workspaces.length > 0 && (
            <div>
              <p className="label mb-2">Which workspaces should see this?</p>
              <div className="space-y-1.5">
                {workspaces.map(w => (
                  <label key={w.workspace.id} className="flex items-center gap-2.5 rounded-lg border border-border px-3 py-2 text-sm hover:bg-accent">
                    <input type="checkbox" checked={workspaceIds.includes(w.workspace.id)} onChange={() => toggleWorkspace(w.workspace.id)} className="h-4 w-4 rounded border-border" />
                    <span className="text-foreground">{w.workspace.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {step === "done" && (
        <div className="space-y-3 text-center">
          <CheckCircle2 className="mx-auto text-success" size={40} />
          <p className="font-semibold text-foreground">{app.name} is connected.</p>
          <p className="text-sm text-muted-foreground">You can manage it anytime from Connected Apps.</p>
        </div>
      )}

      {error && <p className="mt-3 text-sm text-destructive">{error}</p>}

      <div className="mt-6 flex justify-end gap-2">
        {step !== "done" && (
          <Button variant="outline" onClick={close}>
            Cancel
          </Button>
        )}
        <Button onClick={advance} disabled={connecting}>
          {connecting ? "Connecting…" : step === "connect" ? "Connect" : step === "authenticate" ? "Continue" : step === "select_account" ? "Connect Account" : "Done"}
        </Button>
      </div>
    </SimpleDialog>
  );
}
