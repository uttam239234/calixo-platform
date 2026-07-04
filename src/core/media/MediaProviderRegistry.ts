/** Calixo Platform — Media Provider Registry */
import type { MediaProvider } from "./types";

const providers = new Map<string, MediaProvider>();

export const MediaProviderRegistry = {
  register(provider: MediaProvider): void {
    if (providers.has(provider.id)) throw new Error(`Provider "${provider.id}" already registered`);
    providers.set(provider.id, provider);
  },
  unregister(id: string): boolean { return providers.delete(id); },
  get(id: string): MediaProvider | undefined { return providers.get(id); },
  getDefault(): MediaProvider | undefined { return providers.get("mock-media") ?? providers.values().next().value; },
  getAll(): MediaProvider[] { return Array.from(providers.values()); },
  listIds(): string[] { return Array.from(providers.keys()); },
  clear(): void { providers.clear(); },
};