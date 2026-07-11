/**
 * Calixo Platform - Invitation Engine
 *
 * Architecture only — stores invitation metadata and its state machine
 * (pending → accepted/rejected/expired/cancelled). No email delivery, no
 * SSO/OAuth token exchange lives here.
 */

import { generateId } from "@/shared/utils/string";
import type { Invitation, InvitationActionResult, InvitationStatus, PeopleAccessLevel } from "../types/index";

export interface CreateInvitationInput {
  email: string;
  organizationId: string;
  workspaceId: string;
  teamId?: string;
  accessLevel: PeopleAccessLevel;
  roleIds?: string[];
  invitedBy: string;
  message?: string;
  expiresInDays?: number;
  metadata?: Record<string, unknown>;
}

const DEFAULT_EXPIRY_DAYS = 14;

export class InvitationEngine {
  private invitations: Map<string, Invitation> = new Map();

  create(input: CreateInvitationInput): Invitation {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + (input.expiresInDays ?? DEFAULT_EXPIRY_DAYS) * 24 * 60 * 60 * 1000);
    const invitation: Invitation = {
      id: generateId(12),
      email: input.email,
      organizationId: input.organizationId,
      workspaceId: input.workspaceId,
      teamId: input.teamId,
      accessLevel: input.accessLevel,
      roleIds: input.roleIds ?? [],
      invitedBy: input.invitedBy,
      status: "pending",
      token: generateId(32),
      message: input.message,
      metadata: input.metadata,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
    };
    this.invitations.set(invitation.id, invitation);
    return invitation;
  }

  accept(id: string): InvitationActionResult {
    return this.transition(id, "pending", "accepted");
  }

  reject(id: string): InvitationActionResult {
    return this.transition(id, "pending", "rejected");
  }

  expire(id: string): InvitationActionResult {
    return this.transition(id, "pending", "expired");
  }

  cancel(id: string): InvitationActionResult {
    return this.transition(id, "pending", "cancelled");
  }

  resend(id: string, expiresInDays: number = DEFAULT_EXPIRY_DAYS): InvitationActionResult {
    const invitation = this.invitations.get(id);
    if (!invitation) return { success: false, errors: [`Unknown invitation: ${id}`] };
    if (invitation.status !== "pending") return { success: false, errors: [`Cannot resend an invitation with status: ${invitation.status}`] };

    invitation.token = generateId(32);
    invitation.expiresAt = new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000).toISOString();
    invitation.updatedAt = new Date().toISOString();
    return { success: true, errors: [], invitation };
  }

  private transition(id: string, from: InvitationStatus, to: InvitationStatus): InvitationActionResult {
    const invitation = this.invitations.get(id);
    if (!invitation) return { success: false, errors: [`Unknown invitation: ${id}`] };
    if (invitation.status !== from) return { success: false, errors: [`Cannot move invitation from ${invitation.status} to ${to}`] };

    invitation.status = to;
    invitation.updatedAt = new Date().toISOString();
    if (to === "accepted" || to === "rejected") invitation.respondedAt = invitation.updatedAt;
    return { success: true, errors: [], invitation };
  }

  lookup(id: string): Invitation | undefined {
    return this.invitations.get(id);
  }

  lookupByToken(token: string): Invitation | undefined {
    return Array.from(this.invitations.values()).find(i => i.token === token);
  }

  list(params: { organizationId?: string; workspaceId?: string; status?: InvitationStatus } = {}): Invitation[] {
    return Array.from(this.invitations.values())
      .filter(i => !params.organizationId || i.organizationId === params.organizationId)
      .filter(i => !params.workspaceId || i.workspaceId === params.workspaceId)
      .filter(i => !params.status || i.status === params.status);
  }

  register(invitation: Invitation): void {
    this.invitations.set(invitation.id, invitation);
  }

  registerMany(invitations: Invitation[]): void {
    for (const invitation of invitations) this.register(invitation);
  }

  count(): number {
    return this.invitations.size;
  }
}

export const invitationEngine = new InvitationEngine();
