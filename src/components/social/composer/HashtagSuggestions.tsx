"use client";
import { useMemo } from "react";
import { Hash } from "lucide-react";
import { socialPlatformAPI } from "@/core/social";

const FALLBACK_TAGS = ["#SocialMedia", "#MarketingAI", "#ContentStrategy", "#Calixo", "#DigitalMarketing", "#GrowthMarketing"];

/**
 * Real keyword-extraction suggestions from the actual draft content (`socialPlatformAPI.suggestHashtags()`)
 * — replaces a fixed 6-tag list whose "Refresh" button only ever re-picked from that same static
 * set. Suggestions update live as `content` changes, so there's no "Refresh" button to click —
 * one that just re-ran the same deterministic extraction over unchanged content would be a dead
 * action, exactly the class of bug this certification pass removes.
 */
export function HashtagSuggestions({ content, onAdd }: { content: string; onAdd: (tag: string) => void }) {
  const tags = useMemo(() => {
    const suggested = socialPlatformAPI.suggestHashtags(content);
    return suggested.length > 0 ? suggested : FALLBACK_TAGS;
  }, [content]);

  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground">Hashtag suggestions</h2>
        <span className="text-[10px] uppercase tracking-wide text-muted-foreground">{content.trim() ? "From your post" : "Suggested"}</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {tags.map(tag => (
          <button key={tag} onClick={() => onAdd(tag)} className="flex items-center gap-1 rounded-xl border border-border bg-surface px-2.5 py-2 text-xs text-muted-foreground hover:border-primary/30 hover:text-primary">
            <Hash size={12} />
            {tag.slice(1)}
          </button>
        ))}
      </div>
    </section>
  );
}
