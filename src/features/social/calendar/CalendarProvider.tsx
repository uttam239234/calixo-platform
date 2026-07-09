"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { CheckCircle2, Lock, X } from "lucide-react";
import { useSocialTenant } from "@/hooks/useSocialTenant";
import { EmptyState } from "@/components/ui/EmptyState";
import { trackSocialAction } from "@/core/social";
import { workflowPlatformAPI } from "@/core/workflow";
import type { WorkflowEntry } from "@/core/workflow";
import { initialCalendarEvents } from "./mock-data";
import { addDays, matchesCalendarEvent, validateCalendarEvent } from "./calendar-utils";
import type { CalendarEventInput, CalendarFilterState, CalendarPostEvent, CalendarView } from "./types";

const STORAGE_KEY = "calixo-social-calendar-v1";
const defaultFilters: CalendarFilterState = { platform: "", status: "", campaign: "", tag: "", author: "", date: "" };
const newId = () => (typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `event-${Date.now()}`);

interface CalendarContextValue {
  events: CalendarPostEvent[];
  visibleEvents: CalendarPostEvent[];
  hydrated: boolean;
  view: CalendarView;
  cursorDate: Date;
  query: string;
  filters: CalendarFilterState;
  drawerOpen: boolean;
  selectedEvent: CalendarPostEvent | null;
  drawerStart: string;
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  canPublish: boolean;
  setView: (view: CalendarView) => void;
  setQuery: (value: string) => void;
  setFilters: (filters: CalendarFilterState) => void;
  navigate: (direction: -1 | 0 | 1) => void;
  openCreate: (start?: string) => void;
  openEdit: (id: string) => void;
  closeDrawer: () => void;
  saveEvent: (input: CalendarEventInput, id?: string) => { ok: boolean; errors: string[] };
  deleteEvent: (id: string) => void;
  duplicateEvent: (id: string, start?: string) => void;
  moveEvent: (id: string, start: string, duplicate: boolean) => void;
  publishNow: (id: string) => void;
  bulkAction: (ids: string[], action: "Publish" | "Cancel" | "Delete") => void;
  canApprove: boolean;
  getWorkflowEntry: (id: string) => WorkflowEntry | undefined;
  requestReview: (id: string) => void;
  approveEvent: (id: string) => void;
  rejectEvent: (id: string, reason: string) => void;
  showToast: (message: string) => void;
}

const CalendarContext = createContext<CalendarContextValue | null>(null);

