"use client";

import { Plus, FileUp, Cable, Bot, ArrowRight } from "lucide-react";
import Link from "next/link";

const actions = [
  { title: "Create Campaign", description: "Launch across any channel", icon: Plus, href: "/dashboard/ads/campaigns/new" },
  { title: "Import Campaign", description: "Bring in existing campaigns", icon: FileUp },
  { title: "Connect Platform", description: "Add an advertising account", icon: Cable },
  { title: "AI Optimize All", description: "Let AI optimize your campaigns", icon: Bot },
];

export function QuickActions() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {actions.map(({ title, description, icon: Icon, href }) => {
        const content = (
          <div className="flex items-center gap-4 rounded-2xl border border-border/50 bg-card/50 p-4 text-left transition-all duration-200 hover:-translate-y-1 hover:border-primary/30 hover:shadow-md group">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-ai/10 text-primary group-hover:from-primary/20 group-hover:to-ai/20 transition-all duration-200">
              <Icon size={20} />
            </div>
            <div className="min-w-0 flex-1">
              <span className="block text-sm font-semibold text-foreground">{title}</span>
              <span className="mt-0.5 block truncate text-xs text-muted-foreground">{description}</span>
            </div>
            <ArrowRight size={16} className="shrink-0 text-muted-foreground/50 transition group-hover:translate-x-1 group-hover:text-primary" />
          </div>
        );
        return href ? (
          <Link key={title} href={href}>
            {content}
          </Link>
        ) : (
          <button key={title} type="button" className="w-full text-left">
            {content}
          </button>
        );
      })}
    </div>
  );
}