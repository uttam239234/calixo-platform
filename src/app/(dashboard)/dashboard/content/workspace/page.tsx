"use client";

import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import {
  FileEdit, Save, Copy, Download, Library, Eye, Clock, ChevronLeft, ChevronRight, ChevronDown,
  Shield, TrendingUp, MousePointerClick, CheckCircle, AlertTriangle, X, Search, Layers,
  Plus, Trash2, ChevronUp, ArrowUp, ArrowDown, MessageSquare, RefreshCw, History,
  Bold, Italic, Underline, Link, Palette, AlignLeft, AlignCenter, AlignRight,
  Type, Hash, BarChart3, Sparkles, Wand2, FileText, Users, Calendar, GripVertical, CheckSquare2,
} from "lucide-react";
import { MOCK_DOCUMENTS, MOCK_COLLABORATORS, type ContentBlock, type ContentDocument, type DocumentComment, type DocumentVersion } from "@/lib/workspace-data";

// ============================================================================
// Constants
// ============================================================================

const AI_ACTIONS = [
  { id: "rewrite", label: "Rewrite", icon: RefreshCw },
  { id: "expand", label: "Expand", icon: ArrowDown },
  { id: "shorten", label: "Shorten", icon: ArrowUp },
  { id: "simplify", label: "Simplify", icon: Wand2 },
  { id: "professional", label: "Professional", icon: Briefcase },
  { id: "friendly", label: "Friendly", icon: Users },
  { id: "academic", label: "Academic", icon: FileText },
  { id: "technical", label: "Technical", icon: Hash },
  { id: "persuasive", label: "Persuasive", icon: TrendingUp },
  { id: "grammar-fix", label: "Grammar Fix", icon: CheckCircle },
  { id: "translate", label: "Translate", icon: Globe },
  { id: "continue", label: "Continue Writing", icon: FileEdit },
  { id: "generate-cta", label: "Generate CTA", icon: MousePointerClick },
  { id: "generate-faq", label: "Generate FAQ", icon: HelpCircle },
  { id: "generate-summary", label: "Generate Summary", icon: FileText },
  { id: "generate-meta", label: "Generate Meta", icon: Search },
] as const;

const LIVE_METRICS = [
  { id: "seo", label: "SEO Score", icon: Search, defaultScore: 78 },
  { id: "readability", label: "Readability", icon: Type, defaultScore: 82 },
  { id: "grammar", label: "Grammar", icon: CheckCircle, defaultScore: 95 },
  { id: "brand", label: "Brand Compliance", icon: Shield, defaultScore: 88 },
  { id: "cta", label: "CTA Strength", icon: MousePointerClick, defaultScore: 72 },
  { id: "keyword", label: "Keyword Density", icon: Hash, defaultScore: 65 },
  { id: "sentiment", label: "Sentiment", icon: TrendingUp, defaultScore: 75 },
  { id: "engagement", label: "Engagement", icon: BarChart3, defaultScore: 68 },
] as const;

const BLOCK_TYPES: { value: ContentBlock["type"]; label: string; icon: React.ComponentType<{size?:number;className?:string}> }[] = [
  { value: "heading", label: "Heading", icon: Type },
  { value: "sub-heading", label: "Sub-heading", icon: Type },
  { value: "paragraph", label: "Paragraph", icon: FileText },
  { value: "quote", label: "Quote", icon: MessageSquare },
  { value: "callout", label: "Callout", icon: Sparkles },
  { value: "checklist", label: "Checklist", icon: CheckSquare2 },
  { value: "bullet-list", label: "Bullet List", icon: Layers },
  { value: "numbered-list", label: "Numbered List", icon: Hash },
  { value: "code", label: "Code", icon: FileEdit },
  { value: "cta", label: "CTA", icon: MousePointerClick },
  { value: "divider", label: "Divider", icon: ChevronRight },
  { value: "faq", label: "FAQ", icon: HelpCircle },
  { value: "image-placeholder", label: "Image", icon: ImageIcon },
  { value: "table", label: "Table", icon: Grid },
] as const;

import { Briefcase, Globe, HelpCircle, Grid, Image as ImageIcon } from "lucide-react";

const labelCls = "text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1";

