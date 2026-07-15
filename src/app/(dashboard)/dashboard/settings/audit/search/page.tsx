"use client";

import { Search } from "lucide-react";
import { ModuleHeader, ActivityTimeline } from "@/components/enterprise/module";
import { Input } from "@/components/ui/Input";
import { useSettingsContext } from "@/features/settings/SettingsProvider";
import { useAudit } from "@/features/settings/audit/useAudit";
import { toActivityItems } from "@/features/settings/audit/normalize";

export default function AuditSearchPage() {
  const { tenantContext } = useSettingsContext();
  const audit = useAudit(tenantContext.organizationId);

  return (
    <div className="space-y-6">
      <ModuleHeader title="Search" description="Find anything that happened — a person, an app, a plan, a topic." />

      <div className="relative max-w-xl">
        <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          inputSize="lg"
          placeholder="Search for a person, an app, a topic…"
          value={audit.search}
          onChange={e => audit.setSearch(e.target.value)}
          className="pl-10"
          autoFocus
        />
      </div>

      {audit.search.trim() ? (
        <ActivityTimeline
          activities={toActivityItems(audit.searchResults)}
          loading={audit.loading}
          maxItems={audit.searchResults.length || 1}
          title={`${audit.searchResults.length} result${audit.searchResults.length === 1 ? "" : "s"}`}
        />
      ) : (
        <p className="text-sm text-muted-foreground">Start typing to see results instantly — no need to press Enter.</p>
      )}
    </div>
  );
}
