"use client";

import Image from "next/image";
import { File, FileSpreadsheet, FileText, X } from "lucide-react";
import type { CopilotAttachment } from "./types";

const KIND_ICON = { document: FileText, spreadsheet: FileSpreadsheet, report: FileText, file: File } as const;

export function CopilotAttachmentChip({ attachment, onRemove }: { attachment: CopilotAttachment; onRemove?: () => void }) {
  const Icon = attachment.kind === "image" ? null : KIND_ICON[attachment.kind];
  return (
    <div className="relative flex items-center gap-2 overflow-hidden rounded-xl border border-border bg-surface/50 p-1.5 pr-2">
      {attachment.kind === "image" ? (
        <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg">
          <Image src={attachment.dataUrl} alt={attachment.name} fill unoptimized className="object-cover" />
        </div>
      ) : (
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-accent/50 text-primary">{Icon && <Icon size={16} />}</div>
      )}
      <span className="max-w-32 truncate text-xs text-foreground">{attachment.name}</span>
      {onRemove && (
        <button onClick={onRemove} aria-label={`Remove ${attachment.name}`} className="ml-1 flex-shrink-0 rounded-full p-0.5 text-muted-foreground hover:text-destructive">
          <X size={12} />
        </button>
      )}
    </div>
  );
}
