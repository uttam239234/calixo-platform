"use client";

import { useState, type ReactNode } from "react";
import { ChevronDown, Clock3, FlaskConical, LayoutGrid, Sparkles, Star, Tags } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SettingDefinition, SettingsGroupDefinition, SettingsGroupId, SettingsSearchResult } from "@/core/settings";
import { SettingsSearch } from "./SettingsSearch";
import { SettingsGroupBrowser } from "./SettingsGroupBrowser";
import type { SettingsHistoryRecordView } from "./types";

interface SettingsSidebarProps {
  groups: SettingsGroupDefinition[];
  currentGroupId: SettingsGroupId | null;
  countsByGroup: Partial<Record<SettingsGroupId, number>>;
  onSelectGroup: (id: SettingsGroupId) => void;
  categories: string[];
  onSelectCategory: (category: string) => void;
  favoriteSettings: SettingDefinition[];
  recentlyChanged: SettingsHistoryRecordView[];
  flaggedSettings: SettingDefinition[];
  experimentalSettings: SettingDefinition[];
  onSelectSetting: (key: string) => void;
  searchQuery: string;
  searchResults: SettingsSearchResult[];
  onSearch: (query: string) => void;
  onClearSearch: () => void;
}

function Section({ title, icon, defaultOpen = false, children }: { title: string; icon: ReactNode; defaultOpen?: boolean; children: ReactNode }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-border/50 pb-2 last:border-0">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="flex w-full items-center justify-between gap-2 rounded-xl px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground hover:bg-accent"
      >
        <span className="flex items-center gap-1.5">
          {icon}
          {title}
        </span>
        <ChevronDown size={12} className={cn("transition-transform", open && "rotate-180")} />
      </button>
      {open && <div className="mt-1 space-y-1 px-0.5">{children}</div>}
    </div>
  );
}

function SettingLink({ setting, onSelect, meta }: { setting: SettingDefinition; onSelect: (key: string) => void; meta?: string }) {
  return (
    <button type="button" onClick={() => onSelect(setting.key)} className="flex w-full flex-col items-start rounded-xl px-2.5 py-2 text-left transition-colors hover:bg-accent">
      <span className="truncate text-xs font-medium text-foreground">{setting.label}</span>
      <span className="text-[10px] text-muted-foreground">{meta ?? `${setting.group} · ${setting.category}`}</span>
    </button>
  );
}

export function SettingsSidebar({
  groups,
  currentGroupId,
  countsByGroup,
  onSelectGroup,
  categories,
  onSelectCategory,
  favoriteSettings,
  recentlyChanged,
  flaggedSettings,
  experimentalSettings,
  onSelectSetting,
  searchQuery,
  searchResults,
  onSearch,
  onClearSearch,
}: SettingsSidebarProps) {
  return (
    <aside className="flex h-full w-[280px] flex-shrink-0 flex-col rounded-3xl border border-border bg-card">
      <div className="scrollbar-thin flex-1 space-y-1 overflow-y-auto p-3">
        <SettingsSearch query={searchQuery} results={searchResults} onSearch={onSearch} onClear={onClearSearch} onSelectResult={onSelectSetting} />

        {!searchQuery && (
          <>
          <Section title="Groups" icon={<LayoutGrid size={11} />} defaultOpen>
            <SettingsGroupBrowser groups={groups} currentGroupId={currentGroupId} countsByGroup={countsByGroup} onSelectGroup={onSelectGroup} />
          </Section>

          <Section title={`Categories (${categories.length})`} icon={<Tags size={11} />}>
            <div className="flex flex-wrap gap-1 px-1">
              {categories.map(category => (
                <button
                  key={category}
                  type="button"
                  onClick={() => onSelectCategory(category)}
                  className="rounded-lg border border-border px-2 py-1 text-[10px] text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                >
                  {category}
                </button>
              ))}
            </div>
          </Section>

          <Section title={`Favorites (${favoriteSettings.length})`} icon={<Star size={11} />}>
            {favoriteSettings.length === 0 ? (
              <p className="px-1 py-2 text-xs text-muted-foreground">No favorites yet</p>
            ) : (
              favoriteSettings.map(s => <SettingLink key={s.id} setting={s} onSelect={onSelectSetting} />)
            )}
          </Section>

          <Section title="Recently Changed" icon={<Clock3 size={11} />}>
            {recentlyChanged.length === 0 ? (
              <p className="px-1 py-2 text-xs text-muted-foreground">No changes yet</p>
            ) : (
              recentlyChanged.map(record => (
                <button
                  key={record.id}
                  type="button"
                  onClick={() => onSelectSetting(record.key)}
                  className="flex w-full flex-col items-start rounded-xl px-2.5 py-2 text-left transition-colors hover:bg-accent"
                >
                  <span className="truncate text-xs font-medium text-foreground">{record.key}</span>
                  <span className="text-[10px] text-muted-foreground capitalize">
                    {record.action} · {new Date(record.timestamp).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </button>
              ))
            )}
          </Section>

          <Section title={`Feature Flags (${flaggedSettings.length})`} icon={<Sparkles size={11} />}>
            {flaggedSettings.length === 0 ? (
              <p className="px-1 py-2 text-xs text-muted-foreground">None registered</p>
            ) : (
              flaggedSettings.slice(0, 15).map(s => <SettingLink key={s.id} setting={s} onSelect={onSelectSetting} meta={s.featureFlag} />)
            )}
          </Section>

          <Section title={`Experimental (${experimentalSettings.length})`} icon={<FlaskConical size={11} />}>
            {experimentalSettings.length === 0 ? (
              <p className="px-1 py-2 text-xs text-muted-foreground">None registered</p>
            ) : (
              experimentalSettings.slice(0, 15).map(s => <SettingLink key={s.id} setting={s} onSelect={onSelectSetting} />)
            )}
          </Section>
          </>
        )}
      </div>
    </aside>
  );
}
