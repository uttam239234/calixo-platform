"use client";

import { useMemo, useState } from "react";
import { Send, RotateCcw, XCircle } from "lucide-react";
import { ModuleHeader } from "@/components/enterprise/module";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { useSettingsContext } from "@/features/settings/SettingsProvider";
import { useInvitations } from "@/hooks/useInvitations";
import { useTeams } from "@/hooks/useTeams";
import { ACCESS_LEVEL_LABELS, PEOPLE_ACCESS_LEVELS } from "@/core/users";
import type { InvitationStatus, PeopleAccessLevel } from "@/core/users";
import { formatRelativeTime } from "@/shared/utils/date";

const STATUS_LABELS: Record<InvitationStatus, string> = {
  pending: "Pending",
  accepted: "Accepted",
  rejected: "Declined",
  expired: "Expired",
  cancelled: "Revoked",
};

const STATUS_BADGE: Record<InvitationStatus, string> = {
  pending: "bg-info/10 text-info",
  accepted: "bg-success/10 text-success",
  rejected: "bg-muted text-muted-foreground",
  expired: "bg-warning/10 text-warning",
  cancelled: "bg-muted text-muted-foreground",
};

export default function InvitationsPage() {
  const { tenantContext, canManageUsers } = useSettingsContext();
  const organizationId = tenantContext.organizationId;
  const invitations = useInvitations(organizationId);
  const teams = useTeams(organizationId);

  const [email, setEmail] = useState("");
  const [teamId, setTeamId] = useState("");
  const [accessLevel, setAccessLevel] = useState<PeopleAccessLevel>("member");
  const [statusFilter, setStatusFilter] = useState<InvitationStatus | "">("");
  const [sentJustNow, setSentJustNow] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  const filtered = useMemo(() => (statusFilter ? invitations.byStatus(statusFilter) : invitations.invitations), [invitations, statusFilter]);

  const handleSend = async () => {
    if (!email.trim()) return;
    setSendError(null);
    try {
      await invitations.create({
        email: email.trim().toLowerCase(),
        workspaceId: "workspace-growth-engine",
        teamId: teamId || undefined,
        accessLevel,
        invitedBy: tenantContext.userId,
      });
      setEmail("");
      setTeamId("");
      setAccessLevel("member");
      setSentJustNow(true);
      setTimeout(() => setSentJustNow(false), 3000);
    } catch (error) {
      // Real denials from `EntitlementService.canInviteUser` (seat limit reached) surface here.
      setSendError(error instanceof Error ? error.message : "Something went wrong sending that invitation.");
    }
  };

  return (
    <div>
      <ModuleHeader title="Invitations" description="Invite people, choose their team and access level." />

      {canManageUsers && (
        <div className="mb-6 rounded-2xl border border-border bg-card p-5">
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="label">1. Email Address</label>
              <Input placeholder="name@company.com" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSend()} />
            </div>
            <div>
              <label className="label">2. Team</label>
              <select className="input" value={teamId} onChange={e => setTeamId(e.target.value)}>
                <option value="">No team yet</option>
                {teams.teams.map(team => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">3. Access Level</label>
              <select className="input" value={accessLevel} onChange={e => setAccessLevel(e.target.value as PeopleAccessLevel)}>
                {PEOPLE_ACCESS_LEVELS.map(level => (
                  <option key={level} value={level}>
                    {ACCESS_LEVEL_LABELS[level]}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-3">
            <Button disabled={!email.trim()} onClick={handleSend}>
              <Send size={15} />
              4. Send Invite
            </Button>
            {sentJustNow && <span className="text-sm text-success">Invitation sent.</span>}
          </div>
          {sendError && <p className="mt-2 text-sm text-destructive">{sendError}</p>}
        </div>
      )}

      <div className="mb-4 flex flex-wrap gap-1.5">
        <FilterPill label="All" active={statusFilter === ""} onClick={() => setStatusFilter("")} />
        {(Object.keys(STATUS_LABELS) as InvitationStatus[]).map(status => (
          <FilterPill key={status} label={STATUS_LABELS[status]} active={statusFilter === status} onClick={() => setStatusFilter(status)} />
        ))}
      </div>

      <div className="space-y-2">
        {filtered.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">No invitations here.</p>
        ) : (
          filtered.map(invitation => (
            <div key={invitation.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3">
              <div className="min-w-0">
                <p className="truncate font-medium text-foreground">{invitation.email}</p>
                <p className="text-xs text-muted-foreground">
                  {ACCESS_LEVEL_LABELS[invitation.accessLevel]}
                  {invitation.teamId && ` · ${teams.lookup(invitation.teamId)?.name ?? "Unknown team"}`} · Invited {formatRelativeTime(invitation.createdAt)}
                </p>
              </div>
              <div className="flex flex-shrink-0 items-center gap-2">
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_BADGE[invitation.status]}`}>{STATUS_LABELS[invitation.status]}</span>
                {invitation.status === "pending" && canManageUsers && (
                  <>
                    <Button size="xs" variant="outline" onClick={() => invitations.resend(invitation.id)}>
                      <RotateCcw size={12} /> Resend
                    </Button>
                    <Button size="xs" variant="outline" onClick={() => invitations.cancel(invitation.id)}>
                      <XCircle size={12} /> Revoke
                    </Button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function FilterPill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-accent"}`}
    >
      {label}
    </button>
  );
}
