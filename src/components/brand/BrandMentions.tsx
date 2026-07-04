"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/button";
import { EnterpriseFilterBar, type FilterGroup } from "@/components/enterprise/module";
import { brandMentions } from "@/lib/brand-data";
import {
  Eye, MapPin, Clock, ExternalLink,
  ChevronLeft, ChevronRight, Flag, CheckCircle2,
  MessageSquare, MoreHorizontal, Download,
} from "lucide-react";

export function BrandMentions() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sentimentFilter, setSentimentFilter] = useState<string>("all");
  const [platformFilter, setPlatformFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const perPage = 10;

  const filteredMentions = brandMentions.filter((m) => {
    if (searchQuery && !m.content.toLowerCase().includes(searchQuery.toLowerCase()) && !m.author.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (sentimentFilter !== "all" && m.sentiment !== sentimentFilter) return false;
    if (platformFilter !== "all" && m.platform !== platformFilter) return false;
    return true;
  });

  const totalPages = Math.ceil(filteredMentions.length / perPage);
  const paginatedMentions = filteredMentions.slice((page - 1) * perPage, page * perPage);

  const platforms = Array.from(new Set(brandMentions.map(m => m.platform)));

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
  ];

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
                setPage(1);
              }}
              className="mb-4"
            >
              <Button variant="outline" size="sm" className="h-10 gap-2 border-slate-700 bg-slate-900/70 text-slate-300 hover:bg-slate-800">
                <Download size={14} /> Export
              </Button>
            </EnterpriseFilterBar>

            {/* Mentions List */}
            <div className="space-y-3">
              {paginatedMentions.map((m) => (
                <div key={m.id} className="flex items-start gap-4 p-4 rounded-xl bg-slate-800/30 border border-slate-700/40 hover:border-slate-600/60 transition-all">
                  <div className="flex-shrink-0 text-lg mt-0.5">{m.platformIcon}</div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-white truncate">{m.author}</span>
                      <span className="text-[11px] text-slate-500">{m.authorFollowers.toLocaleString()} followers</span>
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                        m.sentiment === 'positive' ? 'bg-emerald-500/10 text-emerald-400' :
                        m.sentiment === 'negative' ? 'bg-red-500/10 text-red-400' :
                        'bg-amber-500/10 text-amber-400'
                      }`}>{m.sentiment}</span>
                      {m.isFlagged && <Flag size={12} className="text-red-400" />}
                    </div>
                    <p className="text-sm text-slate-300 mt-1.5 leading-relaxed">{m.content}</p>
                    <div className="flex items-center gap-4 mt-2 flex-wrap">
                      {m.tags.map(tag => (
                        <span key={tag} className="text-[10px] text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded">{tag}</span>
                      ))}
                    </div>
                    <div className="flex items-center gap-4 mt-2.5 text-[11px] text-slate-500">
                      <span className="flex items-center gap-1"><Eye size={11} /> {m.reach.toLocaleString()} reach</span>
                      <span className="flex items-center gap-1"><MessageSquare size={11} /> {m.engagement.toLocaleString()} eng.</span>
                      <span className="flex items-center gap-1"><MapPin size={11} /> {m.country}</span>
                      <span className="flex items-center gap-1"><Clock size={11} /> {new Date(m.detectedAt).toLocaleString()}</span>
                      <a href={m.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300">
                        <ExternalLink size={11} /> Open
                      </a>
                    </div>
                  </div>
                  <div className="flex-shrink-0 flex items-center gap-1">
                    {!m.isResolved ? (
                      <button className="p-1.5 rounded-lg hover:bg-slate-700/50 text-slate-500 hover:text-emerald-400 transition-colors" title="Resolve">
                        <CheckCircle2 size={16} />
                      </button>
                    ) : (
                      <span className="p-1.5 text-emerald-500" title="Resolved"><CheckCircle2 size={16} /></span>
                    )}
                    <button className="p-1.5 rounded-lg hover:bg-slate-700/50 text-slate-500 hover:text-white transition-colors">
                      <MoreHorizontal size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-800/50">
                <p className="text-xs text-slate-500">Showing {(page - 1) * perPage + 1}-{Math.min(page * perPage, filteredMentions.length)} of {filteredMentions.length}</p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-1.5 rounded-lg hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed text-slate-400"
                  ><ChevronLeft size={16} /></button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).slice(Math.max(0, page - 3), page + 2).map(p => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-8 h-8 rounded-lg text-xs font-medium transition-all ${
                        p === page ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-400 hover:bg-slate-800 border border-transparent'
                      }`}
                    >{p}</button>
                  ))}
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="p-1.5 rounded-lg hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed text-slate-400"
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