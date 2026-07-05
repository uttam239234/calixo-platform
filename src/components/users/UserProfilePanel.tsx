"use client";

import { useState } from "react";
import { CheckCircle2, AlertCircle, Pencil, RotateCcw, Save, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { User, UserSaveResult, UserValidationResult } from "@/core/users";

type EditableFields = Pick<User, "displayName" | "phone" | "department" | "title" | "timezone" | "language">;

interface UserProfilePanelProps {
  user: User | null;
  managerName?: string;
  teamNames: string[];
  workspaceName: string;
  onUpdateProfile: (patch: Partial<EditableFields>) => UserSaveResult;
  onResetProfile: () => UserSaveResult;
  validate: (patch: Partial<User>) => UserValidationResult;
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="text-xs text-foreground">{value || "—"}</p>
    </div>
  );
}

function issueFor(validation: UserValidationResult, field: string): string | undefined {
  return validation.issues.find(i => i.field === field)?.message;
}

export function UserProfilePanel({ user, managerName, teamNames, workspaceName, onUpdateProfile, onResetProfile, validate }: UserProfilePanelProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Partial<EditableFields>>({});

  if (!user) {
    return <p className="p-1 text-xs text-muted-foreground">Select a user to see their profile.</p>;
  }

  const current: EditableFields = {
    displayName: draft.displayName ?? user.displayName,
    phone: draft.phone ?? user.phone ?? "",
    department: draft.department ?? user.department,
    title: draft.title ?? user.title,
    timezone: draft.timezone ?? user.timezone,
    language: draft.language ?? user.language,
  };
  const validation = validate({ ...user, ...current });
  const isDefault = JSON.stringify(user) === JSON.stringify({ ...user, ...current });

  const startEdit = () => {
    setDraft({});
    setEditing(true);
  };

  const cancelEdit = () => {
    setDraft({});
    setEditing(false);
  };

  const save = () => {
    if (!validation.valid) return;
    const result = onUpdateProfile(draft);
    if (result.success) {
      setDraft({});
      setEditing(false);
    }
  };

  const initials = user.displayName
    .split(" ")
    .map(part => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">{initials}</span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-foreground">{user.displayName}</p>
          <p className="truncate text-xs text-muted-foreground">@{user.username}</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-[11px] text-muted-foreground">{isDefault ? "No local edits" : "Edited"}</span>
        {editing ? (
          <div className="flex gap-1.5">
            <button type="button" onClick={cancelEdit} className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground">
              <X size={11} /> Cancel
            </button>
            <button type="button" onClick={save} disabled={!validation.valid} className="flex items-center gap-1 text-[11px] text-primary hover:underline disabled:opacity-50">
              <Save size={11} /> Save
            </button>
          </div>
        ) : (
          <div className="flex gap-1.5">
            <button type="button" onClick={() => onResetProfile()} className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground">
              <RotateCcw size={11} /> Reset
            </button>
            <button type="button" onClick={startEdit} className="flex items-center gap-1 text-[11px] text-primary hover:underline">
              <Pencil size={11} /> Edit
            </button>
          </div>
        )}
      </div>

      {editing ? (
        <div className="space-y-2.5">
          {(["displayName", "phone", "department", "title", "timezone", "language"] as const).map(field => {
            const issue = issueFor(validation, field);
            return (
              <div key={field}>
                <p className="mb-1 text-[10px] uppercase tracking-wide text-muted-foreground">{field}</p>
                <input
                  className={cn("input h-8 text-xs", issue && "input-error")}
                  value={current[field]}
                  onChange={e => setDraft(prev => ({ ...prev, [field]: e.target.value }))}
                />
                {issue && (
                  <p className="mt-0.5 flex items-center gap-1 text-[10px] text-destructive">
                    <AlertCircle size={10} /> {issue}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <Field label="Email" value={user.email} />
          <Field label="Phone" value={user.phone ?? ""} />
          <Field label="Department" value={user.department} />
          <Field label="Job Title" value={user.title} />
          <Field label="Manager" value={managerName ?? ""} />
          <Field label="Workspace" value={workspaceName} />
          <Field label="Language" value={user.language} />
          <Field label="Timezone" value={user.timezone} />
        </div>
      )}

      <div>
        <p className="mb-1 text-[10px] uppercase tracking-wide text-muted-foreground">Teams</p>
        <div className="flex flex-wrap gap-1">
          {teamNames.length === 0 ? <span className="text-xs text-muted-foreground">No teams</span> : teamNames.map(name => <span key={name} className="badge badge-outline">{name}</span>)}
        </div>
      </div>

      <div>
        <p className="mb-1 text-[10px] uppercase tracking-wide text-muted-foreground">Feature Flags</p>
        <div className="flex flex-wrap gap-1">
          {user.featureFlags.length === 0 ? <span className="text-xs text-muted-foreground">None</span> : user.featureFlags.map(flag => <span key={flag} className="badge badge-ai">{flag}</span>)}
        </div>
      </div>

      <div>
        <p className="mb-1 text-[10px] uppercase tracking-wide text-muted-foreground">Preferences</p>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          {validation.valid ? <CheckCircle2 size={12} className="text-success" /> : <AlertCircle size={12} className="text-destructive" />}
          Theme: {user.preferences.theme ?? "system"}
        </div>
      </div>
    </div>
  );
}
