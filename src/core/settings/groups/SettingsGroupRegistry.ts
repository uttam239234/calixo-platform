/**
 * Calixo Platform - Settings Group Registry
 *
 * The 16 top-level settings groups (Platform, Workspace, User, Security,
 * AI, Brand, Content, Reports, Workflow, Media, Integrations, Billing,
 * Notifications, Developer, Appearance, Advanced) are a fixed taxonomy,
 * but the registry itself never hardcodes them — they're registered via
 * registerDefaultGroups() like any other foundation default.
 */

import { appLogger } from "@/logging";
import type { SettingsGroupDefinition, SettingsGroupId } from "../types";

export class SettingsGroupRegistry {
  private groups: Map<SettingsGroupId, SettingsGroupDefinition> = new Map();

  register(group: SettingsGroupDefinition): void {
    if (this.groups.has(group.id)) {
      appLogger.warn("Settings.SettingsGroupRegistry", `Group ${group.id} already registered`);
      return;
    }
    this.groups.set(group.id, group);
    appLogger.info("Settings.SettingsGroupRegistry", `Group registered: ${group.id}`);
  }

  registerMany(groups: SettingsGroupDefinition[]): void {
    for (const group of groups) this.register(group);
  }

  unregister(id: SettingsGroupId): void {
    this.groups.delete(id);
  }

  lookup(id: SettingsGroupId): SettingsGroupDefinition | undefined {
    return this.groups.get(id);
  }

  list(): SettingsGroupDefinition[] {
    return this.order();
  }

  discover(query: string): SettingsGroupDefinition[] {
    const q = query.toLowerCase();
    return this.list().filter(g => g.label.toLowerCase().includes(q) || g.description.toLowerCase().includes(q));
  }

  /** Returns every registered group sorted by its declared display order. */
  order(): SettingsGroupDefinition[] {
    return Array.from(this.groups.values()).sort((a, b) => a.order - b.order);
  }

  count(): number {
    return this.groups.size;
  }
}

export const settingsGroupRegistry = new SettingsGroupRegistry();
