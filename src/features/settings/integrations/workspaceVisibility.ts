/**
 * Calixo Platform - Integrations "Connected Apps Center": Workspace Visibility
 *
 * The brief's Workspace Model ("Organizations own integrations. Workspaces
 * consume integrations." — e.g. Marketing AND Admissions both listing
 * Google Analytics) is a fan-out relationship the real `ConnectorOwnership`
 * record can't express — it tracks exactly one *owning* workspace per
 * connection (governance/sharing), not "which workspaces can see this."
 * This is a small, additive, presentation-layer store for that fan-out —
 * it doesn't touch `ConnectorOwnership` or any real connector data, and
 * every connection it references is still a real `Connection` id.
 *
 * Feeds `useWorkspaces.ts`'s `WorkspaceCard.connectedIntegrations`, closing
 * the disclosed real-zero stub Round 12 left there.
 */

const visibilityByConnection = new Map<string, Set<string>>();

export function grantWorkspaceAccess(connectionId: string, workspaceId: string): void {
  const set = visibilityByConnection.get(connectionId) ?? new Set<string>();
  set.add(workspaceId);
  visibilityByConnection.set(connectionId, set);
}

export function revokeWorkspaceAccess(connectionId: string, workspaceId: string): void {
  visibilityByConnection.get(connectionId)?.delete(workspaceId);
}

export function getWorkspacesForConnection(connectionId: string): string[] {
  return Array.from(visibilityByConnection.get(connectionId) ?? []);
}

export function getConnectionsForWorkspace(workspaceId: string): string[] {
  const result: string[] = [];
  for (const [connectionId, workspaceIds] of visibilityByConnection) {
    if (workspaceIds.has(workspaceId)) result.push(connectionId);
  }
  return result;
}

export function clearConnectionVisibility(connectionId: string): void {
  visibilityByConnection.delete(connectionId);
}