export function CalendarProvider({ children }: { children: ReactNode }) {
  const [events, setEvents] = useState(initialCalendarEvents);
  const [hydrated, setHydrated] = useState(false);
  const [view, setView] = useState<CalendarView>("month");
  const [cursorDate, setCursorDate] = useState(new Date());
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState(defaultFilters);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [drawerStart, setDrawerStart] = useState("");
  const [toast, setToast] = useState("");
  const [workflowVersion, setWorkflowVersion] = useState(0);
  const { canRead, canCreate, canUpdate, canDelete, canPublish, canApprove, currentUserName } = useSocialTenant();

  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (!active) return;
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) setEvents(JSON.parse(stored) as CalendarPostEvent[]);
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
      setHydrated(true);
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  }, [events, hydrated]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 3200);
    return () => clearTimeout(timer);
  }, [toast]);

  const showToast = useCallback((message: string) => setToast(message), []);
  const selectedEvent = events.find(event => event.id === selectedId) ?? null;
  const visibleEvents = useMemo(() => events.filter(event => matchesCalendarEvent(event, query, filters)), [events, query, filters]);

  const navigate = useCallback(
    (direction: -1 | 0 | 1) =>
      setCursorDate(current => (direction === 0 ? new Date() : view === "day" ? addDays(current, direction) : view === "week" ? addDays(current, direction * 7) : new Date(current.getFullYear(), current.getMonth() + direction, 1))),
    [view]
  );
  const openCreate = useCallback((start?: string) => {
    setSelectedId(null);
    setDrawerStart(start ?? new Date(Date.now() + 3600000).toISOString());
    setDrawerOpen(true);
  }, []);
  const openEdit = useCallback((id: string) => {
    setSelectedId(id);
    setDrawerOpen(true);
  }, []);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  const saveEvent = useCallback(
    (input: CalendarEventInput, eventId?: string) => {
      if (eventId ? !canUpdate : !canCreate) return { ok: false, errors: ["You don't have permission to do that."] };
      const errors = validateCalendarEvent(input, events, eventId);
      if (errors.length) return { ok: false, errors };
      if (eventId) setEvents(current => current.map(event => (event.id === eventId ? { ...input, id: eventId } : event)));
      else setEvents(current => [...current, { ...input, id: newId() }]);
      showToast(eventId ? "Calendar post updated." : "Calendar post scheduled.");
      setDrawerOpen(false);
      return { ok: true, errors: [] };
    },
    [events, showToast, canCreate, canUpdate]
  );

  const deleteEvent = useCallback(
    (id: string) => {
      if (!canDelete) return;
      setEvents(current => current.filter(event => event.id !== id));
      setDrawerOpen(false);
      showToast("Calendar post deleted.");
    },
    [showToast, canDelete]
  );

  const duplicateEvent = useCallback(
    (id: string, start?: string) => {
      if (!canCreate) return;
      const source = events.find(event => event.id === id);
      if (!source) return;
      const nextStart = start ?? addDays(new Date(source.start), 1).toISOString();
      const copy = { ...source, title: `${source.title} Copy`, start: nextStart, status: "Draft" as const };
      const errors = validateCalendarEvent(copy, events);
      if (errors.length) {
        showToast(errors[0]);
        return;
      }
      setEvents(current => [...current, { ...copy, id: newId() }]);
      showToast("Calendar post duplicated.");
    },
    [events, showToast, canCreate]
  );

  const moveEvent = useCallback(
    (id: string, start: string, duplicate: boolean) => {
      if (duplicate ? !canCreate : !canUpdate) return;
      const source = events.find(event => event.id === id);
      if (!source) return;
      const input = { ...source, start };
      const errors = validateCalendarEvent(input, events, duplicate ? undefined : id);
      if (errors.length) {
        showToast(errors[0]);
        return;
      }
      if (duplicate) {
        setEvents(current => [...current, { ...source, id: newId(), title: `${source.title} Copy`, start }]);
        showToast("Post duplicated to new time.");
      } else {
        setEvents(current => current.map(event => (event.id === id ? { ...event, start } : event)));
        showToast("Post rescheduled.");
      }
    },
    [events, showToast, canCreate, canUpdate]
  );

  const publishNow = useCallback(
    (id: string) => {
      if (!canPublish) return;
      setEvents(current => current.map(event => (event.id === id ? { ...event, status: "Published", start: new Date().toISOString() } : event)));
      setDrawerOpen(false);
      trackSocialAction("publish");
      showToast("Post published.");
    },
    [showToast, canPublish]
  );

  /** Bulk publish/cancel/delete — the one genuine gap the audit found (zero bulk-action code existed anywhere in Social Media). "Cancel" also gives the `"Cancelled"` status (already in `CalendarEventStatus`) a real UI path beyond the drawer's manual dropdown. */
  const bulkAction = useCallback(
    (ids: string[], action: "Publish" | "Cancel" | "Delete") => {
      if (action === "Delete") {
        if (!canDelete) return;
        setEvents(current => current.filter(event => !ids.includes(event.id)));
        trackSocialAction("bulkDelete");
        showToast(`Deleted ${ids.length} post${ids.length === 1 ? "" : "s"}.`);
        return;
      }
      if (!canPublish && action === "Publish") return;
      if (!canUpdate && action === "Cancel") return;
      const now = new Date().toISOString();
      setEvents(current => current.map(event => (ids.includes(event.id) ? { ...event, status: action === "Publish" ? "Published" : "Cancelled", start: action === "Publish" ? now : event.start } : event)));
      trackSocialAction(`bulk${action}`);
      showToast(`${action === "Publish" ? "Published" : "Cancelled"} ${ids.length} post${ids.length === 1 ? "" : "s"}.`);
    },
    [showToast, canDelete, canPublish, canUpdate]
  );

  /**
   * Additive approval layer on top of the existing publishing-status field — a real
   * `WorkflowEntry` (via `workflowPlatformAPI`, `core/workflow`'s real approval engine) tracks
   * "in-review"/"changes-requested"/"approved" independently of `CalendarEventStatus`'s
   * "Draft"/"Scheduled"/"Publishing"/... publishing lifecycle. Calendar owns no workflow engine
   * itself — every transition delegates to the real one.
   */
  const getWorkflowEntry = useCallback(
    (id: string): WorkflowEntry | undefined => {
      const event = events.find(item => item.id === id);
      return event?.workflowEntryId ? workflowPlatformAPI.get(event.workflowEntryId) : undefined;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps -- workflowVersion is a manual re-trigger: approve/reject mutate the WorkflowEngine's own store, which `events` doesn't reflect
    [events, workflowVersion]
  );

  const requestReview = useCallback(
    (id: string) => {
      if (!canUpdate) return;
      const event = events.find(item => item.id === id);
      if (!event) return;
      const entry = workflowPlatformAPI.createWorkflow({
        title: event.title,
        description: event.content,
        assetId: event.id,
        assetName: event.title,
        priority: "medium",
        submittedBy: currentUserName,
        campaign: event.campaign || undefined,
      });
      setEvents(current => current.map(item => (item.id === id ? { ...item, workflowEntryId: entry.id } : item)));
      setWorkflowVersion(v => v + 1);
      showToast("Submitted for review.");
    },
    [events, showToast, canUpdate, currentUserName]
  );

  const approveEvent = useCallback(
    (id: string) => {
      if (!canApprove) return;
      const event = events.find(item => item.id === id);
      if (!event?.workflowEntryId) return;
      workflowPlatformAPI.approve(event.workflowEntryId, currentUserName);
      setWorkflowVersion(v => v + 1);
      trackSocialAction("approve");
      showToast("Post approved.");
    },
    [events, showToast, canApprove, currentUserName]
  );

  const rejectEvent = useCallback(
    (id: string, reason: string) => {
      if (!canApprove) return;
      const event = events.find(item => item.id === id);
      if (!event?.workflowEntryId) return;
      workflowPlatformAPI.reject(event.workflowEntryId, currentUserName, reason);
      setWorkflowVersion(v => v + 1);
      showToast("Changes requested.");
    },
    [events, showToast, canApprove, currentUserName]
  );

  const value = useMemo(
    () => ({
      events,
      visibleEvents,
      hydrated,
      view,
      cursorDate,
      query,
      filters,
      drawerOpen,
      selectedEvent,
      drawerStart,
      canCreate,
      canUpdate,
      canDelete,
      canPublish,
      setView,
      setQuery,
      setFilters,
      navigate,
      openCreate,
      openEdit,
      closeDrawer,
      saveEvent,
      deleteEvent,
      duplicateEvent,
      moveEvent,
      publishNow,
      bulkAction,
      canApprove,
      getWorkflowEntry,
      requestReview,
      approveEvent,
      rejectEvent,
      showToast,
    }),
    [events, visibleEvents, hydrated, view, cursorDate, query, filters, drawerOpen, selectedEvent, drawerStart, canCreate, canUpdate, canDelete, canPublish, canApprove, navigate, openCreate, openEdit, closeDrawer, saveEvent, deleteEvent, duplicateEvent, moveEvent, publishNow, bulkAction, getWorkflowEntry, requestReview, approveEvent, rejectEvent, showToast]
  );

  if (hydrated && !canRead) {
    return (
      <div className="flex items-center justify-center py-24">
        <EmptyState icon={<Lock size={32} />} title="You don't have access to the Content Calendar" description="Ask a workspace admin to grant the social:read permission." />
      </div>
    );
  }

  return (
    <CalendarContext.Provider value={value}>
      {children}
      {toast && (
        <div role="status" className="fixed bottom-6 right-6 z-[70] flex items-center gap-3 rounded-2xl border border-success/30 bg-card px-4 py-3 text-sm text-foreground shadow-2xl">
          <CheckCircle2 size={18} className="text-success" />
          <span>{toast}</span>
          <button onClick={() => setToast("")} className="text-muted-foreground hover:text-foreground">
            <X size={15} />
          </button>
        </div>
      )}
    </CalendarContext.Provider>
  );
}

export function useCalendar() {
  const context = useContext(CalendarContext);
  if (!context) throw new Error("useCalendar must be used within CalendarProvider");
  return context;
}
