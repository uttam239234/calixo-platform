"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useExperiments } from "@/features/platform-admin/experiments/useExperiments";

const ROLLOUT_STEPS = [0, 25, 50, 100];

export default function ExperimentsPage() {
  const { experiments, setRollout } = useExperiments();

  return (
    <div>
      <p className="mb-4 text-sm text-muted-foreground">Roll a feature out to a percentage of organizations — controlled, reversible, no deploy required.</p>

      <div className="space-y-4">
        {experiments.map(flag => (
          <div key={flag.id} className="rounded-2xl border border-border bg-card p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-foreground">{flag.label}</p>
                <p className="text-sm text-muted-foreground">{flag.description}</p>
              </div>
              <div className="flex overflow-hidden rounded-lg border border-border">
                {ROLLOUT_STEPS.map(step => (
                  <Button
                    key={step}
                    variant={(flag.rolloutPercent ?? 0) === step ? "primary" : "ghost"}
                    size="sm"
                    className={cn("rounded-none border-0")}
                    onClick={() => setRollout(flag, step)}
                  >
                    {step}%
                  </Button>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
