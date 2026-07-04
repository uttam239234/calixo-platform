"use client";

import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import {
  GitBranch, Clock, Shield, CheckCircle, XCircle, AlertTriangle, Search, Filter, ChevronRight, MessageSquare,
  Users, Calendar, ArrowUpDown, Eye, ThumbsUp, ThumbsDown, RotateCcw, ChevronDown, ChevronUp,
  Send, MoreHorizontal, Download, Copy, BarChart3, TrendingUp, Activity, Plus, Tag, User, X,
} from "lucide-react";
import { WorkflowEngine } from "@/core/workflow/WorkflowEngine";
import type { WorkflowEntry, WorkflowStatus, WorkflowPriority, WorkflowComment } from "@/core/workflow/types";

const TABS = ["All","My Tasks","Pending","Approved","Rejected","Overdue","Activity"] as const;
type Tab = typeof TABS[number];

const STATUS_COLORS: Record<WorkflowStatus, string> = {
  draft: "bg-slate-500/10 text-slate-400",
  "ai-generated": "bg-purple-500/10 text-purple-400",
  "in-review": "bg-cyan-500/10 text-cyan-400",
  "changes-requested": "bg-amber-500/10 text-amber-400",
  approved: "bg-emerald-500/10 text-emerald-400",
  scheduled: "bg-blue-500/10 text-blue-400",
  published: "bg-emerald-500/20 text-emerald-300",
  archived: "bg-slate-500/10 text-slate-500",
};

const PRIORITY_COLORS: Record<WorkflowPriority, string> = {
  low: "text-slate-500", medium: "text-cyan-400", high: "text-amber-400", critical: "text-red-400",
};

const selectCls = "h-8 rounded-lg border border-slate-700/60 bg-slate-900/70 px-2 text-[11px] text-slate-300 outline-none";

