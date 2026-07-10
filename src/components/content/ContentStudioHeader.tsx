"use client";

import { Sliders, Wand2 } from "lucide-react";
import { useContentStudio } from "@/features/content/ContentStudioProvider";

interface ContentStudioHeaderProps {
  title: string;
  description: string;
}

/** Shared Simple/Advanced mode toggle for Creative Design Studio and Content Creation Studio. Advanced Mode is opt-in and hidden by default, per the brief. */
export function ContentStudioHeader({ title, description }: ContentStudioHeaderProps) {
  const { mode, toggleMode } = useContentStudio();

  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      <button
        onClick={toggleMode}
        className="flex h-10 shrink-0 items-center gap-2 rounded-xl border border-border bg-surface/70 px-4 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground"
      >
        {mode === "simple" ? <Sliders size={15} /> : <Wand2 size={15} />}
        <span>{mode === "simple" ? "Advanced Mode" : "Back to Simple Mode"}</span>
      </button>
    </div>
  );
}
