/**
 * Calixo Platform - Invitation Types
 *
 * Architecture only — invitation metadata, no email delivery, no SSO/OAuth.
 */

export type InvitationStatus = "pending" | "accepted" | "rejected" | "expired" | "cancelled";

export const INVITATION_STATUSES: InvitationStatus[] = ["pending", "accepted", "rejected", "expired", "cancelled"];

import type { PeopleAccessLevel } from "./user";

export interface Invitation {
  id: string;
  email: string;
  organizationId: string;
  workspaceId: string;
  teamId?: string;
  /** The single access-level choice from the brief's 4-step invite flow — see `PeopleAccessLevel` in `./user`. */
  accessLevel: PeopleAccessLevel;
  roleIds: string[];
  invitedBy: string;
  status: InvitationStatus;
  token: string;
  message?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
  respondedAt?: string;
}

export interface InvitationActionResult {
  success: boolean;
  errors: string[];
  invitation?: Invitation;
}
