/**
 * Calixo Platform - Registry of Registries
 *
 * Every platform/module registry (Organizations, Workspaces, Subscriptions,
 * Feature Flags, Users, Teams, Settings, Reports, Analytics dashboards,
 * Segments, the Module SDK's own `ModuleRegistry`, Connectors, ...) can
 * self-register here so the platform has ONE introspectable index instead
 * of each registry being independently discoverable only by whoever
 * happens to import it. This is what standardizes "every registry follows
 * one consistent pattern" (register/list/lookup/count) into something
 * verifiable at runtime, and what `PlatformHealthService` reads from.
 */

export interface RegisteredRegistry {
  name: string;
  kind: string;
  count(): number;
}

export class PlatformRegistry {
  private registries = new Map<string, RegisteredRegistry>();

  register(entry: RegisteredRegistry): void {
    this.registries.set(entry.name, entry);
  }

  get(name: string): RegisteredRegistry | undefined {
    return this.registries.get(name);
  }

  list(): RegisteredRegistry[] {
    return Array.from(this.registries.values());
  }

  snapshot(): Record<string, { kind: string; count: number }> {
    const snapshot: Record<string, { kind: string; count: number }> = {};
    for (const entry of this.registries.values()) {
      snapshot[entry.name] = { kind: entry.kind, count: entry.count() };
    }
    return snapshot;
  }

  count(): number {
    return this.registries.size;
  }
}

export const platformRegistry = new PlatformRegistry();
