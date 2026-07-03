"use client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { CheckCircle2, X } from "lucide-react";
import {
  initialCompetitors,
  brandMetrics,
  trendData,
  aiRecommendations,
} from "./mock-data";
import { matchesCompetitor } from "./competitor-utils";
import type {
  Competitor,
  CompetitorFiltersState,
  CompetitorInput,
  CompetitorContextValue,
} from "./types";

const STORAGE_KEY = "calixo-social-competitors-v1";
const RECS_KEY = "calixo-social-competitors-recs-v1";

const defaultFilters: CompetitorFiltersState = {
  platform: "",
  industry: "",
  followers: "",
  engagement: "",
  country: "",
};

const newId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `competitor-${Date.now()}`;

export function CompetitorProvider({ children }: { children: ReactNode }) {
  const [competitors, setCompetitors] = useState(initialCompetitors);
  const [compareIds, setCompareIds] = useState(
    initialCompetitors.slice(0, 3).map((item) => item.id)
  );
  const [recommendations, setRecommendations] = useState(aiRecommendations);
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState(defaultFilters);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [toast, setToast] = useState("");
  const [aiVersion, setAiVersion] = useState(1);

  // Hydrate from localStorage
  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (!active) return;
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored) as {
            competitors: Competitor[];
            compareIds: string[];
          };
          setCompetitors(parsed.competitors);
          setCompareIds(parsed.compareIds);
        }
        const recsStored = localStorage.getItem(RECS_KEY);
        if (recsStored) {
          const parsed = JSON.parse(recsStored);
          setRecommendations(parsed);
        }
      } catch {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(RECS_KEY);
      }
      setHydrated(true);
    });
    return () => {
      active = false;
    };
  }, []);

  // Persist to localStorage
  useEffect(() => {
    if (hydrated)
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ competitors, compareIds })
      );
  }, [competitors, compareIds, hydrated]);

  useEffect(() => {
    if (hydrated)
      localStorage.setItem(RECS_KEY, JSON.stringify(recommendations));
  }, [recommendations, hydrated]);

  // Toast timer
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 3200);
    return () => clearTimeout(timer);
  }, [toast]);

  const showToast = useCallback((message: string) => setToast(message), []);

  const visibleCompetitors = useMemo(
    () =>
      competitors
        .filter((item) => matchesCompetitor(item, query, filters))
        .sort(
          (a, b) =>
            Number(b.favorite) - Number(a.favorite) ||
            b.metrics.followers - a.metrics.followers
        ),
    [competitors, query, filters]
  );

  const compared = useMemo(
    () =>
      compareIds
        .map((id) => competitors.find((item) => item.id === id))
        .filter((item): item is Competitor => Boolean(item)),
    [compareIds, competitors]
  );

  const editingCompetitor =
    competitors.find((item) => item.id === editingId) ?? null;

  const openAdd = useCallback(() => {
    setEditingId(null);
    setDialogOpen(true);
  }, []);

  const openEdit = useCallback((id: string) => {
    setEditingId(id);
    setDialogOpen(true);
  }, []);

  const closeDialog = useCallback(() => setDialogOpen(false), []);

  const saveCompetitor = useCallback(
    (input: CompetitorInput, id?: string) => {
      if (id) {
        setCompetitors((current) =>
          current.map((item) =>
            item.id === id
              ? {
                  ...item,
                  ...input,
                  metrics: {
                    ...item.metrics,
                    followers: input.followers,
                    engagement: input.engagement,
                  },
                }
              : item
          )
        );
      } else {
        const template = initialCompetitors[0];
        const competitor: Competitor = {
          ...template,
          id: newId(),
          name: input.name,
          handle: input.handle,
          platform: input.platform,
          industry: input.industry,
          country: input.country,
          favorite: false,
          color: "#22d3ee",
          metrics: {
            ...template.metrics,
            followers: input.followers,
            engagement: input.engagement,
          },
          topContent: template.topContent.map((item) => ({
            ...item,
            id: newId(),
            platform: input.platform,
          })),
          timeline: template.timeline.map((item) => ({
            ...item,
            id: newId(),
          })),
        };
        setCompetitors((current) => [competitor, ...current]);
      }
      setDialogOpen(false);
      showToast(id ? "Competitor updated." : "Competitor added.");
    },
    [showToast]
  );

  const removeCompetitor = useCallback(
    (id: string) => {
      setCompetitors((current) => current.filter((item) => item.id !== id));
      setCompareIds((current) => current.filter((item) => item !== id));
      showToast("Competitor removed.");
    },
    [showToast]
  );

  const toggleFavorite = useCallback((id: string) =>
    setCompetitors((current) =>
      current.map((item) =>
        item.id === id ? { ...item, favorite: !item.favorite } : item
      )
    ), []);

  const toggleCompare = useCallback((id: string) =>
    setCompareIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : current.length >= 4
        ? current
        : [...current, id]
    ), []);

  const resetFilters = useCallback(() => setFilters(defaultFilters), []);

  const refreshAi = useCallback(() => {
    setAiVersion((value) => value + 1);
    setRecommendations(
      aiRecommendations.map((rec) => ({
        ...rec,
        confidence: Math.min(
          99,
          rec.confidence + Math.round((Math.random() - 0.3) * 8)
        ),
        title: rec.title,
        description:
          rec.description +
          ` [Updated based on latest competitor activity]`,
      }))
    );
    showToast("Competitor AI insights regenerated.");
  }, [showToast]);

  const exportData = useCallback(
    (format: "csv" | "excel" | "pdf") => {
      const rows = [
        [
          "Name",
          "Platform",
          "Industry",
          "Country",
          "Followers",
          "Growth",
          "Engagement",
          "Reach",
          "Posts",
        ],
        ...competitors.map((c) => [
          c.name,
          c.platform,
          c.industry,
          c.country,
          String(c.metrics.followers),
          `${c.metrics.growth}%`,
          `${c.metrics.engagement}%`,
          String(c.metrics.reach),
          String(c.metrics.posts),
        ]),
      ];

      if (format === "pdf") {
        const content = `CALIXO COMPETITOR INTELLIGENCE REPORT\nGenerated: ${new Date().toLocaleString()}\n\nTotal Competitors Tracked: ${competitors.length}\n\n${competitors
          .map(
            (c) =>
              `${c.name} (${c.platform}): ${c.metrics.followers.toLocaleString()} followers, ${c.metrics.engagement}% engagement`
          )
          .join("\n")}\n\n---\nAI Recommendations\n${recommendations
          .map((r) => `${r.priority}: ${r.title}`)
          .join("\n")}`;
        const blob = new Blob([content], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "calixo-competitor-intelligence.pdf";
        link.click();
        URL.revokeObjectURL(url);
      } else {
        const extension = format === "excel" ? "xls" : "csv";
        const csv = rows
          .map((row) =>
            row
              .map((value) => `"${String(value).replaceAll('"', '""')}"`)
              .join(",")
          )
          .join("\n");
        const blob = new Blob([csv], {
          type:
            format === "excel"
              ? "application/vnd.ms-excel"
              : "text/csv",
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `calixo-competitor-intelligence.${extension}`;
        link.click();
        URL.revokeObjectURL(url);
      }
      showToast(`${format.toUpperCase()} report exported.`);
    },
    [competitors, recommendations, showToast]
  );

  const applyRecommendation = useCallback(
    (id: string) => {
      setRecommendations((current) =>
        current.map((item) =>
          item.id === id ? { ...item, applied: true } : item
        )
      );
      showToast("Recommendation applied.");
    },
    [showToast]
  );

  const dismissRecommendation = useCallback(
    (id: string) => {
      setRecommendations((current) =>
        current.filter((item) => item.id !== id)
      );
      showToast("Recommendation dismissed.");
    },
    [showToast]
  );

  const value = useMemo<CompetitorContextValue>(
    () => ({
      competitors,
      visibleCompetitors,
      compared,
      compareIds,
      query,
      filters,
      dialogOpen,
      editingCompetitor,
      aiVersion,
      brandMetrics,
      trendData,
      recommendations,
      setQuery,
      setFilters,
      resetFilters,
      openAdd,
      openEdit,
      closeDialog,
      saveCompetitor,
      removeCompetitor,
      toggleFavorite,
      toggleCompare,
      refreshAi,
      showToast,
      exportData,
      applyRecommendation,
      dismissRecommendation,
    }),
    [
      competitors,
      visibleCompetitors,
      compared,
      compareIds,
      query,
      filters,
      dialogOpen,
      editingCompetitor,
      aiVersion,
      recommendations,
      resetFilters,
      openAdd,
      openEdit,
      closeDialog,
      saveCompetitor,
      removeCompetitor,
      toggleFavorite,
      toggleCompare,
      refreshAi,
      showToast,
      exportData,
      applyRecommendation,
      dismissRecommendation,
    ]
  );

  return (
    <CompetitorContext.Provider value={value}>
      {children}
      {toast && (
        <div
          role="status"
          className="fixed bottom-6 right-6 z-[80] flex items-center gap-3 rounded-2xl border border-emerald-500/30 bg-slate-900 px-4 py-3 text-sm text-white shadow-2xl"
        >
          <CheckCircle2 size={18} className="text-emerald-400" />
          <span>{toast}</span>
          <button
            onClick={() => setToast("")}
            className="text-slate-500 hover:text-white"
          >
            <X size={15} />
          </button>
        </div>
      )}
    </CompetitorContext.Provider>
  );
}

const CompetitorContext = createContext<CompetitorContextValue | null>(null);

export function useCompetitors() {
  const context = useContext(CompetitorContext);
  if (!context)
    throw new Error("useCompetitors must be used within CompetitorProvider");
  return context;
}