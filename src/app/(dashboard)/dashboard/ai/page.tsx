"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import {
  Bot, Send, Sparkles, Zap, Brain, BarChart3, Clock, CheckCircle, AlertTriangle, Loader2, X, ChevronRight, Settings,
  Wand2, FileText, Image, GitBranch, Library, Shield, Search, TrendingUp, Layers, Folder, RefreshCw, Play, Square,
  ChevronDown, ChevronUp, Plus, MessageSquare, Lightbulb,
} from "lucide-react";
import { CopilotEngine } from "@/core/copilot/CopilotEngine";
import type { CopilotSession, CopilotMessage, ExecutionPlan, PlanStep, TaskStatus } from "@/core/copilot/types";

const STATUS_ICONS: Record<TaskStatus, React.ComponentType<{size?:number;className?:string}>> = {
  queued: Clock, running: Loader2, completed: CheckCircle, failed: AlertTriangle,
};

export default function CopilotPage() {
  const [session, setSession] = useState<CopilotSession>(() => CopilotEngine.createSession());
  const [input, setInput] = useState("");
  const [plan, setPlan] = useState<ExecutionPlan | null>(null);
  const [executing, setExecuting] = useState(false);
  const [stepStatuses, setStepStatuses] = useState<Record<string, TaskStatus>>({});
  const [stepResults, setStepResults] = useState<Record<string, string>>({});
  const [activePanel, setActivePanel] = useState<"plan" | "monitor" | "results" | "memory">("plan");
  const chatEndRef = useRef<HTMLDivElement>(null);
  const dashboard = useMemo(() => CopilotEngine.getDashboard(), []);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [session.messages]);

  const handleSend = useCallback(async () => {
    if (!input.trim()) return;
    const { response, plan: newPlan } = await CopilotEngine.sendMessage(session.id, input);
    setInput("");
    setPlan(newPlan);
    const steps: Record<string, TaskStatus> = {}; newPlan.steps.forEach(s => steps[s.id] = "queued");
    setStepStatuses(steps); setStepResults({});
    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  }, [input, session.id]);

  const handleExecute = useCallback(async () => {
    if (!plan) return;
    setExecuting(true);
    setStepResults({});
    setActivePanel("monitor");
    await CopilotEngine.executePlan(session.id, (stepId, status, result) => {
      setStepStatuses(prev => ({ ...prev, [stepId]: status }));
      if (result) setStepResults(prev => ({ ...prev, [stepId]: result }));
    });
    setExecuting(false);
    setActivePanel("results");
  }, [plan, session.id]);

  const toggleStep = useCallback((stepId: string) => {
    if (!plan) return;
    setPlan({ ...plan, steps: plan.steps.map(s => s.id === stepId ? { ...s, enabled: !s.enabled } : s) });
  }, [plan]);

  const suggestions = useMemo(() => CopilotEngine.getSuggestedPrompts(), []);

  return (
    <div className="h-[calc(100vh-5rem)] flex flex-col pb-4">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex-shrink-0 flex items-center justify-between mb-3 pb-3 border-b border-slate-800/60">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500/30 to-cyan-500/30 border border-purple-500/30"><Bot size={18} className="text-purple-300" /></div>
          <div><h1 className="text-base font-bold text-white">AI Copilot</h1><p className="text-[11px] text-slate-400">Marketing Orchestrator</p></div>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-slate-500">
          <span className="flex items-center gap-1"><CheckCircle size={11} className="text-emerald-400" />{dashboard.tasksToday} tasks</span>
          <span>{dashboard.successRate}% success</span>
          <span>{dashboard.contentGenerated} content</span>
          <span>{dashboard.imagesGenerated} images</span>
        </div>
      </motion.div>

      <div className="flex-1 flex gap-4 min-h-0">
        {/* LEFT — Conversation */}
        <div className="flex-1 flex flex-col min-w-0">
          <Card className="flex-1 flex flex-col min-h-0">
            <CardHeader title="Conversation" description="Ask the Copilot to orchestrate marketing tasks" />
            <CardContent className="flex-1 flex flex-col min-h-0">
              <div className="flex-1 overflow-y-auto scrollbar-thin space-y-3 mb-3">
                {session.messages.map(msg => (
                  <div key={msg.id} className={cn("p-3 rounded-xl text-sm max-w-[90%]", msg.role === "user" ? "bg-cyan-500/10 border border-cyan-500/20 ml-auto text-cyan-200" : msg.role === "copilot" ? "bg-slate-800/40 border border-slate-700/40 text-slate-300" : "bg-slate-800/20 text-slate-500 text-center italic")}>
                    {msg.content}
                    {msg.suggestions && msg.suggestions.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {msg.suggestions.map((s, i) => <button key={i} onClick={() => { setInput(s); }} className="px-2 py-1 rounded-lg text-[10px] text-purple-400 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20">{s}</button>)}
                      </div>
                    )}
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>

              {/* Suggested prompts */}
              {session.messages.length <= 1 && (
                <div className="mb-3">
                  <p className="text-[10px] text-slate-500 mb-2">Suggested prompts:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {suggestions.slice(0, 8).map((s, i) => <button key={i} onClick={() => { setInput(s); }} className="px-2 py-1 rounded-lg text-[10px] text-slate-400 bg-slate-800/30 hover:bg-slate-700/50 border border-slate-700/40">{s}</button>)}
                  </div>
                </div>
              )}

              {/* Input */}
              <div className="flex gap-2">
                <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSend()} placeholder="Ask the Copilot... e.g., 'Create an Instagram campaign for Q4 launch'" className="flex-1 h-9 rounded-lg border border-slate-700/60 bg-slate-900/70 px-3 text-sm text-slate-200 outline-none placeholder:text-slate-600" />
                <Button size="sm" onClick={handleSend} disabled={!input.trim()} className="gap-1"><Send size={13} /> Send</Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT — Plan / Monitor / Results / Memory */}
        <div className="flex-shrink-0 w-80 space-y-3">
          {/* Panel tabs */}
          <div className="flex gap-1">
            {(["plan","monitor","results","memory"] as const).map(tab => <button key={tab} onClick={() => setActivePanel(tab)} className={cn("flex-1 px-2 py-1.5 rounded-lg text-[10px] font-medium capitalize transition-colors", activePanel === tab ? "bg-cyan-500/20 text-cyan-300" : "text-slate-400 hover:bg-slate-800/50")}>{tab}</button>)}
          </div>

          {/* Plan panel */}
          {activePanel === "plan" && (
            <Card>
              <CardHeader title="Execution Plan" description={plan ? `${plan.steps.length} steps • ~${(plan.estimatedTotalMs / 1000).toFixed(0)}s total` : "No plan yet"} action={plan && <Button size="xs" onClick={handleExecute} disabled={executing} className="gap-1 text-[10px]"><Play size={11} /> Execute</Button>} />
              <CardContent>
                {plan ? (
                  <div className="space-y-1.5">
                    {plan.steps.map(s => (
                      <div key={s.id} onClick={() => toggleStep(s.id)} className={cn("flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors text-xs", s.enabled ? "text-slate-300 bg-slate-800/20 hover:bg-slate-700/30" : "text-slate-600 bg-slate-800/10 line-through")}>
                        <input type="checkbox" checked={s.enabled} onChange={() => {}} className="accent-cyan-500 w-3 h-3" />
                        <span className="flex-1">{s.label}</span>
                        <span className="text-[9px] text-slate-600">{(s.estimatedTimeMs / 1000).toFixed(0)}s</span>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-xs text-slate-500">Send a message to generate an execution plan.</p>}
              </CardContent>
            </Card>
          )}

          {/* Monitor panel */}
          {activePanel === "monitor" && (
            <Card>
              <CardHeader title="Execution Monitor" description={executing ? "Running..." : plan ? "Ready to execute" : "No plan"} />
              <CardContent>
                {plan ? (
                  <div className="space-y-1.5">
                    {plan.steps.filter(s => s.enabled).map(s => {
                      const status = stepStatuses[s.id] ?? "queued";
                      const Icon = STATUS_ICONS[status];
                      return (
                        <div key={s.id} className={cn("flex items-start gap-2 p-2 rounded-lg text-xs", status === "completed" ? "text-emerald-400 bg-emerald-500/5" : status === "running" ? "text-cyan-400 bg-cyan-500/5" : status === "failed" ? "text-red-400 bg-red-500/5" : "text-slate-400 bg-slate-800/20")}>
                          <Icon size={13} className={cn("mt-0.5 flex-shrink-0", status === "running" && "animate-spin")} />
                          <div className="flex-1 min-w-0"><p className="font-medium">{s.label}</p>{stepResults[s.id] && <p className="text-[9px] opacity-70 truncate">{stepResults[s.id]}</p>}</div>
                        </div>
                      );
                    })}
                  </div>
                ) : <p className="text-xs text-slate-500">Nothing to monitor yet.</p>}
              </CardContent>
            </Card>
          )}

          {/* Results panel */}
          {activePanel === "results" && (
            <Card>
              <CardHeader title="Results" description={Object.keys(stepResults).length > 0 ? `${Object.keys(stepResults).length} completed` : "No results yet"} />
              <CardContent>
                {Object.keys(stepResults).length > 0 ? (
                  <div className="space-y-1.5">
                    {Object.entries(stepResults).map(([id, result]) => (
                      <div key={id} className="p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/20 text-[10px] text-emerald-400">{result}</div>
                    ))}
                  </div>
                ) : <p className="text-xs text-slate-500">Execute the plan to see results here.</p>}
              </CardContent>
            </Card>
          )}

          {/* Memory panel */}
          {activePanel === "memory" && (
            <Card>
              <CardHeader title="Workspace Memory" description="Active context" />
              <CardContent>
                <div className="text-[10px] space-y-1.5 text-slate-400">
                  {Object.entries(session.memory).filter(([k]) => !["recentTasks","recentAssets","recentWorkflows"].includes(k)).map(([k, v]) => (
                    <div key={k} className="flex justify-between"><span className="text-slate-500 capitalize">{k}</span><span className="text-slate-300">{v ?? "—"}</span></div>
                  ))}
                  <div className="border-t border-slate-800 pt-2 mt-2">
                    <p className="text-slate-500 mb-1">Recent Tasks:</p>
                    {session.memory.recentTasks.length === 0 ? <p className="text-slate-600">None yet</p> : session.memory.recentTasks.map((t, i) => <p key={i} className="text-slate-400">{t}</p>)}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}