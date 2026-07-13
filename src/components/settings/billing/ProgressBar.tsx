"use client";

interface ProgressBarProps {
  label: string;
  value: string;
  /** Fill width — pass "percent remaining" for a gas-gauge feel (depletes as credits are used). */
  percent: number;
  /** Computed by the caller from "percent used" (not remaining) — the bar's fill width and its color intentionally use different percentages, since a nearly-full "remaining" bar should never render as a warning color. Defaults to "good" when omitted (e.g. purchased credits, which have no running-low concept). */
  tone?: "good" | "warning" | "critical";
}

/** Same semantic-token progress bar convention already used by the Dashboard's `SubscriptionSummary` — reused here, not reinvented. */
export function ProgressBar({ label, value, percent, tone = "good" }: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, percent));
  const barColor = tone === "critical" ? "bg-destructive" : tone === "warning" ? "bg-warning" : "bg-primary";

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium text-foreground">{value}</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div className={`h-full rounded-full transition-all ${barColor}`} style={{ width: `${clamped}%` }} />
      </div>
    </div>
  );
}
