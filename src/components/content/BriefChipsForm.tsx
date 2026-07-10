"use client";

import type { ReactNode } from "react";
import { Loader2, Sparkles } from "lucide-react";
import type { ToneOption } from "@/core/ai/types";
import type { BrandStyleProfile } from "@/core/brand";

const TONE_OPTIONS: { id: ToneOption; label: string }[] = [
  { id: "professional", label: "Professional" },
  { id: "friendly", label: "Friendly" },
  { id: "persuasive", label: "Persuasive" },
  { id: "conversational", label: "Conversational" },
];

const CTA_OPTIONS = ["Learn More", "Apply Now", "Book a Call", "Sign Up", "Shop Now"];

interface BriefChipsFormProps {
  objective: string;
  onObjectiveChange: (value: string) => void;
  audienceName: string;
  onAudienceChange: (value: string) => void;
  tone: ToneOption;
  onToneChange: (value: ToneOption) => void;
  cta: string;
  onCtaChange: (value: string) => void;
  brandStyleDefaults?: BrandStyleProfile;
  extra?: ReactNode;
  generating: boolean;
  onGenerate: () => void;
  generateLabel?: string;
}

/**
 * The Simple Mode brief screen shared by Creative Design Studio and Content Creation Studio —
 * one screen, every question pre-filled with a sensible default. Minimum path: type nothing,
 * tap Generate. Every chip tap is the user choosing to override a default, not a mandatory step.
 */
export function BriefChipsForm({
  objective,
  onObjectiveChange,
  audienceName,
  onAudienceChange,
  tone,
  onToneChange,
  cta,
  onCtaChange,
  brandStyleDefaults,
  extra,
  generating,
  onGenerate,
  generateLabel = "Generate",
}: BriefChipsFormProps) {
  return (
    <div className="mx-auto max-w-2xl space-y-6 rounded-2xl border border-border bg-card p-6">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">What&apos;s this for?</label>
        <textarea
          value={objective}
          onChange={e => onObjectiveChange(e.target.value)}
          placeholder="e.g. Get more leads for our MBA program"
          rows={2}
          className="w-full resize-none rounded-xl border border-border bg-surface/60 px-3.5 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary/40"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">Who&apos;s it for?</label>
        <input
          value={audienceName}
          onChange={e => onAudienceChange(e.target.value)}
          placeholder="e.g. Working professionals"
          className="w-full rounded-xl border border-border bg-surface/60 px-3.5 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary/40"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">Tone</label>
        <div className="flex flex-wrap gap-2">
          {TONE_OPTIONS.map(option => (
            <button
              key={option.id}
              onClick={() => onToneChange(option.id)}
              className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
                tone === option.id ? "border-primary/40 bg-primary/10 text-primary" : "border-border bg-surface/60 text-muted-foreground hover:text-foreground"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">What should people do next?</label>
        <div className="flex flex-wrap gap-2">
          {CTA_OPTIONS.map(option => (
            <button
              key={option}
              onClick={() => onCtaChange(option)}
              className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
                cta === option ? "border-primary/40 bg-primary/10 text-primary" : "border-border bg-surface/60 text-muted-foreground hover:text-foreground"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      {brandStyleDefaults && (
        <div className="flex items-center gap-2 rounded-xl border border-border bg-surface/40 px-3.5 py-2.5 text-xs text-muted-foreground">
          <Sparkles size={13} className="text-primary" />
          <span>
            Using brand style: <span className="font-medium text-foreground">{brandStyleDefaults.brandName}</span>
          </span>
        </div>
      )}

      {extra}

      <button
        onClick={onGenerate}
        disabled={generating}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {generating ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
        {generating ? "Generating…" : generateLabel}
      </button>
    </div>
  );
}
