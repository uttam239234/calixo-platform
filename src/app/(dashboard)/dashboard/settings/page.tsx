"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSettings } from "@/hooks/useSettings";
import { useSettingGroups } from "@/hooks/useSettingGroups";
import { useSettingsSearch } from "@/hooks/useSettingsSearch";
import { useSettingsValidation } from "@/hooks/useSettingsValidation";
import { useFeatureFlags } from "@/hooks/useFeatureFlags";
import { useSettingsHistory } from "@/hooks/useSettingsHistory";
import {
  SettingsSidebar,
  SettingsHeader,
  SettingsCategoryTabs,
  SettingsForm,
  SettingsFooter,
  SettingsPropertiesPanel,
  ValidationPanel,
  HistoryPanel,
  DependencyPanel,
  FeatureFlagsPanel,
  RestartPanel,
  SettingsEmptyState,
} from "@/components/settings";
import type { SettingsRightPanelTab } from "@/components/settings";
import { settingsRegistry, initializeSettingsFoundation, seedSettingsPlatformMockData, registerSettingsSkills } from "@/core/settings";
import type { SettingsGroupId } from "@/core/settings";

// Bootstraps the Settings platform with realistic demo data once per
// browser session (idempotent — guarded by the registry's own count).
if (settingsRegistry.count() === 0) {
  initializeSettingsFoundation();
  seedSettingsPlatformMockData();
}
registerSettingsSkills();

const RIGHT_TABS: { id: SettingsRightPanelTab; label: string }[] = [
  { id: "properties", label: "Properties" },
  { id: "validation", label: "Validation" },
  { id: "history", label: "History" },
  { id: "dependencies", label: "Dependencies" },
  { id: "restart", label: "Restart" },
  { id: "flags", label: "Flags" },
  { id: "metadata", label: "Metadata" },
];

