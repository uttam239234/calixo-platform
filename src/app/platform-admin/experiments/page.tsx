"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useExperiments } from "@/features/platform-admin/experiments/useExperiments";
import type { FeatureFlagDefinition } from "@/core/platform/featureFlags";

const ROLLOUT_STEPS = [0, 25, 50, 100];

export default function ExperimentsPage() {
  const { experiments, setRollout } = useExperiments();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function handleSetRollout(flag: FeatureFlagDefinition, step: number) {
    setBusyId(flag.id);
    setErrors(prev => ({ ...prev, [flag.id]: "" }));
    const result = await setRollout(flag, step);
    setBusyId(null);
    if (result.error) setErrors(prev => ({ ...prev, [flag.id]: result.error! }));
  }

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
                    disabled={busyId === flag.id}
                    onClick={() => handleSetRollout(flag, step)}
                  >
                    {step}%
                  </Button>
                ))}
              </div>
            </div>
            {errors[flag.id] && <p className="mt-2 text-sm text-destructive">{errors[flag.id]}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
