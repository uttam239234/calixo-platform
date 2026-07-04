/** Calixo Platform — Enterprise AI Media Layer Types */

// ============================================================================
// Media Types
// ============================================================================

export type MediaType = "image" | "video" | "voice" | "audio" | "animation";
export type ImageAction = "generate" | "edit" | "variation" | "remove-background" | "expand";
export type VideoAction = "generate" | "edit";
export type VoiceAction = "generate";
export type AudioAction = "generate";
export type MediaAction = ImageAction | VideoAction | VoiceAction | AudioAction;

export type OutputFormat = "png" | "jpeg" | "webp" | "avif" | "svg";
export type QualityLevel = "standard" | "hd" | "4k";
export type AspectRatio = "1:1" | "4:5" | "9:16" | "16:9" | "2:1" | "3:2";

// ============================================================================
// Provider Capabilities
// ============================================================================

export interface MediaCapabilities {
  providerId: string;
  displayName: string;
  supportedMediaTypes: MediaType[];
  supportedActions: MediaAction[];
  supportedSizes: { width: number; height: number }[];
  qualityLevels: QualityLevel[];
  stylePresets: string[];
  maxResolution: { width: number; height: number };
  supportsEditing: boolean;
  supportsVariations: boolean;
  supportsBackgroundRemoval: boolean;
  rateLimit: { requestsPerMinute: number; requestsPerDay: number };
  pricing: { model: string; costPerImage: number; currency: string };
}

// ============================================================================
// Media Request
// ============================================================================

export interface MediaRequest {
  id?: string;
  provider?: string;
  action: ImageAction;
  mediaType: "image";
  prompt: string;
  negativePrompt?: string;
  dimensions: { width: number; height: number };
  aspectRatio?: AspectRatio;
  quality: QualityLevel;
  style: string;
  outputFormat: OutputFormat;
  seed?: number;
  brand?: { name: string; colors: string[]; voice: string };
  platform?: string;
  creativeType?: string;
  campaign?: string;
  referenceImage?: string;
}

// ============================================================================
// Media Response
// ============================================================================

export interface MediaResponse {
  id: string;
  provider: string;
  model: string;
  mediaType: MediaType;
  prompt: string;
  optimizedPrompt: string;
  cost: number;
  currency: string;
  generationTimeMs: number;
  status: "completed" | "failed" | "processing";
  assetUrl: string;
  previewUrl: string;
  dimensions: { width: number; height: number };
  format: OutputFormat;
  metadata: Record<string, unknown>;
  createdAt: string;
}

// ============================================================================
// History Entry
// ============================================================================

export interface MediaHistoryEntry {
  id: string;
  timestamp: string;
  request: MediaRequest;
  response: MediaResponse;
  brand?: string;
  campaign?: string;
  workspace?: string;
  user?: string;
  creativeDocumentId?: string;
}

// ============================================================================
// Provider Interface
// ============================================================================

export interface MediaProvider {
  readonly id: string;
  readonly displayName: string;
  readonly capabilities: MediaCapabilities;

  generateImage(request: MediaRequest): Promise<MediaResponse>;
  editImage?(request: MediaRequest): Promise<MediaResponse>;
  createVariation?(request: MediaRequest): Promise<MediaResponse>;
  removeBackground?(request: MediaRequest): Promise<MediaResponse>;
  expandImage?(request: MediaRequest): Promise<MediaResponse>;
  generateVideo?(request: MediaRequest): Promise<MediaResponse>;
  editVideo?(request: MediaRequest): Promise<MediaResponse>;
  generateVoice?(request: MediaRequest): Promise<MediaResponse>;
  generateAudio?(request: MediaRequest): Promise<MediaResponse>;
}