"use client";

import { ContentHeader } from "@/components/content/ContentSharedComponents";
import { GitBranch } from "lucide-react";

export default function WorkflowPage() {
  return (
    <div className="space-y-6 pb-8">
      <ContentHeader title="Workflow" description="Content creation and approval workflows" />
      <p className="text-sm text-slate-400">Content Workflow Engine — coming in next sprint.</p>
    </div>
  );
}