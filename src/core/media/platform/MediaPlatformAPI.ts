/**
 * Calixo Platform - Media Platform API
 *
 * The facade `MediaGenerationEngine` never had — the existing Creative Composer page imports
 * the engine directly today. Content Studio calls this facade instead, from day one, keeping it
 * compliant with the "no direct engine imports" architecture rule this session established for
 * every other module.
 */
import { MediaGenerationEngine } from "../MediaGenerationEngine";
import type { MediaCapabilities, MediaRequest, MediaResponse } from "../types";

export class MediaPlatformAPI {
  generateImage(request: MediaRequest): Promise<MediaResponse> {
    return MediaGenerationEngine.generateImage(request);
  }

  createVariation(request: MediaRequest): Promise<MediaResponse> {
    return MediaGenerationEngine.createVariation(request);
  }

  getCapabilities(providerId: string): MediaCapabilities | undefined {
    return MediaGenerationEngine.getCapabilities(providerId);
  }

  listProviders(): string[] {
    return MediaGenerationEngine.listProviders();
  }
}

export const mediaPlatformAPI = new MediaPlatformAPI();
