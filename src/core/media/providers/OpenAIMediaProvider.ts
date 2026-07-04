/**
 * Calixo Platform — OpenAI Media Provider (Stub)
 *
 * Implements the MediaProvider interface for OpenAI DALL-E.
 * Currently uses mock responses. Replace with real OpenAI API calls.
 *
 * Future integration:
 * 1. Install openai SDK: npm install openai
 * 2. Set OPENAI_API_KEY environment variable
 * 3. Replace generateImage() body with:
 *    const openai = new OpenAI();
 *    const response = await openai.images.generate({ model: "dall-e-3", prompt, size, quality, n: 1 });
 *    return mapToMediaResponse(response);
 */

import type { MediaProvider, MediaRequest, MediaResponse, MediaCapabilities } from "../types";

const CAPABILITIES: MediaCapabilities = {
  providerId: "openai-image", displayName: "OpenAI DALL-E",
  supportedMediaTypes: ["image"], supportedActions: ["generate", "edit", "variation"],
  supportedSizes: [{ width: 256, height: 256 }, { width: 512, height: 512 }, { width: 1024, height: 1024 }, { width: 1792, height: 1024 }],
  qualityLevels: ["standard", "hd"],
  stylePresets: ["vivid", "natural"],
  maxResolution: { width: 1792, height: 1024 },
  supportsEditing: true, supportsVariations: true, supportsBackgroundRemoval: false,
  rateLimit: { requestsPerMinute: 10, requestsPerDay: 500 },
  pricing: { model: "dall-e-3", costPerImage: 0.04, currency: "USD" },
};

function mockResponse(request: MediaRequest): MediaResponse {
  const id = `openai-img-${Date.now()}`;
  const sizeCost: Record<string, number> = { "256x256": 0.016, "512x512": 0.018, "1024x1024": 0.04, "1792x1024": 0.08 };
  const sizeKey = `${request.dimensions.width}x${request.dimensions.height}`;
  return {
    id, provider: "openai-image", model: "dall-e-3", mediaType: "image",
    prompt: request.prompt, optimizedPrompt: request.prompt + " [dall-e optimized]",
    cost: sizeCost[sizeKey] ?? 0.04, currency: "USD",
    generationTimeMs: Math.round(3000 + Math.random() * 5000),
    status: "completed",
    assetUrl: `https://oaidalleapiprodscus.blob.core.windows.net/private/org-${id}/img-${id}.png`,
    previewUrl: `https://picsum.photos/seed/${id}/400/300`,
    dimensions: request.dimensions, format: request.outputFormat,
    metadata: { provider: "openai", model: "dall-e-3", revised_prompt: request.prompt },
    createdAt: new Date().toISOString(),
  };
}

export const OpenAIMediaProvider: MediaProvider = {
  id: "openai-image", displayName: "OpenAI DALL-E", capabilities: CAPABILITIES,
  generateImage: async (req) => { await new Promise(r => setTimeout(r, 2000)); return mockResponse(req); },
  editImage: async (req) => { await new Promise(r => setTimeout(r, 2000)); return mockResponse(req); },
  createVariation: async (req) => { await new Promise(r => setTimeout(r, 2000)); return mockResponse(req); },
};