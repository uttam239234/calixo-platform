"use client";

import { ContentHeader } from "@/components/content/ContentSharedComponents";
import { FileEdit } from "lucide-react";

export default function EditorPage() {
  return (
    <div className="space-y-6 pb-8">
      <ContentHeader title="Content Editor" description="Rich content editing experience">
        <FileEdit size={20} className="text-cyan-400" />
      </ContentHeader>
      <p className="text-sm text-slate-400">Content Editor — coming in next sprint.</p>
    </div>
  );
}