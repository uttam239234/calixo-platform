"use client";

import { useState } from "react";
import { Plus, RotateCcw, X } from "lucide-react";
import type { CreateInvitationInput, Invitation, Team } from "@/core/users";

interface WorkspaceOption {
  id: string;
  name: string;
}

interface InvitationPanelProps {
  invitations: Invitation[];
  workspaces: WorkspaceOption[];
  teams: Team[];
  currentActor: string;
  onCreate: (input: CreateInvitationInput) => void;
  onResend: (id: string) => void;
  onCancel: (id: string) => void;
}

function InvitationRow({ invitation, action }: { invitation: Invitation; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-2 rounded-lg border border-border/60 px-2.5 py-2">
      <div className="min-w-0">
        <p className="truncate text-xs font-medium text-foreground">{invitation.email}</p>
        <p className="text-[10px] text-muted-foreground">Expires {new Date(invitation.expiresAt).toLocaleDateString()}</p>
      </div>
      {action}
    </div>
  );
}

export function InvitationPanel({ invitations, workspaces, teams, currentActor, onCreate, onResend, onCancel }: InvitationPanelProps) {
  const [showForm, setShowForm] = useState(false);
  const [email, setEmail] = useState("");
  const [workspaceId, setWorkspaceId] = useState(workspaces[0]?.id ?? "");
  const [teamId, setTeamId] = useState("");

  const pending = invitations.filter(i => i.status === "pending");
  const accepted = invitations.filter(i => i.status === "accepted");
  const rejected = invitations.filter(i => i.status === "rejected");
  const expired = invitations.filter(i => i.status === "expired" || i.status === "cancelled");

  const submit = () => {
    if (!email.trim() || !workspaceId) return;
    onCreate({ email: email.trim(), workspaceId, teamId: teamId || undefined, invitedBy: currentActor });
    setEmail("");
    setTeamId("");
    setShowForm(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Invitations</p>
        <button type="button" onClick={() => setShowForm(v => !v)} className="flex items-center gap-1 text-[11px] text-primary hover:underline">
          <Plus size={11} /> New Invitation
        </button>
      </div>

      {showForm && (
        <div className="card space-y-2 p-3">
          <input className="input h-8 text-xs" placeholder="person@company.com" value={email} onChange={e => setEmail(e.target.value)} />
          <select className="input h-8 text-xs" value={workspaceId} onChange={e => setWorkspaceId(e.target.value)}>
            {workspaces.map(w => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </select>
          <select className="input h-8 text-xs" value={teamId} onChange={e => setTeamId(e.target.value)}>
            <option value="">No team</option>
            {teams
              .filter(t => t.workspaceId === workspaceId)
              .map(t => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
          </select>
          <button type="button" onClick={submit} className="btn-primary w-full rounded-lg px-3 py-1.5 text-xs font-medium">
            Send Invitation
          </button>
        </div>
      )}

      <div>
        <p className="mb-1.5 text-[10px] uppercase tracking-wide text-muted-foreground">Pending ({pending.length})</p>
        <div className="space-y-1.5">
          {pending.length === 0 && <p className="text-xs text-muted-foreground">None</p>}
          {pending.map(invitation => (
            <InvitationRow
              key={invitation.id}
              invitation={invitation}
              action={
                <div className="flex flex-shrink-0 gap-1">
                  <button type="button" onClick={() => onResend(invitation.id)} className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground" title="Resend">
                    <RotateCcw size={11} />
                  </button>
                  <button type="button" onClick={() => onCancel(invitation.id)} className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-destructive" title="Cancel">
                    <X size={11} />
                  </button>
                </div>
              }
            />
          ))}
        </div>
      </div>

      <div>
        <p className="mb-1.5 text-[10px] uppercase tracking-wide text-muted-foreground">Accepted ({accepted.length})</p>
        <div className="space-y-1.5">
          {accepted.length === 0 && <p className="text-xs text-muted-foreground">None</p>}
          {accepted.map(invitation => (
            <InvitationRow key={invitation.id} invitation={invitation} />
          ))}
        </div>
      </div>

      <div>
        <p className="mb-1.5 text-[10px] uppercase tracking-wide text-muted-foreground">Rejected ({rejected.length})</p>
        <div className="space-y-1.5">
          {rejected.length === 0 && <p className="text-xs text-muted-foreground">None</p>}
          {rejected.map(invitation => (
            <InvitationRow key={invitation.id} invitation={invitation} />
          ))}
        </div>
      </div>

      <div>
        <p className="mb-1.5 text-[10px] uppercase tracking-wide text-muted-foreground">Expired / Cancelled ({expired.length})</p>
        <div className="space-y-1.5">
          {expired.length === 0 && <p className="text-xs text-muted-foreground">None</p>}
          {expired.map(invitation => (
            <InvitationRow key={invitation.id} invitation={invitation} />
          ))}
        </div>
      </div>
    </div>
  );
}
