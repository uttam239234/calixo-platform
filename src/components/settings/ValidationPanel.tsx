"use client";

import { useMemo } from "react";
import { CheckCircle2, ShieldCheck, XCircle } from "lucide-react";
import type { SettingDefinition, ValidationRule } from "@/core/settings";

interface ValidationPanelProps {
  setting: SettingDefinition | null;
  value: unknown;
  validate: (value: unknown, rules: ValidationRule[]) => { valid: boolean; issues: string[] };
}

export function ValidationPanel({ setting, value, validate }: ValidationPanelProps) {
  const perRule = useMemo(() => {
    if (!setting) return [];
    return setting.validation.map(rule => ({ rule, result: validate(value, [rule]) }));
  }, [setting, value, validate]);

  if (!setting) return <p className="text-xs text-muted-foreground">Select a setting to see live validation.</p>;

  if (setting.validation.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-6 text-center">
        <ShieldCheck size={18} className="text-muted-foreground" />
        <p className="text-xs text-muted-foreground">This setting has no validation rules defined.</p>
      </div>
    );
  }

  const passed = perRule.filter(p => p.result.valid);
  const failed = perRule.filter(p => !p.result.valid);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-xl bg-success/10 px-3 py-2 text-center">
          <p className="text-lg font-semibold text-success">{passed.length}</p>
          <p className="text-[10px] uppercase tracking-wide text-success/80">Passed</p>
        </div>
        <div className="rounded-xl bg-destructive/10 px-3 py-2 text-center">
          <p className="text-lg font-semibold text-destructive">{failed.length}</p>
          <p className="text-[10px] uppercase tracking-wide text-destructive/80">Failed</p>
        </div>
      </div>

      <div className="space-y-1.5">
        {perRule.map(({ rule, result }, i) => (
          <div key={i} className="flex items-start gap-2 rounded-xl bg-accent/30 px-2.5 py-2">
            {result.valid ? <CheckCircle2 size={13} className="mt-0.5 flex-shrink-0 text-success" /> : <XCircle size={13} className="mt-0.5 flex-shrink-0 text-destructive" />}
            <div className="min-w-0">
              <p className="text-xs font-medium capitalize text-foreground">{rule.type}</p>
              {!result.valid && result.issues[0] && <p className="text-[11px] text-destructive">{result.issues[0]}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
