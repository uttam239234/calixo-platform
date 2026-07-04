"use client";

import { ContentHeader, CalendarWidget, PublishingQueue } from "@/components/content/ContentSharedComponents";
import { scheduledPosts } from "@/lib/content-data";

export default function CalendarPage() {
  return (
    <div className="space-y-6 pb-8">
      <ContentHeader title="Content Calendar" description="Schedule and manage publishing dates" />
      <div className="grid gap-6 xl:grid-cols-2">
        <CalendarWidget posts={scheduledPosts} />
        <PublishingQueue posts={scheduledPosts} />
      </div>
    </div>
  );
}