export default function SettingsCenterPage() {
  const settings = useSettings();
  const groups = useSettingGroups();
  const search = useSettingsSearch();
  const validation = useSettingsValidation();
  const featureFlags = useFeatureFlags();
  const history = useSettingsHistory();

  const [rightTab, setRightTab] = useState<SettingsRightPanelTab>("properties");

  const { currentGroup, setCurrentGroup, setCurrentCategory, setSelectedSettingKey } = settings;

  useEffect(() => {
    (async () => {
      if (!currentGroup && groups.groups.length > 0) {
        setCurrentGroup(groups.groups[0].id);
      }
    })();
  }, [currentGroup, groups.groups, setCurrentGroup]);

  const currentGroupDef = currentGroup ? groups.lookup(currentGroup) ?? null : null;

  const groupSettings = useMemo(
    () => (currentGroup ? settings.settings.filter(s => s.group === currentGroup) : []),
    [settings.settings, currentGroup]
  );

  const filteredSettings = useMemo(
    () => (settings.currentCategory ? groupSettings.filter(s => s.category === settings.currentCategory) : groupSettings),
    [groupSettings, settings.currentCategory]
  );

  const allCategories = useMemo(() => Object.keys(settings.groupByCategory()).sort(), [settings]);

  const countsByGroup = useMemo(() => {
    const counts: Partial<Record<SettingsGroupId, number>> = {};
    for (const s of settings.settings) counts[s.group] = (counts[s.group] ?? 0) + 1;
    return counts;
  }, [settings.settings]);

  const recentlyChanged = useMemo(() => {
    const all = [...history.getHistory()].reverse();
    const seen = new Set<string>();
    const deduped = [];
    for (const record of all) {
      if (seen.has(record.key)) continue;
      seen.add(record.key);
      deduped.push(record);
      if (deduped.length >= 10) break;
    }
    return deduped;
  }, [history]);

  const handleSelectGroup = useCallback(
    (id: SettingsGroupId) => {
      setCurrentGroup(id);
      setCurrentCategory(null);
      search.clear();
    },
    [setCurrentGroup, setCurrentCategory, search]
  );

  const handleSelectCategory = useCallback(
    (category: string) => {
      const owner = settings.settings.find(s => s.category === category);
      if (owner) setCurrentGroup(owner.group);
      setCurrentCategory(category);
      search.clear();
    },
    [settings.settings, setCurrentGroup, setCurrentCategory, search]
  );

  const handleSelectSetting = useCallback(
    (key: string) => {
      const target = settings.settings.find(s => s.key === key);
      if (target) {
        setCurrentGroup(target.group);
        setCurrentCategory(target.category);
      }
      setSelectedSettingKey(key);
      search.clear();
    },
    [settings.settings, setCurrentGroup, setCurrentCategory, setSelectedSettingKey, search]
  );

  const handleSave = useCallback(() => settings.saveAll(), [settings]);
  const handleResetGroup = useCallback(() => {
    if (currentGroup) settings.resetGroup(currentGroup);
  }, [currentGroup, settings]);
  const handleResetAll = useCallback(() => settings.resetAll(), [settings]);

  return (
    <div className="flex h-[calc(100vh-7rem)] gap-4">
      <SettingsSidebar
        groups={groups.groups}
        currentGroupId={currentGroup}
        countsByGroup={countsByGroup}
        onSelectGroup={handleSelectGroup}
        categories={allCategories}
        onSelectCategory={handleSelectCategory}
        favoriteSettings={settings.favoriteSettings}
        recentlyChanged={recentlyChanged}
        flaggedSettings={featureFlags.flaggedSettings}
        experimentalSettings={settings.experimentalSettings}
        onSelectSetting={handleSelectSetting}
        searchQuery={search.query}
        searchResults={search.results}
        onSearch={search.searchKeyword}
        onClearSearch={search.clear}
      />

      <div className="flex min-w-0 flex-1 flex-col rounded-3xl border border-border bg-card">
        <SettingsHeader
          group={currentGroupDef}
          category={settings.currentCategory}
          settingCount={filteredSettings.length}
          changedCount={settings.changedCount}
          onSave={handleSave}
          onResetGroup={handleResetGroup}
          onResetAll={handleResetAll}
        />

        <div className="scrollbar-thin flex-1 overflow-y-auto p-5">
          {!currentGroupDef ? (
            <SettingsEmptyState />
          ) : (
            <div className="space-y-4">
              {currentGroupDef.description && <p className="text-sm text-muted-foreground">{currentGroupDef.description}</p>}
              <SettingsCategoryTabs settings={groupSettings} currentCategory={settings.currentCategory} onSelectCategory={setCurrentCategory} />
              <SettingsForm
                settings={filteredSettings}
                valueFor={settings.valueFor}
                isDirty={key => settings.dirtyKeys.includes(key)}
                selectedSettingKey={settings.selectedSettingKey}
                onSelect={handleSelectSetting}
                onChange={settings.editValue}
                onReset={settings.resetKey}
                validate={validation.validate}
              />
            </div>
          )}
        </div>

        <SettingsFooter changedCount={settings.changedCount} onSave={handleSave} onDiscard={settings.discardAll} />
      </div>

      <div className="w-[300px] flex-shrink-0 rounded-3xl border border-border bg-card">
        <div className="scrollbar-thin flex flex-wrap border-b border-border/60 px-2 pt-2">
          {RIGHT_TABS.map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setRightTab(tab.id)}
              className={
                rightTab === tab.id
                  ? "rounded-t-xl border-b-2 border-primary px-2.5 py-2 text-[11px] font-semibold text-primary"
                  : "rounded-t-xl px-2.5 py-2 text-[11px] font-medium text-muted-foreground hover:text-foreground"
              }
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="scrollbar-thin h-[calc(100%-42px)] overflow-y-auto p-4">
          {rightTab === "properties" && <SettingsPropertiesPanel setting={settings.selectedSetting} section="properties" />}
          {rightTab === "metadata" && <SettingsPropertiesPanel setting={settings.selectedSetting} section="metadata" />}
          {rightTab === "validation" && (
            <ValidationPanel setting={settings.selectedSetting} value={settings.selectedSetting ? settings.valueFor(settings.selectedSetting.key) : undefined} validate={validation.validate} />
          )}
          {rightTab === "history" && <HistoryPanel records={settings.selectedSetting ? history.getHistory(settings.selectedSetting.key) : []} />}
          {rightTab === "dependencies" && <DependencyPanel setting={settings.selectedSetting} />}
          {rightTab === "restart" && <RestartPanel settings={settings.settings} />}
          {rightTab === "flags" && <FeatureFlagsPanel flaggedSettings={featureFlags.flaggedSettings} isEnabled={featureFlags.isEnabled} onToggle={featureFlags.toggle} />}
        </div>
      </div>
    </div>
  );
}
