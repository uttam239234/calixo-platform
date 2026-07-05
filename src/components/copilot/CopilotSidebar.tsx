"use client";

import { useEffect, useRef, useState, type ComponentType, type ReactNode } from "react";
import { Plus, Search, Pin, PinOff, Archive, ArchiveRestore, Trash2, RotateCcw, MoreHorizontal, MessageSquare, ChevronDown, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Session } from "@/core/copilot";

interface CopilotSidebarProps {
  active: Session[];
  pinned: Session[];
  archived: Session[];
  deleted: Session[];
  currentSessionId: string | null;
  onSelect: (id: string) => void;
  onCreate: () => void;
  onRename: (id: string, title: string) => void;
  onPin: (id: string) => void;
  onUnpin: (id: string) => void;
  onArchive: (id: string) => void;
  onUnarchive: (id: string) => void;
  onDelete: (id: string) => void;
  onRestore: (id: string) => void;
}

function relativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diffMs / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

export function CopilotSidebar({
  active,
  pinned,
  archived,
  deleted,
  currentSessionId,
  onSelect,
  onCreate,
  onRename,
  onPin,
  onUnpin,
  onArchive,
  onUnarchive,
  onDelete,
  onRestore,
}: CopilotSidebarProps) {
  const [query, setQuery] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!openMenuId) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpenMenuId(null);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [openMenuId]);

  const matches = (s: Session) => !query.trim() || s.title.toLowerCase().includes(query.trim().toLowerCase());

  const startRename = (s: Session) => {
    setRenamingId(s.id);
    setRenameValue(s.title);
    setOpenMenuId(null);
  };

  const commitRename = (id: string) => {
    const trimmed = renameValue.trim();
    if (trimmed) onRename(id, trimmed);
    setRenamingId(null);
  };

  function renderItem(s: Session, opts: { deleted?: boolean } = {}) {
    const isCurrent = s.id === currentSessionId;
    const isRenaming = renamingId === s.id;
    return (
      <div
        key={s.id}
        className={cn(
          "group relative flex items-center gap-2 rounded-2xl px-2.5 py-2 text-sm transition-colors",
          isCurrent ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-muted hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
          opts.deleted && "opacity-50"
        )}
      >
        <MessageSquare size={15} className="flex-shrink-0" />
        {isRenaming ? (
          <input
            autoFocus
            value={renameValue}
            onChange={e => setRenameValue(e.target.value)}
            onKeyDown={e => {
              if (e.key === "Enter") commitRename(s.id);
              if (e.key === "Escape") setRenamingId(null);
            }}
            onBlur={() => commitRename(s.id)}
            className="min-w-0 flex-1 rounded-lg border border-border bg-card px-1.5 py-0.5 text-sm text-foreground outline-none"
          />
        ) : (
          <button type="button" onClick={() => onSelect(s.id)} className="min-w-0 flex-1 text-left" title={s.title}>
            <span className={cn("block truncate", opts.deleted && "line-through")}>{s.title}</span>
            <span className="block text-[10px] text-sidebar-muted/80">{relativeTime(s.lastActivityAt)}</span>
          </button>
        )}
        <button
          type="button"
          onClick={() => setOpenMenuId(openMenuId === s.id ? null : s.id)}
          className="flex-shrink-0 rounded-lg p-1 text-sidebar-muted opacity-0 transition-all hover:bg-sidebar-accent hover:text-sidebar-foreground group-hover:opacity-100"
          aria-label="Conversation menu"
        >
          <MoreHorizontal size={14} />
        </button>
        {openMenuId === s.id && (
          <div ref={menuRef} className="absolute right-0 top-9 z-20 w-44 rounded-2xl border border-border bg-card p-1.5 shadow-dropdown">
            {opts.deleted ? (
              <MenuAction
                icon={RotateCcw}
                label="Restore"
                onClick={() => {
                  onRestore(s.id);
                  setOpenMenuId(null);
                }}
              />
            ) : (
              <>
                <MenuAction icon={Pencil} label="Rename" onClick={() => startRename(s)} />
                {s.pinned ? (
                  <MenuAction
                    icon={PinOff}
                    label="Unpin"
                    onClick={() => {
                      onUnpin(s.id);
                      setOpenMenuId(null);
                    }}
                  />
                ) : (
                  <MenuAction
                    icon={Pin}
                    label="Pin"
                    onClick={() => {
                      onPin(s.id);
                      setOpenMenuId(null);
                    }}
                  />
                )}
                {s.archived ? (
                  <MenuAction
                    icon={ArchiveRestore}
                    label="Unarchive"
                    onClick={() => {
                      onUnarchive(s.id);
                      setOpenMenuId(null);
                    }}
                  />
                ) : (
                  <MenuAction
                    icon={Archive}
                    label="Archive"
                    onClick={() => {
                      onArchive(s.id);
                      setOpenMenuId(null);
                    }}
                  />
                )}
                <MenuAction
                  icon={Trash2}
                  label="Delete"
                  tone="destructive"
                  onClick={() => {
                    onDelete(s.id);
                    setOpenMenuId(null);
                  }}
                />
              </>
            )}
          </div>
        )}
      </div>
    );
  }

  const filteredPinned = pinned.filter(matches);
  const filteredActive = active.filter(matches);
  const filteredArchived = archived.filter(matches);
  const filteredDeleted = deleted.filter(matches);

  return (
    <aside className="flex h-full w-[280px] flex-shrink-0 flex-col rounded-3xl border border-sidebar-border bg-sidebar">
      <div className="flex-shrink-0 space-y-2.5 p-3">
        <button type="button" onClick={onCreate} className="btn btn-primary btn-sm w-full gap-1.5">
          <Plus size={14} /> New Chat
        </button>
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-sidebar-muted" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search conversations..."
            className="h-8.5 w-full rounded-xl border border-sidebar-border bg-sidebar-accent/30 pl-8 pr-3 text-xs text-sidebar-foreground outline-none transition-colors placeholder:text-sidebar-muted focus:border-primary/40"
          />
        </div>
      </div>

      <div className="scrollbar-thin flex-1 space-y-4 overflow-y-auto px-2 pb-3">
        {filteredPinned.length > 0 && <SidebarSection title="Pinned">{filteredPinned.map(s => renderItem(s))}</SidebarSection>}
        <SidebarSection title="Active">
          {filteredActive.length === 0 ? <EmptyHint text={query ? "No matches" : "No conversations yet"} /> : filteredActive.map(s => renderItem(s))}
        </SidebarSection>
        {(filteredArchived.length > 0 || filteredDeleted.length > 0) && (
          <div>
            <button
              type="button"
              onClick={() => setShowArchived(v => !v)}
              className="mb-1.5 flex w-full items-center justify-between px-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-sidebar-muted"
            >
              <span>Archived ({filteredArchived.length + filteredDeleted.length})</span>
              <ChevronDown size={12} className={cn("transition-transform", showArchived && "rotate-180")} />
            </button>
            {showArchived && (
              <div className="space-y-0.5">
                {filteredArchived.map(s => renderItem(s))}
                {filteredDeleted.map(s => renderItem(s, { deleted: true }))}
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}

function SidebarSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <p className="mb-1.5 px-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-sidebar-muted">{title}</p>
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}

function EmptyHint({ text }: { text: string }) {
  return <p className="px-2 py-3 text-xs text-sidebar-muted">{text}</p>;
}

function MenuAction({
  icon: Icon,
  label,
  onClick,
  tone,
}: {
  icon: ComponentType<{ size?: number; className?: string }>;
  label: string;
  onClick: () => void;
  tone?: "destructive";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-2 rounded-xl px-2.5 py-1.5 text-xs font-medium transition-colors hover:bg-accent",
        tone === "destructive" ? "text-destructive hover:bg-destructive/10" : "text-foreground"
      )}
    >
      <Icon size={13} /> {label}
    </button>
  );
}
