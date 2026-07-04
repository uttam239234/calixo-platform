"use client";

import { ContentHeader, RecentContentTable } from "@/components/content/ContentSharedComponents";
import { contentItems } from "@/lib/content-data";

export default function LibraryPage() {
  return (
    <div className="space-y-6 pb-8">
      <ContentHeader title="Content Library" description={`${contentItems.length} content items`} />
      <RecentContentTable items={contentItems} maxItems={20} />
    </div>
  );
}