// ============================================================================
// Component
// ============================================================================

export default function WorkspacePage() {
  const [selectedDocId, setSelectedDocId] = useState(MOCK_DOCUMENTS[0]?.id ?? "");
  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [rightCollapsed, setRightCollapsed] = useState(false);
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [aiAction, setAiAction] = useState("");
  const [showBlockMenu, setShowBlockMenu] = useState<string | null>(null);
  const [toolbarAction, setToolbarAction] = useState("");

  const doc = useMemo(() => MOCK_DOCUMENTS.find(d => d.id === selectedDocId), [selectedDocId]);
  const [blocks, setBlocks] = useState<ContentBlock[]>(doc?.blocks ?? []);
  const [selectedVersion, setSelectedVersion] = useState<DocumentVersion | null>(null);

  // Handlers
  const updateBlock = useCallback((blockId: string, updates: Partial<ContentBlock>) => {
    setBlocks(prev => prev.map(b => b.id === blockId ? { ...b, ...updates } : b));
  }, []);

  const moveBlock = useCallback((blockId: string, direction: "up" | "down") => {
    setBlocks(prev => {
      const idx = prev.findIndex(b => b.id === blockId);
      if (idx < 0) return prev;
      const newIdx = direction === "up" ? idx - 1 : idx + 1;
      if (newIdx < 0 || newIdx >= prev.length) return prev;
      const next = [...prev];
      [next[idx], next[newIdx]] = [next[newIdx], next[idx]];
      return next;
    });
  }, []);

  const deleteBlock = useCallback((blockId: string) => {
    setBlocks(prev => prev.filter(b => b.id !== blockId));
  }, []);

  const duplicateBlock = useCallback((blockId: string) => {
    setBlocks(prev => {
      const idx = prev.findIndex(b => b.id === blockId);
      if (idx < 0) return prev;
      const dup = { ...prev[idx], id: `${prev[idx].id}-dup-${Date.now()}` };
      const next = [...prev];
      next.splice(idx + 1, 0, dup);
      return next;
    });
  }, []);

  const addBlock = useCallback((type: ContentBlock["type"]) => {
    const newBlock: ContentBlock = {
      id: `block-${Date.now()}`, type, content: "", align: "left",
      ...(type === "heading" ? { level: 2, content: "New Section" } : {}),
      ...(type === "paragraph" ? { content: "Start writing here..." } : {}),
      ...(type === "bullet-list" || type === "numbered-list" ? { items: ["New item"] } : {}),
      ...(type === "checklist" ? { content: "New task", checked: false } : {}),
    };
    setBlocks(prev => [...prev, newBlock]);
    setActiveBlockId(newBlock.id);
  }, []);

  const convertBlockType = useCallback((blockId: string, newType: ContentBlock["type"]) => {
    setBlocks(prev => prev.map(b => b.id === blockId ? { ...b, type: newType } : b));
    setShowBlockMenu(null);
  }, []);

  const handleAiAction = useCallback((action: string) => {
    setAiAction(action);
    setTimeout(() => setAiAction(""), 2000);
  }, []);

  const handleInlineFormat = useCallback((blockId: string, format: keyof ContentBlock) => {
    setBlocks(prev => prev.map(b => b.id === blockId ? { ...b, [format]: !b[format] } : b));
  }, []);

  // ============================================================================
  // Render helpers
  // ============================================================================

  const renderBlock = (block: ContentBlock) => {
    const isActive = activeBlockId === block.id;
    const cls = cn("relative group rounded-lg transition-all cursor-pointer border-2", isActive ? "border-cyan-500/30 bg-slate-800/40" : "border-transparent hover:border-slate-700/40 hover:bg-slate-800/20");

    const textStyle = cn(
      block.bold && "font-bold", block.italic && "italic", block.underline && "underline",
      block.align === "center" && "text-center", block.align === "right" && "text-right",
      block.color ? { color: block.color } : "text-slate-200",
      block.highlight ? { backgroundColor: block.highlight } : "",
    );

    const content = (
      <div className={cls} onClick={() => setActiveBlockId(block.id)}>
        {/* Block toolbar on hover */}
        {isActive && (
          <div className="absolute -top-9 left-0 z-10 flex items-center gap-0.5 bg-slate-900 border border-slate-700 rounded-lg p-1 shadow-xl">
            <div className="flex items-center gap-0.5 border-r border-slate-700 pr-1 mr-1">
              {[{ f: "bold", i: Bold }, { f: "italic", i: Italic }, { f: "underline", i: Underline }].map(({ f, i: Icon }) => (
                <button key={f} onClick={() => handleInlineFormat(block.id, f as keyof ContentBlock)} className={cn("p-1 rounded hover:bg-slate-700", block[f as keyof ContentBlock] && "text-cyan-400")}><Icon size={13} /></button>
              ))}
            </div>
            {[{ f: "left", i: AlignLeft }, { f: "center", i: AlignCenter }, { f: "right", i: AlignRight }].map(({ f, i: Icon }) => (
              <button key={f} onClick={() => updateBlock(block.id, { align: f as "left" | "center" | "right" })} className={cn("p-1 rounded hover:bg-slate-700", block.align === f && "text-cyan-400")}><Icon size={13} /></button>
            ))}
            <div className="border-l border-slate-700 ml-1 pl-1 flex items-center gap-0.5">
              <button onClick={() => moveBlock(block.id, "up")} className="p-1 rounded hover:bg-slate-700 text-slate-500"><ArrowUp size={12} /></button>
              <button onClick={() => moveBlock(block.id, "down")} className="p-1 rounded hover:bg-slate-700 text-slate-500"><ArrowDown size={12} /></button>
              <button onClick={() => duplicateBlock(block.id)} className="p-1 rounded hover:bg-slate-700 text-slate-500"><Copy size={12} /></button>
              <button onClick={() => deleteBlock(block.id)} className="p-1 rounded hover:bg-red-700/50 text-red-400"><Trash2 size={12} /></button>
            </div>
            <div className="border-l border-slate-700 ml-1 pl-1 relative">
              <button onClick={() => setShowBlockMenu(showBlockMenu === block.id ? null : block.id)} className="p-1 rounded hover:bg-slate-700 text-slate-400 text-[10px]">Type ▾</button>
              {showBlockMenu === block.id && (
                <div className="absolute top-full left-0 mt-1 bg-slate-900 border border-slate-700 rounded-lg p-1 shadow-xl z-20 w-40 max-h-48 overflow-y-auto">
                  {BLOCK_TYPES.map(bt => <button key={bt.value} onClick={() => convertBlockType(block.id, bt.value)} className="flex items-center gap-1.5 w-full text-left px-2 py-1 rounded text-[10px] text-slate-300 hover:bg-slate-700"><bt.icon size={12} />{bt.label}</button>)}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Block content */}
        <div className="p-3">
          {block.type === "heading" && <h2 className={cn("text-2xl font-bold text-white", textStyle)}>{block.content || "Heading"}</h2>}
          {block.type === "sub-heading" && <h3 className={cn("text-lg font-semibold text-slate-200", textStyle)}>{block.content || "Sub-heading"}</h3>}
          {block.type === "paragraph" && <p className={cn("text-sm leading-relaxed", textStyle)}>{block.content || "Start typing..."}</p>}
          {block.type === "quote" && <blockquote className={cn("border-l-2 border-cyan-500/50 pl-4 py-1 italic text-slate-400", textStyle)}>{block.content}</blockquote>}
          {block.type === "callout" && <div className={cn("rounded-xl bg-cyan-500/5 border border-cyan-500/20 p-3 text-sm text-cyan-300", textStyle)}>{block.content}</div>}
          {block.type === "checklist" && <div className="flex items-start gap-2 text-sm"><input type="checkbox" checked={block.checked} onChange={() => updateBlock(block.id, { checked: !block.checked })} className="mt-0.5 accent-cyan-500" /><span className={cn(block.checked && "line-through text-slate-500", textStyle)}>{block.content}</span></div>}
          {block.type === "bullet-list" && <ul className="list-disc list-inside space-y-0.5 text-sm">{block.items?.map((item, i) => <li key={i} className={cn(textStyle)}>{item}</li>)}</ul>}
          {block.type === "numbered-list" && <ol className="list-decimal list-inside space-y-0.5 text-sm">{block.items?.map((item, i) => <li key={i} className={cn(textStyle)}>{item}</li>)}</ol>}
          {block.type === "code" && <pre className="bg-slate-950 rounded-lg p-3 text-xs text-emerald-400 font-mono overflow-x-auto"><code>{block.content}</code></pre>}
          {block.type === "cta" && <div className={cn("inline-block rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 px-4 py-2 text-sm font-semibold text-white", textStyle)}>{block.content || "Call to Action"}</div>}
          {block.type === "divider" && <hr className="border-slate-700/50 my-2" />}
          {block.type === "faq" && <div className="text-sm"><p className="font-semibold text-white">{block.content?.split("\n")[0] || "Question?"}</p><p className="text-slate-400 mt-1">{block.content?.split("\n")[1] || "Answer goes here."}</p></div>}
          {block.type === "image-placeholder" && <div className="flex items-center justify-center rounded-xl border-2 border-dashed border-slate-600/50 bg-slate-800/30 h-32 text-xs text-slate-500"><ImageIcon size={20} className="mr-2" />Image Placeholder</div>}
          {block.type === "table" && <div className="text-xs text-slate-500">📊 Table block — coming soon</div>}
        </div>
      </div>
    );

    // Editable textarea overlay for active block
    if (isActive && !["bullet-list", "numbered-list", "divider", "image-placeholder", "table", "checklist"].includes(block.type)) {
      return (
        <div key={block.id} className="relative">
          {content}
          <textarea value={block.content} onChange={e => updateBlock(block.id, { content: e.target.value })} className="absolute inset-0 opacity-0 w-full h-full resize-none" style={{ pointerEvents: "none" }} />
        </div>
      );
    }

    return <div key={block.id}>{content}</div>;
  };

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <div className="h-[calc(100vh-10rem)] flex flex-col pb-4">
      {/* Top bar */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex-shrink-0 flex items-center justify-between mb-3 pb-3 border-b border-slate-800/60">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/30 to-blue-500/30 border border-cyan-500/30"><FileEdit size={18} className="text-cyan-300" /></div>
          <div><h1 className="text-base font-bold text-white">Content Workspace</h1><p className="text-[11px] text-slate-400">{doc?.title ?? "Select a document"}</p></div>
        </div>
        <div className="flex items-center gap-2">
          <select value={selectedDocId} onChange={e => { setSelectedDocId(e.target.value); setBlocks(MOCK_DOCUMENTS.find(d => d.id === e.target.value)?.blocks ?? []); }} className="h-8 rounded-lg border border-slate-700/60 bg-slate-900/70 px-2 text-xs text-slate-300 w-40 outline-none">
            {MOCK_DOCUMENTS.slice(0, 10).map(d => <option key={d.id} value={d.id}>{d.title}</option>)}
          </select>
          <div className="flex items-center gap-1 ml-2">
            <Button size="xs" variant="ghost" className="text-slate-400 text-xs"><Save size={12} /> Save</Button>
            <Button size="xs" variant="ghost" className="text-slate-400 text-xs"><Copy size={12} /></Button>
            <Button size="xs" variant="ghost" className="text-slate-400 text-xs"><Download size={12} /></Button>
            <Button size="xs" variant="ghost" className="text-slate-400 text-xs"><Library size={12} /></Button>
          </div>
          <button onClick={() => setLeftCollapsed(v => !v)} className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-500"><ChevronLeft size={16} className={cn(leftCollapsed && "rotate-180")} /></button>
          <button onClick={() => setRightCollapsed(v => !v)} className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-500"><ChevronRight size={16} className={cn(rightCollapsed && "rotate-180")} /></button>
        </div>
      </motion.div>

      <div className="flex-1 flex gap-4 min-h-0">
        {/* LEFT PANEL — Document Navigator */}
        <AnimatePresence>
          {!leftCollapsed && (
            <motion.div initial={{ width: 0, opacity: 0 }} animate={{ width: 240, opacity: 1 }} exit={{ width: 0, opacity: 0 }} className="flex-shrink-0 overflow-y-auto scrollbar-thin space-y-3 pr-1" style={{ minWidth: 0, maxWidth: 240 }}>
              <Card>
                <CardHeader title="Document Outline" description={`${blocks.length} blocks`} />
                <CardContent>
                  <div className="space-y-0.5">
                    {blocks.map(b => (
                      <button key={b.id} onClick={() => setActiveBlockId(b.id)} className={cn("w-full text-left px-2 py-1 rounded text-[11px] truncate transition-colors", activeBlockId === b.id ? "bg-cyan-500/10 text-cyan-300" : "text-slate-400 hover:bg-slate-800/50")}>
                        {b.type === "heading" && <Type size={10} className="inline mr-1" />}
                        {b.type === "sub-heading" && <span className="ml-3"><Type size={10} className="inline mr-1" /></span>}
                        {(b.type === "heading" || b.type === "sub-heading") ? (b.content || "Untitled") : `${b.type.replace("-", " ")}`}
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader title="Quick Actions" />
                <CardContent>
                  <div className="flex flex-wrap gap-1">
                    {[{ t: "heading", l: "H" }, { t: "sub-heading", l: "SH" }, { t: "paragraph", l: "P" }, { t: "quote", l: "Q" }, { t: "callout", l: "C" }, { t: "checklist", l: "CL" }, { t: "bullet-list", l: "BL" }, { t: "numbered-list", l: "NL" }, { t: "code", l: "CD" }, { t: "cta", l: "CTA" }, { t: "divider", l: "D" }, { t: "faq", l: "FAQ" }, { t: "image-placeholder", l: "IMG" }].map(({ t, l }) => (
                      <button key={t} onClick={() => addBlock(t as ContentBlock["type"])} className="px-2 py-1 rounded-lg text-[10px] font-medium text-slate-400 hover:bg-slate-700/50 hover:text-slate-200 border border-slate-700/30">
                        <Plus size={10} className="inline mr-0.5" /> {l}
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Asset list */}
              {doc && doc.assets.length > 0 && (
                <Card>
                  <CardHeader title="Assets" description={`${doc.assets.length} files`} />
                  <CardContent>
                    <div className="space-y-1">
                      {doc.assets.map(a => <div key={a.id} className="text-[10px] text-slate-400 truncate flex items-center gap-1.5"><ImageIcon size={10} />{a.name}</div>)}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Comments mini-list */}
              {doc && doc.comments.length > 0 && (
                <Card>
                  <CardHeader title="Comments" description={`${doc.comments.length} total`} action={<button onClick={() => setShowComments(v => !v)} className="text-xs text-cyan-400">{showComments ? "Hide" : "Show"}</button>} />
                  {showComments && <CardContent><div className="space-y-2">{doc.comments.map(c => <div key={c.id} className={cn("text-[10px] p-1.5 rounded", c.resolved ? "text-slate-600 line-through" : "text-slate-400")}><p className="font-medium text-slate-300">{c.author}</p><p>{c.text}</p></div>)}</div></CardContent>}
                </Card>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* CENTER PANEL — Block Editor */}
        <div className="flex-1 flex flex-col min-w-0 gap-3 overflow-y-auto scrollbar-thin">
          {!doc ? (
            <div className="flex-1 flex items-center justify-center"><p className="text-slate-500 text-sm">Select a document to start editing.</p></div>
          ) : (
            <div className="space-y-1 pb-8">
              {blocks.map(b => renderBlock(b))}
              
              {/* Add block at bottom */}
              <div className="relative group rounded-lg border-2 border-dashed border-slate-700/40 hover:border-cyan-500/30 transition-all p-4">
                <div className="flex flex-wrap gap-1 justify-center">
                  {[{ t: "paragraph", l: "Text" }, { t: "sub-heading", l: "Subhead" }, { t: "quote", l: "Quote" }, { t: "callout", l: "Callout" }, { t: "cta", l: "CTA" }, { t: "divider", l: "Divider" }, { t: "image-placeholder", l: "Image" }].map(({ t, l }) => (
                    <button key={t} onClick={() => addBlock(t as ContentBlock["type"])} className="px-2 py-1 rounded-lg text-[10px] font-medium text-slate-500 hover:bg-slate-700/50 hover:text-slate-200">
                      <Plus size={10} className="inline mr-0.5" /> {l}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT PANEL — AI Assistant + Analysis */}
        <AnimatePresence>
          {!rightCollapsed && (
            <motion.div initial={{ width: 0, opacity: 0 }} animate={{ width: 260, opacity: 1 }} exit={{ width: 0, opacity: 0 }} className="flex-shrink-0 overflow-y-auto scrollbar-thin space-y-3 pl-1" style={{ minWidth: 0, maxWidth: 260 }}>
              {/* AI Quick Actions */}
              <Card>
                <CardHeader title="AI Assistant" />
                <CardContent>
                  <div className="flex flex-wrap gap-1">
                    {AI_ACTIONS.map(a => (
                      <button key={a.id} onClick={() => handleAiAction(a.id)} className={cn("px-2 py-1 rounded-lg text-[10px] font-medium transition-colors flex items-center gap-1", aiAction === a.id ? "bg-cyan-500/20 text-cyan-300" : "text-slate-400 hover:bg-slate-700/50")}>
                        <a.icon size={11} /> {a.label}
                      </button>
                    ))}
                  </div>
                  {aiAction && <p className="text-[10px] text-cyan-400 mt-2">🤖 Running "{AI_ACTIONS.find(a => a.id === aiAction)?.label}"...</p>}
                </CardContent>
              </Card>

              {/* Live Analysis */}
              <Card>
                <CardHeader title="Live Analysis" />
                <CardContent className="space-y-2">
                  {LIVE_METRICS.map(m => (
                    <div key={m.id}>
                      <div className="flex items-center justify-between text-[10px] mb-0.5"><span className="text-slate-400 flex items-center gap-1"><m.icon size={10} />{m.label}</span><span className={cn("font-semibold", m.defaultScore > 80 ? "text-emerald-400" : m.defaultScore > 60 ? "text-amber-400" : "text-red-400")}>{m.defaultScore}/100</span></div>
                      <div className="h-1 rounded-full bg-slate-800 overflow-hidden"><div className={cn("h-full rounded-full", m.defaultScore > 80 ? "bg-emerald-500" : m.defaultScore > 60 ? "bg-amber-500" : "bg-red-500")} style={{ width: `${m.defaultScore}%` }} /></div>
                    </div>
                  ))}
                  <div className="flex justify-between text-[10px] text-slate-500 pt-2 border-t border-slate-800">
                    <span className="flex items-center gap-1"><Type size={10} /> {doc?.metadata.wordCount ?? 0} words</span>
                    <span className="flex items-center gap-1"><Clock size={10} /> {doc?.metadata.readingTime ?? 0} min read</span>
                  </div>
                </CardContent>
              </Card>

              {/* Version History */}
              {doc && doc.versions.length > 0 && (
                <Card>
                  <CardHeader title="Version History" description={`${doc.versions.length} versions`} action={<button onClick={() => setShowVersionHistory(v => !v)} className="text-xs text-cyan-400">{showVersionHistory ? "Hide" : "Show"}</button>} />
                  {showVersionHistory && <CardContent><div className="space-y-1.5">{doc.versions.map(v => <button key={v.id} onClick={() => setSelectedVersion(v)} className={cn("w-full text-left p-2 rounded-lg text-xs transition-colors", selectedVersion?.id === v.id ? "bg-cyan-500/10 text-cyan-300" : "text-slate-400 hover:bg-slate-700/50")}><p className="font-medium">{v.label}</p><p className="text-[10px] text-slate-500">{new Date(v.timestamp).toLocaleString()}</p></button>)}</div></CardContent>}
                </Card>
              )}

              {/* Version Diff (mock) */}
              {selectedVersion && (
                <Card>
                  <CardHeader title="Version Diff" description={selectedVersion.label} />
                  <CardContent>
                    <div className="text-[10px] text-slate-400 space-y-1">
                      <p className="text-emerald-400">+ {selectedVersion.snapshot.length} blocks in this version</p>
                      <p className="text-red-400">- {(doc?.blocks.length ?? 0) - selectedVersion.snapshot.length} blocks removed</p>
                      <div className="mt-2">
                        <Button size="xs" variant="outline" onClick={() => setBlocks(selectedVersion.snapshot)} className="text-xs gap-1 border-slate-700">Restore</Button>
                      </div>
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