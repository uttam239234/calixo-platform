/**
 * Calixo Platform — OpenAI Media Provider
 *
 * Implements the MediaProvider interface for OpenAI's image model (gpt-image-1). This file is
 * reachable from client bundles (via `ContentOrchestrationEngine` →
 * `MediaPlatformAPI` → `MediaGenerationEngine`, loaded by the Content
 * Studio client provider) so it must never statically import `@/aios`
 * (server-only, holds the real vendor API key) — the same rule
 * `GenerationEngine.setRealGenerator()` follows for text generation.
 *
 * Real generation is injected at runtime via `setRealImageGenerator()`,
 * called once per request from `src/features/content/actions.ts` (a
 * `"use server"` file). Without an injected generator (e.g. before the
 * Server Action layer runs, or in a context with no real provider
 * configured), `generateImage()` falls back to a deterministic mock.
 */

import type { MediaProvider, MediaRequest, MediaResponse, MediaCapabilities } from "../types";

const CAPABILITIES: MediaCapabilities = {
  providerId: "openai-image", displayName: "OpenAI (gpt-image-1)",
  supportedMediaTypes: ["image"], supportedActions: ["generate", "edit", "variation"],
  supportedSizes: [{ width: 1024, height: 1024 }, { width: 1536, height: 1024 }, { width: 1024, height: 1536 }],
  qualityLevels: ["standard", "hd"],
  stylePresets: ["vivid", "natural"],
  maxResolution: { width: 1536, height: 1024 },
  supportsEditing: true, supportsVariations: true, supportsBackgroundRemoval: false,
  rateLimit: { requestsPerMinute: 10, requestsPerDay: 500 },
  pricing: { model: "gpt-image-1", costPerImage: 0.04, currency: "USD" },
};

function mockResponse(request: MediaRequest): MediaResponse {
  const id = `openai-img-${Date.now()}`;
  const sizeCost: Record<string, number> = { "1024x1024": 0.04, "1536x1024": 0.08, "1024x1536": 0.08 };
  const sizeKey = `${request.dimensions.width}x${request.dimensions.height}`;
  return {
    id, provider: "openai-image", model: "gpt-image-1", mediaType: "image",
    prompt: request.prompt, optimizedPrompt: request.prompt + " [gpt-image-1 optimized]",
    cost: sizeCost[sizeKey] ?? 0.04, currency: "USD",
    generationTimeMs: Math.round(3000 + Math.random() * 5000),
    status: "completed",
    assetUrl: `https://picsum.photos/seed/${id}/1024/1024`,
    previewUrl: `https://picsum.photos/seed/${id}/400/300`,
    dimensions: request.dimensions, format: request.outputFormat,
    metadata: { provider: "openai", model: "gpt-image-1", revised_prompt: request.prompt, real: false },
    createdAt: new Date().toISOString(),
  };
}

type RealImageGenerator = (request: MediaRequest) => Promise<{ assetUrl: string; revisedPrompt?: string; cost: number }>;
let realGenerator: RealImageGenerator | undefined;

export function setRealImageGenerator(fn: RealImageGenerator | undefined): void {
  realGenerator = fn;
}

async function generate(request: MediaRequest): Promise<MediaResponse> {
  if (!realGenerator) {
    await new Promise(r => setTimeout(r, 2000));
    return mockResponse(request);
  }

  const startedAt = Date.now();
  const { assetUrl, revisedPrompt, cost } = await realGenerator(request);
  return {
    id: `openai-img-${Date.now()}`,
    provider: "openai-image", model: "gpt-image-1", mediaType: "image",
    prompt: request.prompt, optimizedPrompt: revisedPrompt ?? request.prompt,
    cost, currency: "USD",
    generationTimeMs: Date.now() - startedAt,
    status: "completed",
    assetUrl, previewUrl: assetUrl,
    dimensions: request.dimensions, format: request.outputFormat,
    metadata: { provider: "openai", model: "gpt-image-1", revised_prompt: revisedPrompt, real: true },
    createdAt: new Date().toISOString(),
  };
}

export const OpenAIMediaProvider: MediaProvider = {
  id: "openai-image", displayName: "OpenAI (gpt-image-1)", capabilities: CAPABILITIES,
  generateImage: generate,
  editImage: generate,
  createVariation: generate,
};
