/**
 * Calixo Platform — Media Generation Engine
 *
 * Central orchestrator for the Enterprise AI Media Layer.
 * All future modules call this engine — no direct provider dependency.
 *
 * Usage:
 *   const result = await MediaGenerationEngine.generateImage(request);
 */

import type { MediaRequest, MediaResponse } from "./types";
import { MediaProviderRegistry } from "./MediaProviderRegistry";
import { MediaPromptOptimizer } from "./MediaPromptOptimizer";
import { MediaCostEstimator } from "./MediaCostEstimator";
import { MediaHistoryService } from "./MediaHistoryService";
import { MockMediaProvider } from "./providers/MockMediaProvider";
import { OpenAIMediaProvider } from "./providers/OpenAIMediaProvider";

// Auto-register built-in providers
MediaProviderRegistry.register(MockMediaProvider);
MediaProviderRegistry.register(OpenAIMediaProvider);

export const MediaGenerationEngine = {
  /**
   * Generate an image using the specified or default provider.
   */
  async generateImage(request: MediaRequest): Promise<MediaResponse> {
    const providerId = request.provider || "mock-media";
    const provider = MediaProviderRegistry.get(providerId) ?? MediaProviderRegistry.getDefault();
    if (!provider) throw new Error(`No media provider found: ${providerId}`);

    // Optimize prompt
    const optimizedRequest = { ...request, prompt: MediaPromptOptimizer.optimize(request) };

    // Estimate cost
    const cost = MediaCostEstimator.estimate(provider.id, optimizedRequest);

    // Generate
    const response = await provider.generateImage(optimizedRequest);
    response.cost = cost.cost;
    response.optimizedPrompt = optimizedRequest.prompt;

    // Record history
    MediaHistoryService.record({
      request: optimizedRequest, response,
      brand: request.brand?.name, campaign: request.campaign, creativeDocumentId: undefined,
    });

    return response;
  },

  /**
   * Edit an existing image via provider.
   */
  async editImage(request: MediaRequest): Promise<MediaResponse> {
    const provider = resolveProvider(request.provider);
    if (!provider.editImage) throw new Error("Provider does not support image editing");
    return provider.editImage(request);
  },

  /**
   * Create a variation of an image.
   */
  async createVariation(request: MediaRequest): Promise<MediaResponse> {
    const provider = resolveProvider(request.provider);
    if (!provider.createVariation) throw new Error("Provider does not support variations");
    return provider.createVariation(request);
  },

  /**
   * Remove background from an image.
   */
  async removeBackground(request: MediaRequest): Promise<MediaResponse> {
    const provider = resolveProvider(request.provider);
    if (!provider.removeBackground) throw new Error("Provider does not support background removal");
    return provider.removeBackground(request);
  },

  /**
   * Get list of available provider IDs.
   */
  listProviders(): string[] { return MediaProviderRegistry.listIds(); },

  /**
   * Get capabilities for a provider.
   */
  getCapabilities(providerId: string) { return MediaProviderRegistry.get(providerId)?.capabilities; },
};

function resolveProvider(providerId?: string) {
  const provider = providerId ? MediaProviderRegistry.get(providerId) : MediaProviderRegistry.getDefault();
  if (!provider) throw new Error("No media provider available");
  return provider;
}