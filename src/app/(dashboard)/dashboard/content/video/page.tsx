import { Clapperboard } from "lucide-react";

const FUTURE_CAPABILITIES = ["AI Avatars", "AI Voiceovers", "AI Reels", "AI Shorts", "AI Ads", "AI Explainers", "AI Subtitles"];

/**
 * Architecture-only stub, per the brief: "UI displays Coming Soon. No placeholder functionality."
 * No buttons or clickable-looking elements — a real disabled control would still read as a dead
 * button. When a real video-generation provider exists, this will extend the same
 * `ContentOrchestrationEngine` / `MediaPlatformAPI` pattern the other two Studios already use.
 */
export default function VideoCreationStudioPage() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center gap-4 rounded-2xl border border-dashed border-border bg-card px-8 py-16 text-center">
      <Clapperboard size={32} className="text-muted-foreground" />
      <h1 className="text-xl font-bold text-foreground">Video Creation Studio</h1>
      <p className="text-sm text-muted-foreground">Coming soon.</p>
      <div className="mt-2 flex flex-wrap justify-center gap-2">
        {FUTURE_CAPABILITIES.map(capability => (
          <span key={capability} className="rounded-full border border-border bg-surface/40 px-3 py-1 text-xs text-muted-foreground">
            {capability}
          </span>
        ))}
      </div>
    </div>
  );
}
