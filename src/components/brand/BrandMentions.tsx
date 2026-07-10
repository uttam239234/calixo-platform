"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/button";
import { EnterpriseFilterBar, type FilterGroup } from "@/components/enterprise/module";
import { useBrandMonitoring } from "@/features/brand/BrandMonitoringProvider";
import {
  Eye, MapPin, Clock, ExternalLink,
  ChevronLeft, ChevronRight, Flag, CheckCircle2,
  MessageSquare, MoreHorizontal, Download, Send, Users2,
} from "lucide-react";

const TIME_RANGES = [
  { id: "all", label: "All Time", value: "all" },
  { id: "7d", label: "Last 7 Days", value: "7d" },
  { id: "14d", label: "Last 14 Days", value: "14d" },
  { id: "30d", label: "Last 30 Days", value: "30d" },
];

export function BrandMentions() {
  const router = useRouter();
  const { mentions, resolveMention, unresolveMention, flagMention, unflagMention, escalateMention, exportMentions, canUpdate, canExport, canAssign } = useBrandMonitoring();
  const [searchQuery, setSearchQuery] = useState("");
  const [sentimentFilter, setSentimentFilter] = useState<string>("all");
  const [platformFilter, setPlatformFilter] = useState<string>("all");
  const [languageFilter, setLanguageFilter] = useState<string>("all");
  const [timeFilter, setTimeFilter] = useState<string>("all");
  const [authorQuery, setAuthorQuery] = useState("");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const perPage = 10;

  const platforms = useMemo(() => Array.from(new Set(mentions.map(m => m.platform))), [mentions]);
  const languages = useMemo(() => Array.from(new Set(mentions.map(m => m.language))), [mentions]);
  /** Anchored to the most recent tracked mention rather than wall-clock `Date.now()` — keeps this filter a pure function of `mentions` (component purity rule) and avoids every mention aging out of "Last 7 days" as real time passes without new mock data. */
  const latestMentionMs = useMemo(() => (mentions.length > 0 ? Math.max(...mentions.map(m => new Date(m.detectedAt).getTime())) : 0), [mentions]);

  const filteredMentions = mentions.filter((m) => {
    if (searchQuery && !m.content.toLowerCase().includes(searchQuery.toLowerCase()) && !m.author.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (sentimentFilter !== "all" && m.sentiment !== sentimentFilter) return false;
    if (platformFilter !== "all" && m.platform !== platformFilter) return false;
    if (languageFilter !== "all" && m.language !== languageFilter) return false;
    if (authorQuery && !m.author.toLowerCase().includes(authorQuery.toLowerCase())) return false;
    if (timeFilter !== "all") {
      const days = Number(timeFilter.replace("d", ""));
      const cutoff = latestMentionMs - days * 24 * 60 * 60 * 1000;
      if (new Date(m.detectedAt).getTime() < cutoff) return false;
    }
    return true;
  });

  const totalPages = Math.ceil(filteredMentions.length / perPage);
  const paginatedMentions = filteredMentions.slice((page - 1) * perPage, page * perPage);

  const filterGroups: FilterGroup[] = [
    {
      id: "sentiment",
      label: "Sentiment",
      options: [
        { id: "all", label: "All Sentiments", value: "all" },
        { id: "positive", label: "Positive", value: "positive" },
        { id: "neutral", label: "Neutral", value: "neutral" },
        { id: "negative", label: "Negative", value: "negative" },
      ],
      value: sentimentFilter,
      onChange: (value) => { setSentimentFilter(value); setPage(1); },
    },
    {
      id: "platform",
      label: "Platform",
      options: [
        { id: "all", label: "All Platforms", value: "all" },
        ...platforms.map(p => ({ id: p, label: p, value: p })),
      ],
      value: platformFilter,
      onChange: (value) => { setPlatformFilter(value); setPage(1); },
    },
    {
      id: "language",
      label: "Language",
      options: [
        { id: "all", label: "All Languages", value: "all" },
        ...languages.map(l => ({ id: l, label: l, value: l })),
      ],
      value: languageFilter,
      onChange: (value) => { setLanguageFilter(value); setPage(1); },
    },
    {
      id: "time",
      label: "Time Range",
      options: TIME_RANGES,
      value: timeFilter,
      onChange: (value) => { setTimeFilter(value); setPage(1); },
    },
  ];

  const handleExport = () => {
    exportMentions();
  };

  return (
    <div className="space-y-6 pb-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <Card>
          <CardHeader title="Live Mentions" description={`${filteredMentions.length} mentions found`} />
          <CardContent>
            {/* Filters using EnterpriseFilterBar */}
            <EnterpriseFilterBar
              searchValue={searchQuery}
              onSearchChange={(value) => { setSearchQuery(value); setPage(1); }}
              searchPlaceholder="Search mentions..."
              filterGroups={filterGroups}
              onClearAll={() => {
                setSearchQuery("");
                setSentimentFilter("all");
                setPlatformFilter("all");
                setLanguageFilter("all");
                setTimeFilter("all");
                setAuthorQuery("");
                setPage(1);
              }}
              className="mb-3"
            >
              {canExport && (
                <Button variant="outline" size="sm" onClick={handleExport} className="h-10 gap-2 border-border bg-surface/70 text-foreground hover:bg-surface">
                  <Download size={14} /> Export
                </Button>
              )}
            </EnterpriseFilterBar>
            <input
              value={authorQuery}
              onChange={event => { setAuthorQuery(event.target.value); setPage(1); }}
              placeholder="Filter by author…"
              className="mb-4 h-9 w-full max-w-xs rounded-xl border border-border bg-surface/60 px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary/50"
            />

            {/* Mentions List */}
            <div className="space-y-3">
              {paginatedMentions.map((m) => (
                <div key={m.id} className="flex items-start gap-4 p-4 rounded-xl bg-surface/30 border border-border hover:border-primary/30 transition-all">
                  <div className="flex-shrink-0 text-lg mt-0.5">{m.platformIcon}</div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-foreground truncate">{m.author}</span>
                      <span className="text-[11px] text-muted-foreground">{m.authorFollowers.toLocaleString()} followers</span>
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                        m.sentiment === 'positive' ? 'bg-success/10 text-success' :
                        m.sentiment === 'negative' ? 'bg-destructive/10 text-destructive' :
                        'bg-warning/10 text-warning'
                      }`}>{m.sentiment}</span>
                      {m.isFlagged && <Flag size={12} className="text-destructive" />}
                      {m.workflowEntryId && <span className="flex items-center gap-1 text-[10px] text-info"><Users2 size={11} />Escalated</span>}
                    </div>
                    <p className="text-sm text-foreground mt-1.5 leading-relaxed">{m.content}</p>
                    <div className="flex items-center gap-4 mt-2 flex-wrap">
                      {m.tags.map(tag => (
                        <span key={tag} className="text-[10px] text-primary bg-primary/10 px-1.5 py-0.5 rounded">{tag}</span>
                      ))}
                    </div>
                    <div className="flex items-center gap-4 mt-2.5 text-[11px] text-muted-foreground">
                      <span className="flex items-center gap-1"><Eye size={11} /> {m.reach.toLocaleString()} reach</span>
                      <span className="flex items-center gap-1"><MessageSquare size={11} /> {m.engagement.toLocaleString()} eng.</span>
                      <span className="flex items-center gap-1"><MapPin size={11} /> {m.country}</span>
                      <span className="flex items-center gap-1"><Clock size={11} /> {new Date(m.detectedAt).toLocaleString()}</span>
                      <a href={m.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary hover:text-primary/80">
                        <ExternalLink size={11} /> Open
                      </a>
                    </div>
                  </div>
                  <div className="relative flex-shrink-0 flex items-center gap-1">
                    {canUpdate && (!m.isResolved ? (
                      <button onClick={() => resolveMention(m.id)} className="p-1.5 rounded-lg hover:bg-surface text-muted-foreground hover:text-success transition-colors" title="Resolve">
                        <CheckCircle2 size={16} />
                      </button>
                    ) : (
                      <button onClick={() => unresolveMention(m.id)} className="p-1.5 text-success transition-colors" title="Resolved — click to reopen">
                        <CheckCircle2 size={16} />
                      </button>
                    ))}
                    <button onClick={() => setOpenMenuId(openMenuId === m.id ? null : m.id)} className="p-1.5 rounded-lg hover:bg-surface text-muted-foreground hover:text-foreground transition-colors">
                      <MoreHorizontal size={16} />
                    </button>
                    {openMenuId === m.id && (
                      <div className="absolute right-0 top-8 z-10 w-48 rounded-xl border border-border bg-card p-1.5 shadow-2xl">
                        <a href={m.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs text-foreground hover:bg-surface">
                          <ExternalLink size={13} /> Open source
                        </a>
                        {canUpdate && (
                          <button onClick={() => { if (m.isFlagged) unflagMention(m.id); else flagMention(m.id); setOpenMenuId(null); }} className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs text-foreground hover:bg-surface">
                            <Flag size={13} /> {m.isFlagged ? "Remove flag" : "Flag mention"}
                          </button>
                        )}
                        {canAssign && !m.workflowEntryId && (
                          <button onClick={() => { escalateMention(m.id); setOpenMenuId(null); }} className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs text-foreground hover:bg-surface">
                            <Users2 size={13} /> Escalate to team
                          </button>
                        )}
                        <button onClick={() => { router.push("/dashboard/social/compose"); setOpenMenuId(null); }} className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs text-foreground hover:bg-surface">
                          <Send size={13} /> Create response
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {paginatedMentions.length === 0 && <p className="py-10 text-center text-sm text-muted-foreground">No mentions match the current search and filters.</p>}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                <p className="text-xs text-muted-foreground">Showing {(page - 1) * perPage + 1}-{Math.min(page * perPage, filteredMentions.length)} of {filteredMentions.length}</p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-1.5 rounded-lg hover:bg-surface disabled:opacity-30 disabled:cursor-not-allowed text-muted-foreground"
                  ><ChevronLeft size={16} /></button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).slice(Math.max(0, page - 3), page + 2).map(p => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-8 h-8 rounded-lg text-xs font-medium transition-all ${
                        p === page ? 'bg-primary/20 text-primary border border-primary/30' : 'text-muted-foreground hover:bg-surface border border-transparent'
                      }`}
                    >{p}</button>
                  ))}
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="p-1.5 rounded-lg hover:bg-surface disabled:opacity-30 disabled:cursor-not-allowed text-muted-foreground"
                  ><ChevronRight size={16} /></button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
