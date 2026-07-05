"use client";

/**
 * Calixo Users & Teams Center - invitation list/lifecycle state.
 * The only place allowed to call InvitationEngine — components never
 * import it directly.
 */

import { useCallback, useEffect, useState } from "react";
import { invitationEngine } from "@/core/users";
import type { CreateInvitationInput, Invitation, InvitationActionResult, InvitationStatus } from "@/core/users";

export function useInvitations() {
  const [invitations, setInvitations] = useState<Invitation[]>([]);

  const refresh = useCallback(() => {
    setInvitations(invitationEngine.list());
  }, []);

  useEffect(() => {
    (async () => {
      refresh();
    })();
  }, [refresh]);

  const create = useCallback(
    (input: CreateInvitationInput): Invitation => {
      const invitation = invitationEngine.create(input);
      refresh();
      return invitation;
    },
    [refresh]
  );

  const accept = useCallback(
    (id: string): InvitationActionResult => {
      const result = invitationEngine.accept(id);
      if (result.success) refresh();
      return result;
    },
    [refresh]
  );

  const reject = useCallback(
    (id: string): InvitationActionResult => {
      const result = invitationEngine.reject(id);
      if (result.success) refresh();
      return result;
    },
    [refresh]
  );

  const cancel = useCallback(
    (id: string): InvitationActionResult => {
      const result = invitationEngine.cancel(id);
      if (result.success) refresh();
      return result;
    },
    [refresh]
  );

  const resend = useCallback(
    (id: string): InvitationActionResult => {
      const result = invitationEngine.resend(id);
      if (result.success) refresh();
      return result;
    },
    [refresh]
  );

  const byStatus = useCallback(
    (status: InvitationStatus) => invitations.filter(i => i.status === status),
    [invitations]
  );

  return {
    invitations,
    create,
    accept,
    reject,
    cancel,
    resend,
    byStatus,
    refresh,
  };
}

export type UseInvitationsResult = ReturnType<typeof useInvitations>;
