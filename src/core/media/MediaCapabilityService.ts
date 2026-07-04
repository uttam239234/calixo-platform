/** Calixo Platform — Media Capability Service */
import type { MediaCapabilities } from "./types";

const CAPABILITIES: Record<string, MediaCapabilities> = {
  "mock-media": {
    providerId: "mock-media", displayName: "Mock Media Provider",
    supportedMediaTypes: ["image"], supportedActions: ["generate", "edit", "variation", "remove-background", "expand"],
    supportedSizes: [{ width: 256, height: 256 }, { width: 512, height: 512 }, { width: 1024, height: 1024 }, { width: 1792, height: 1024 }],
    qualityLevels: ["standard", "hd"],
    stylePresets: ["professional", "creative", "minimalist", "vibrant", "dark", "corporate"],
    maxResolution: { width: 1792, height: 1024 },
    supportsEditing: true, supportsVariations: true, supportsBackgroundRemoval: true,
    rateLimit: { requestsPerMinute: 60, requestsPerDay: 10000 },
    pricing: { model: "mock-v1", costPerImage: 0, currency: "USD" },
  },
  "openai-image": {
    providerId: "openai-image", displayName: "OpenAI DALL-E",
    supportedMediaTypes: ["image"], supportedActions: ["generate", "edit", "variation"],
    supportedSizes: [{ width: 256, height: 256 }, { width: 512, height: 512 }, { width: 1024, height: 1024 }, { width: 1792, height: 1024 }],
    qualityLevels: ["standard", "hd"],
    stylePresets: ["vivid", "natural"],
    maxResolution: { width: 1792, height: 1024 },
    supportsEditing: true, supportsVariations: true, supportsBackgroundRemoval: false,
    rateLimit: { requestsPerMinute: 10, requestsPerDay: 500 },
    pricing: { model: "dall-e-3", costPerImage: 0.04, currency: "USD" },
  },
};

export const MediaCapabilityService = {
  get(providerId: string): MediaCapabilities | undefined { return CAPABILITIES[providerId] ? { ...CAPABILITIES[providerId] } : undefined; },
  getAll(): MediaCapabilities[] { return Object.values(CAPABILITIES).map(c => ({ ...c })); },
  supportsAction(providerId: string, action: string): boolean { return CAPABILITIES[providerId]?.supportedActions.includes(action as never) ?? false; },
  supportsMediaType(providerId: string, type: string): boolean { return CAPABILITIES[providerId]?.supportedMediaTypes.includes(type as never) ?? false; },
};