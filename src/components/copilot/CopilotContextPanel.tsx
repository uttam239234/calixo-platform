"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import type { WorkspaceContext } from "@/core/copilot";

type EditableField = "workspaceId" | "brand" | "campaign" | "audience" | "platform" | "language" | "tone" | "region";

interface CopilotContextPanelProps {
  context: WorkspaceContext;
  saving: boolean;
  onSave: (patch: Partial<WorkspaceContext>) => void;
}

const FIELDS: { key: EditableField; label: string }[] = [
  { key: "workspaceId", label: "Workspace" },
  { key: "brand", label: "Brand" },
  { key: "campaign", label: "Campaign" },
  { key: "audience", label: "Audience" },
  { key: "platform", label: "Platform" },
  { key: "language", label: "Language" },
  { key: "tone", label: "Tone" },
  { key: "region", label: "Region" },
];

export function CopilotContextPanel({ context, saving, onSave }: CopilotContextPanelProps) {
  const [form, setForm] = useState<Record<EditableField, string>>({
    workspaceId: "",
    brand: "",
    campaign: "",
    audience: "",
    platform: "",
    language: "",
    tone: "",
    region: "",
  });

  useEffect(() => {
    (async () => {
      setForm({
        workspaceId: context.workspaceId ?? "",
        brand: context.brand ?? "",
        campaign: context.campaign ?? "",
        audience: context.audience ?? "",
        platform: context.platform ?? "",
        language: context.language ?? "",
        tone: context.tone ?? "",
        region: context.region ?? "",
      });
    })();
  }, [context]);

  const dirty = FIELDS.some(f => form[f.key] !== (context[f.key] ?? ""));

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const patch: Partial<WorkspaceContext> = {};
    for (const f of FIELDS) {
      patch[f.key] = form[f.key].trim() || undefined;
    }
    onSave(patch);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2.5">
      {FIELDS.map(f => (
        <div key={f.key}>
          <label className="mb-1 block text-[10px] font-medium uppercase tracking-wide text-muted-foreground">{f.label}</label>
          <Input
            inputSize="sm"
            value={form[f.key]}
            onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
            placeholder={`Set ${f.label.toLowerCase()}...`}
          />
        </div>
      ))}
      <Button type="submit" size="sm" disabled={!dirty || saving} loading={saving} className="w-full gap-1.5">
        <Save size={13} /> Save Context
      </Button>
    </form>
  );
}
