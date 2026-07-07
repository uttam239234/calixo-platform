/** Calixo Platform - Users Platform API. The sanctioned way another module reads user data — wraps `UserRegistry` instead of exposing it for direct cross-module reads. */
import { userRegistry } from "../registry/UserRegistry";
import type { UserSummary } from "@/core/platform/contracts";

export class UsersPlatformAPI {
  getUserSummary(id: string): UserSummary | undefined {
    const user = userRegistry.lookup(id);
    if (!user) return undefined;
    return { id: user.id, displayName: user.displayName, email: user.email, status: user.status, workspaceId: user.workspaceId };
  }

  listUserSummaries(workspaceId?: string): UserSummary[] {
    return userRegistry.list({ workspaceId }).map(user => ({ id: user.id, displayName: user.displayName, email: user.email, status: user.status, workspaceId: user.workspaceId }));
  }
}

export const usersPlatformAPI = new UsersPlatformAPI();