export default function WorkflowsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("All");
  const [search, setSearch] = useState("");
  const [selectedWfId, setSelectedWfId] = useState<string | null>(null);
  const [showActions, setShowActions] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [showReject, setShowReject] = useState(false);
  const [copied, setCopied] = useState(false);

  const kpis = useMemo(() => WorkflowEngine.getKPIs(), []);
  const allWorkflows = useMemo(() => WorkflowEngine.getAll(), []);
  const selectedWf = useMemo(() => selectedWfId ? WorkflowEngine.get(selectedWfId) : undefined, [selectedWfId]);
  const activity = useMemo(() => WorkflowEngine.getActivity(), []);

  const filtered = useMemo(() => {
    let wfs = allWorkflows;
    if (search) wfs = wfs.filter(w => w.title.toLowerCase().includes(search.toLowerCase()));
    switch (activeTab) {
      case "My Tasks": wfs = wfs.filter(w => w.status === "in-review" || w.status === "changes-requested"); break;
      case "Pending": wfs = WorkflowEngine.getByStatus("in-review"); break;
      case "Approved": wfs = WorkflowEngine.getByStatus("approved"); break;
      case "Rejected": wfs = wfs.filter(w => w.actions.some(a => a.type === "rejected")); break;
      case "Overdue": wfs = WorkflowEngine.getOverdue(); break;
      case "Activity": return [];
    }
    return wfs.slice(0, 30);
  }, [allWorkflows, search, activeTab]);

  const handleApprove = useCallback((id: string) => {
    WorkflowEngine.approve(id, "Current User");
    setSelectedWfId(null); setCopied(false);
  }, []);
  const handleReject = useCallback((id: string) => {
    WorkflowEngine.reject(id, "Current User", rejectReason || "Changes requested");
    setShowReject(false); setRejectReason(""); setSelectedWfId(null);
  }, [rejectReason]);
  const handleAddComment = useCallback((id: string) => {
    if (!commentText.trim()) return;
    WorkflowEngine.addComment(id, "Current User", commentText);
    setCommentText("");
  }, [commentText]);

  const handleSelect = useCallback((id: string) => { setSelectedWfId(id); setShowActions(false); setShowReject(false); }, []);

  return (
    <div className="h-[calc(100vh-5rem)] flex flex-col pb-4">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex-shrink-0 flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/30 to-blue-500/30 border border-cyan-500/30"><GitBranch size={18} className="text-cyan-300" /></div>
          <div><h1 className="text-lg font-bold text-white">Workflow & Approvals</h1><p className="text-[11px] text-slate-400">{kpis.pending} pending • {kpis.overdue} overdue</p></div>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative"><Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search workflows..." className={cn(selectCls, "pl-8 w-44")} /></div>
        </div>
      </motion.div>

      {/* KPI row */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-2 lg:grid-cols-6 gap-3 mb-4">
        {[
          { label: "Pending", value: kpis.pending, icon: Clock, color: "text-cyan-400" },
          { label: "Approved", value: kpis.approved, icon: CheckCircle, color: "text-emerald-400" },
          { label: "Rejected", value: kpis.rejected, icon: XCircle, color: "text-red-400" },
          { label: "Overdue", value: kpis.overdue, icon: AlertTriangle, color: "text-amber-400" },
          { label: "Total", value: kpis.total, icon: BarChart3, color: "text-slate-400" },
          { label: "Avg Time", value: `${kpis.avgApprovalDays}d`, icon: TrendingUp, color: "text-blue-400" },
        ].map(kpi => <Card key={kpi.label} padding="sm" gradient><div className="flex items-center justify-between"><kpi.icon size={16} className={kpi.color} /><span className="text-[10px] text-slate-500">{kpi.label}</span></div><p className="text-2xl font-bold text-white mt-1">{kpi.value}</p></Card>)}
      </motion.div>

      {/* Tab bar */}
      <div className="flex gap-1 overflow-x-auto pb-2 border-b border-slate-800/60 mb-3">
        {TABS.map(tab => <button key={tab} onClick={() => { setActiveTab(tab); setSelectedWfId(null); }} className={cn("shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors", activeTab === tab ? "bg-cyan-500/20 text-cyan-300" : "text-slate-400 hover:bg-slate-800/50")}>{tab}</button>)}
      </div>

      {/* Main content */}
      <div className="flex-1 flex gap-4 min-h-0">
        {/* Workflow list */}
        <div className="flex-1 overflow-y-auto scrollbar-thin space-y-1.5">
          {activeTab === "Activity" ? (
            <div className="space-y-1">
              {activity.map((a, i) => <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-slate-800/20 text-xs">
                <GitBranch size={12} className="text-slate-500 flex-shrink-0" />
                <span className="text-slate-400 capitalize">{a.type.replace("-", " ")}</span>
                <span className="text-slate-500">by {a.performedBy}</span>
                <span className="text-slate-300 truncate flex-1">{a.workflowTitle}</span>
                <span className="text-[10px] text-slate-600">{new Date(a.timestamp).toLocaleString()}</span>
              </div>)}
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-8">No workflows found.</p>
          ) : (
            filtered.map(w => (
              <div key={w.id} onClick={() => handleSelect(w.id)} className={cn("p-3 rounded-xl cursor-pointer transition-all border", selectedWfId === w.id ? "bg-cyan-500/5 border-cyan-500/20" : "bg-slate-900/40 border-slate-700/40 hover:border-slate-600/60")}>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-white truncate">{w.title}</p>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize", PRIORITY_COLORS[w.priority])}>{w.priority}</span>
                    <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize", STATUS_COLORS[w.status])}>{w.status.replace("-", " ")}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4 mt-1.5 text-[10px] text-slate-500">
                  <span>{w.reviewer ? `Reviewer: ${w.reviewer}` : "Unassigned"}</span>
                  <span>{w.brand}</span>
                  <span>{w.campaign}</span>
                  {w.dueDate && <span>Due: {new Date(w.dueDate).toLocaleDateString()}</span>}
                  <span>{w.comments.length} 💬</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Detail panel */}
        <AnimatePresence>
          {selectedWf && (
            <motion.div initial={{ width: 0, opacity: 0 }} animate={{ width: 340, opacity: 1 }} exit={{ width: 0, opacity: 0 }} className="flex-shrink-0 overflow-y-auto scrollbar-thin space-y-3 pl-1" style={{ minWidth: 0, maxWidth: 340 }}>
              <div className="flex items-center justify-between"><h3 className="text-sm font-semibold text-white truncate">{selectedWf.title}</h3><button onClick={() => setSelectedWfId(null)} className="p-1 rounded hover:bg-slate-700 text-slate-500"><X size={14} /></button></div>

              {/* Status + Priority */}
              <div className="flex gap-2">
                <span className={cn("text-[11px] font-semibold px-2 py-1 rounded-full capitalize", STATUS_COLORS[selectedWf.status])}>{selectedWf.status.replace("-", " ")}</span>
                <span className={cn("text-[11px] font-semibold px-2 py-1 rounded-full capitalize", PRIORITY_COLORS[selectedWf.priority])}>{selectedWf.priority}</span>
              </div>

              {/* Meta */}
              <Card><CardHeader title="Details" /><CardContent className="text-[10px] space-y-1 text-slate-400">
                {[{l:"Brand",v:selectedWf.brand},{l:"Campaign",v:selectedWf.campaign},{l:"Submitted By",v:selectedWf.submittedBy},{l:"Reviewer",v:selectedWf.reviewer},{l:"Approver",v:selectedWf.approver},{l:"Due Date",v:selectedWf.dueDate ? new Date(selectedWf.dueDate).toLocaleDateString() : "—"}].map(m=><div key={m.l} className="flex justify-between"><span className="text-slate-600">{m.l}</span><span>{m.v ?? "—"}</span></div>)}
              </CardContent></Card>

              {/* Actions */}
              {selectedWf.status === "in-review" && (
                <Card>
                  <CardHeader title="Actions" />
                  <CardContent>
                    <div className="flex gap-2">
                      <Button size="xs" onClick={() => handleApprove(selectedWf.id)} className="gap-1 text-[10px] bg-emerald-500 hover:bg-emerald-600"><ThumbsUp size={12} /> Approve</Button>
                      <Button size="xs" variant="outline" onClick={() => setShowReject(v => !v)} className="gap-1 text-[10px] border-red-500/30 text-red-400"><ThumbsDown size={12} /> Reject</Button>
                    </div>
                    {showReject && (
                      <div className="mt-2 space-y-1">
                        <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)} placeholder="Reason for rejection..." className="w-full rounded-lg border border-slate-700/60 bg-slate-900/70 p-2 text-xs text-slate-200 outline-none resize-none h-16" />
                        <Button size="xs" variant="outline" onClick={() => handleReject(selectedWf.id)} className="border-red-500/30 text-red-400 text-[10px]">Submit Rejection</Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Comments */}
              <Card>
                <CardHeader title="Comments" description={`${selectedWf.comments.length} total`} />
                <CardContent>
                  <div className="space-y-2 mb-3">
                    {selectedWf.comments.slice(0, 10).map(c => (
                      <div key={c.id} className="p-2 rounded-lg bg-slate-800/30 text-[10px]">
                        <div className="flex items-center justify-between"><span className="font-semibold text-slate-300">{c.author}</span><span className="text-slate-600">{new Date(c.timestamp).toLocaleDateString()}</span></div>
                        <p className="text-slate-400 mt-0.5">{c.text}</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-1">
                    <input value={commentText} onChange={e => setCommentText(e.target.value)} placeholder="Add a comment..." className="flex-1 h-8 rounded-lg border border-slate-700/60 bg-slate-900/70 px-2 text-[11px] text-slate-200 outline-none" />
                    <Button size="xs" onClick={() => handleAddComment(selectedWf.id)} className="gap-1 text-[10px]"><Send size={11} /> Send</Button>
                  </div>
                </CardContent>
              </Card>

              {/* Activity Timeline */}
              {selectedWf.actions.length > 0 && (
                <Card>
                  <CardHeader title="Activity Timeline" description={`${selectedWf.actions.length} events`} />
                  <CardContent>
                    <div className="space-y-2">
                      {selectedWf.actions.slice().reverse().slice(0, 10).map(a => (
                        <div key={a.id} className="flex items-start gap-2 text-[10px]">
                          <div className="flex-shrink-0 mt-0.5">
                            {a.type === "approved" ? <CheckCircle size={10} className="text-emerald-400" /> : a.type === "rejected" || a.type === "changes-requested" ? <XCircle size={10} className="text-red-400" /> : a.type === "comment" ? <MessageSquare size={10} className="text-blue-400" /> : <Clock size={10} className="text-slate-500" />}
                          </div>
                          <div>
                            <span className="text-slate-400 capitalize">{a.type.replace("-", " ")}</span>
                            <span className="text-slate-600"> by {a.performedBy}</span>
                            <span className="text-slate-600 ml-2">{new Date(a.timestamp).toLocaleString()}</span>
                            {a.details && <p className="text-slate-500">{a.details}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}