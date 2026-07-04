/** Calixo Platform — Mock Media Provider */
import type { MediaProvider, MediaRequest, MediaResponse, MediaCapabilities } from "../types";

const MOCK_CAPABILITIES: MediaCapabilities = {
  providerId: "mock-media", displayName: "Mock Media Provider",
  supportedMediaTypes: ["image"], supportedActions: ["generate", "edit", "variation", "remove-background", "expand"],
  supportedSizes: [{ width: 256, height: 256 }, { width: 512, height: 512 }, { width: 1024, height: 1024 }],
  qualityLevels: ["standard", "hd"], stylePresets: ["professional", "creative", "minimalist", "vibrant", "dark", "corporate"],
  maxResolution: { width: 1024, height: 1024 },
  supportsEditing: true, supportsVariations: true, supportsBackgroundRemoval: true,
  rateLimit: { requestsPerMinute: 60, requestsPerDay: 10000 },
  pricing: { model: "mock-v1", costPerImage: 0, currency: "USD" },
};

function mockResponse(request: MediaRequest): MediaResponse {
  const id = `mock-img-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  return {
    id, provider: "mock-media", model: "mock-v1", mediaType: "image",
    prompt: request.prompt, optimizedPrompt: request.prompt + " [optimized]",
    cost: 0, currency: "USD", generationTimeMs: Math.round(400 + Math.random() * 800),
    status: "completed",
    assetUrl: `https://picsum.photos/seed/${id}/${request.dimensions.width}/${request.dimensions.height}`,
    previewUrl: `https://picsum.photos/seed/${id}/400/300`,
    dimensions: request.dimensions, format: request.outputFormat,
    metadata: { provider: "mock", generated: true },
    createdAt: new Date().toISOString(),
  };
}

export const MockMediaProvider: MediaProvider = {
  id: "mock-media", displayName: "Mock Media Provider", capabilities: MOCK_CAPABILITIES,
  generateImage: async (req) => { await new Promise(r => setTimeout(r, 500 + Math.random() * 1000)); return mockResponse(req); },
  editImage: async (req) => { await new Promise(r => setTimeout(r, 300)); return mockResponse(req); },
  createVariation: async (req) => { await new Promise(r => setTimeout(r, 400)); return mockResponse(req); },
  removeBackground: async (req) => { await new Promise(r => setTimeout(r, 600)); return mockResponse(req); },
  expandImage: async (req) => { await new Promise(r => setTimeout(r, 500)); return mockResponse(req); },
};