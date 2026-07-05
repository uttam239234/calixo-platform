"use client";

import { cn } from "@/lib/utils";
import type { PresenceRecord, PresenceStatus } from "@/core/users";
import { PRESENCE_DOT_CLASS, PRESENCE_LABEL } from "./constants";

interface PresencePanelProps {
  status: PresenceStatus | null;
  record: PresenceRecord | undefined;
  sessionCount: number;
}

export function PresencePanel({ status, record, sessionCount }: PresencePanelProps) {
  if (!status) {
    return <p className="p-1 text-xs text-muted-foreground">Select a user to see their presence.</p>;
  }

  const currentSession = record?.sessions[record.sessions.length - 1];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span className={cn("h-2.5 w-2.5 flex-shrink-0 rounded-full", PRESENCE_DOT_CLASS[status])} />
        <span className="text-sm font-semibold text-foreground">{PRESENCE_LABEL[status]}</span>
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs">
        <div>
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Last Active</p>
          <p className="text-foreground">{record ? new Date(record.lastActiveAt).toLocaleString() : "—"}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Sessions</p>
          <p className="text-foreground">{sessionCount}</p>
        </div>
      </div>

      <div>
        <p className="mb-1 text-[10px] uppercase tracking-wide text-muted-foreground">Current Session</p>
        {currentSession ? (
          <div className="card space-y-1 p-3 text-xs">
            <p className="text-foreground">Device: {currentSession.device ?? "Unknown"}</p>
            <p className="text-muted-foreground">Started {new Date(currentSession.startedAt).toLocaleString()}</p>
            <p className="text-muted-foreground">Active {new Date(currentSession.lastActiveAt).toLocaleString()}</p>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">No active session</p>
        )}
      </div>

      {record && record.sessions.length > 1 && (
        <div>
          <p className="mb-1 text-[10px] uppercase tracking-wide text-muted-foreground">All Sessions ({record.sessions.length})</p>
          <div className="space-y-1">
            {record.sessions.map(session => (
              <div key={session.sessionId} className="flex items-center justify-between text-[11px] text-muted-foreground">
                <span>{session.device ?? "Unknown"}</span>
                <span>{new Date(session.startedAt).toLocaleTimeString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
