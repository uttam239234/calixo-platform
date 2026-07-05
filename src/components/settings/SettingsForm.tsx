"use client";

import type { SettingDefinition, SettingsValidationResult, ValidationRule } from "@/core/settings";
import { SettingCard } from "./SettingCard";
import { SettingsEmptyState } from "./SettingsEmptyState";

interface SettingsFormProps {
  settings: SettingDefinition[];
  valueFor: (key: string) => unknown;
  isDirty: (key: string) => boolean;
  selectedSettingKey: string | null;
  onSelect: (key: string) => void;
  onChange: (key: string, value: unknown) => void;
  onReset: (key: string) => void;
  validate: (value: unknown, rules: ValidationRule[]) => SettingsValidationResult;
}

export function SettingsForm({ settings, valueFor, isDirty, selectedSettingKey, onSelect, onChange, onReset, validate }: SettingsFormProps) {
  const visible = settings.filter(s => !s.hidden);

  if (visible.length === 0) {
    return <SettingsEmptyState title="No settings here" description="This group or category has no visible settings yet." />;
  }

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      {visible.map(setting => {
        const value = valueFor(setting.key);
        return (
          <SettingCard
            key={setting.id}
            setting={setting}
            value={value}
            isDirty={isDirty(setting.key)}
            isSelected={setting.key === selectedSettingKey}
            validation={validate(value, setting.validation)}
            onChange={next => onChange(setting.key, next)}
            onSelect={() => onSelect(setting.key)}
            onReset={() => onReset(setting.key)}
          />
        );
      })}
    </div>
  );
}
