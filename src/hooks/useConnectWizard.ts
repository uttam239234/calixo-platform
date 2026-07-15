"use client";

/**
 * Calixo Integrations - Connect flow step state (Section: Connect Flow).
 *
 * The platform's real `ConnectorWizardEngine` state machine can't drive
 * this: it throws for any provider without a registered manifest (5 of the
 * brief's 14 apps predate the manifest system and must stay that way — see
 * `additionalConnectors.ts`), and its own "connect" step creates the
 * connection through `integrationService` directly, bypassing
 * `ConnectorRuntime`'s permission check/audit/ownership tracking entirely.
 * This hook keeps the brief's 5-step shape (Choose App -> Connect ->
 * Authenticate -> Select Accounts -> Done) as local UI state and performs
 * the actual mutation through the real, permission-gated
 * `connectorPlatformAPI.install()` (via `useIntegrations().install`) —
 * real for all 14 apps uniformly, never Client ID/Redirect URI/Scopes.
 */

import { useCallback, useState } from "react";
import { grantWorkspaceAccess } from "@/features/settings/integrations/workspaceVisibility";
import type { AppListing } from "@/features/settings/integrations/marketplace";
import type { Connection } from "@/integrations/types";

export type ConnectStep = "connect" | "authenticate" | "select_account" | "done";

export interface UseConnectWizardOptions {
  onInstall: (providerId: string, appName: string) => Promise<Connection>;
}

export function useConnectWizard({ onInstall }: UseConnectWizardOptions) {
  const [app, setApp] = useState<AppListing | null>(null);
  const [step, setStep] = useState<ConnectStep>("connect");
  const [accountName, setAccountName] = useState("");
  const [workspaceIds, setWorkspaceIds] = useState<string[]>([]);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState("");

  const open = useCallback((listing: AppListing) => {
    setApp(listing);
    setStep("connect");
    setAccountName(`${listing.name} Account`);
    setWorkspaceIds([]);
    setConnecting(false);
    setError("");
  }, []);

  const close = useCallback(() => setApp(null), []);

  const toggleWorkspace = useCallback((workspaceId: string) => {
    setWorkspaceIds(prev => (prev.includes(workspaceId) ? prev.filter(id => id !== workspaceId) : [...prev, workspaceId]));
  }, []);

  const advance = useCallback(async () => {
    if (!app) return;
    if (step === "connect") {
      setStep("authenticate");
      return;
    }
    if (step === "authenticate") {
      setStep("select_account");
      return;
    }
    if (step === "select_account") {
      setConnecting(true);
      setError("");
      try {
        const connection = await onInstall(app.providerId, app.name);
        for (const workspaceId of workspaceIds) grantWorkspaceAccess(connection.id, workspaceId);
        setStep("done");
      } catch (err) {
        setError(err instanceof Error ? err.message : `We couldn't connect ${app.name}. Please try again.`);
      } finally {
        setConnecting(false);
      }
      return;
    }
    close();
  }, [app, step, workspaceIds, onInstall, close]);

  return { app, step, accountName, setAccountName, workspaceIds, toggleWorkspace, connecting, error, open, close, advance };
}

export type UseConnectWizardResult = ReturnType<typeof useConnectWizard>;
