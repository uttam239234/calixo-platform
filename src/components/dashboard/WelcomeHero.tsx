"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/button";
import { SkeletonText } from "@/components/ui/Skeleton";
import { Sparkles, CalendarDays, TrendingUp, ArrowRight, Zap, Search } from "lucide-react";
import type { DashboardMorningBriefing } from "@/core/dashboard";

interface WelcomeHeroProps {
  workspace: string;
  userName?: string | null;
  briefing: DashboardMorningBriefing | null;
  loading?: boolean;
  onOpenSearch: () => void;
  onViewRecommendations: () => void;
}

export default function WelcomeHero({ workspace, userName, briefing, loading = false, onOpenSearch, onViewRecommendations }: WelcomeHeroProps) {
  const now = new Date();
  const greeting = now.getHours() < 12 ? "Good morning" : now.getHours() < 18 ? "Good afternoon" : "Good evening";
  const dateLabel = now.toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  const greetedName = userName?.split(" ")[0] || workspace;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-ai shadow-sm shadow-primary/20">
            <Zap size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              {greeting}, <span className="text-gradient">{greetedName}</span>
            </h1>
            <p className="text-sm text-muted-foreground">{userName ? `${workspace} · ${dateLabel}` : dateLabel}</p>
          </div>
        </div>
        <button
          onClick={onOpenSearch}
          className="hidden sm:flex items-center gap-2 rounded-2xl border border-border bg-card px-3.5 py-2 text-sm text-muted-foreground transition-colors hover:border-primary/40"
        >
          <Search size={15} className="text-muted-foreground/70" />
          <span className="text-muted-foreground/60">Search dashboard...</span>
          <kbd className="rounded-md border border-border bg-background/50 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground/60">⌘K</kbd>
        </button>
      </div>

      <Card className="overflow-hidden border-primary/10 bg-gradient-to-br from-card via-card to-primary/[0.02]">
        <CardContent>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-4 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary-light px-3 py-1 text-xs font-semibold text-primary shadow-sm">
                  <Sparkles size={12} />
                  AI Executive Summary
                </div>
                <div className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-card/80 px-3 py-1 text-xs text-muted-foreground">
                  <CalendarDays size={12} />
                  {dateLabel}
                </div>
              </div>

              <div className="max-w-2xl">
                {loading || !briefing ? (
                  <div className="space-y-2">
                    <SkeletonText className="h-4 w-full" />
                    <SkeletonText className="h-4 w-3/4" />
                  </div>
                ) : (
                  <>
                    <p className="text-[15px] font-semibold text-foreground">{briefing.headline}</p>
                    <p className="mt-1 text-[15px] leading-relaxed text-muted-foreground">{briefing.summary}</p>
                  </>
                )}
              </div>

              <div className="flex flex-wrap gap-3">
                <Button variant="primary" size="md" onClick={onViewRecommendations}>
                  <Zap size={16} />
                  View AI Recommendations
                </Button>
                <Link href="/dashboard/analytics">
                  <Button variant="outline" size="md">
                    <TrendingUp size={16} />
                    Open Analytics
                  </Button>
                </Link>
              </div>
            </div>

            <div className="flex flex-col items-center gap-3 rounded-2xl border border-border/60 bg-surface/30 p-5 min-w-[170px] shadow-sm">
              <div className="relative flex h-24 w-24 items-center justify-center">
                <svg className="h-24 w-24 -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" className="text-border/50" strokeWidth="6" />
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    fill="none"
                    stroke="url(#healthGradient)"
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={`${((briefing?.healthScore ?? 0) / 100) * 264} 264`}
                    className="transition-all duration-1000 ease-out"
                  />
                  <defs>
                    <linearGradient id="healthGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="var(--primary)" />
                      <stop offset="100%" stopColor="#8B5CF6" />
                    </linearGradient>
                  </defs>
                </svg>
                <span className="absolute text-2xl font-bold tabular-nums text-foreground">{briefing?.healthScore ?? "—"}</span>
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-foreground">Marketing Health</p>
                <p className="text-xs text-muted-foreground mt-0.5">{briefing?.healthLabel ?? "Loading…"}</p>
              </div>
              <button onClick={onViewRecommendations} className="flex items-center gap-1 text-xs font-medium text-primary hover:underline">
                View Details <ArrowRight size={12} />
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
