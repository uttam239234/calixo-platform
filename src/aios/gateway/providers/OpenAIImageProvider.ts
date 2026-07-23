import "server-only";

/**
 * Calixo Platform - OpenAI Image Provider (real)
 *
 * Replaces `core/media/providers/OpenAIMediaProvider.ts`'s mock (a fake
 * blob URL + a picsum.photos placeholder). Real fetch to OpenAI's images
 * endpoint, same `openai_api_key` the chat/embeddings providers already use.
 *
 * Model choice was corrected via live testing, not assumed: DALL-E 3 was
 * the original plan (no org-verification step needed on a standard key),
 * but a real call against this environment's real key returned "The model
 * 'dall-e-3' does not exist" — this account's API surface only has
 * `gpt-image-1`. Switched to that after the real error, not before.
 * `gpt-image-1` has no `response_format` parameter at all (an earlier
 * attempt to force `b64_json` was itself rejected — "Unknown parameter:
 * 'response_format'"): the response shape (`b64_json` or a temporary `url`)
 * is read defensively, downloading and re-encoding a `url` response to
 * base64 if that's what comes back, since the caller always persists bytes
 * to disk via `imageStore.ts` rather than trusting a temporary URL.
 *
 * `gpt-image-1`'s one real constraint reused from the original DALL-E 3
 * plan still holds: no batched `n>1` variation used here — Creative Design
 * Studio's "4 variations" feature calls this 4 times with 4 different
 * layout-directive prompt suffixes instead.
 *
 * Deliberately never re-exported from `@/aios`'s barrel `index.ts` — deep
 * import only, same rule as every other real provider in this directory.
 */

import { getProviderKey } from "./getProviderKey";
import { appLogger } from "@/logging";

const CATALOG_ID = "openai_api_key";
const MODULE = "OpenAIImageProvider";
const ENDPOINT = "https://api.openai.com/v1/images/generations";
const REQUEST_TIMEOUT_MS = 90000;

/** `gpt-image-1`'s real supported sizes — the nearest match for a requested aspect ratio is picked by the caller, never an arbitrary requested size. */
export const OPENAI_IMAGE_SIZES = ["1024x1024", "1536x1024", "1024x1536"] as const;
export type OpenAIImageSize = (typeof OPENAI_IMAGE_SIZES)[number];

export function nearestDalle3Size(width: number, height: number): OpenAIImageSize {
  const ratio = width / height;
  if (ratio > 1.3) return "1536x1024";
  if (ratio < 0.77) return "1024x1536";
  return "1024x1024";
}

export interface OpenAIImageGenerationResult {
  base64: string;
  revisedPrompt?: string;
}

/** Deep-clones the raw OpenAI response for logging, replacing any `b64_json` payload (can be several MB of base64 text) with its length — printing a multi-megabyte string to the console/log aggregator on every single generation is not "logging the raw response," it's a real operational hazard. Every other field (id, model, revised_prompt, usage, etc.) is left completely untouched. */
function loggableResponse(data: unknown): unknown {
  if (!data || typeof data !== "object") return data;
  const clone: Record<string, unknown> = JSON.parse(JSON.stringify(data));
  const images = clone.data;
  if (Array.isArray(images)) {
    clone.data = images.map((img: Record<string, unknown>) => {
      if (typeof img?.b64_json === "string") {
        return { ...img, b64_json: `[base64 omitted — ${(img.b64_json as string).length} chars]` };
      }
      return img;
    });
  }
  return clone;
}

export async function generateOpenAIImage(prompt: string, size: OpenAIImageSize, quality: "standard" | "hd" = "standard"): Promise<OpenAIImageGenerationResult> {
  const apiKey = await getProviderKey(CATALOG_ID);
  if (!apiKey) throw new Error("OpenAI is not configured — add a real API key in Platform Admin → Secrets.");

  const requestBody = { model: "gpt-image-1", prompt: prompt.slice(0, 4000), n: 1, size, quality: quality === "hd" ? "high" : "medium" };
  appLogger.info(MODULE, "Requesting real OpenAI image generation", {
    endpoint: ENDPOINT,
    provider: "openai",
    model: requestBody.model,
    size,
    quality: requestBody.quality,
    promptLength: prompt.length,
  });

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const startedAt = Date.now();

  try {
    let response: Response;
    try {
      response = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        throw new Error(`Image generation timed out after ${REQUEST_TIMEOUT_MS / 1000} seconds. Try again.`);
      }
      throw new Error("Could not reach OpenAI's image generation endpoint — the network may be unavailable.");
    }

    const latencyMs = Date.now() - startedAt;
    const requestId = response.headers.get("x-request-id") ?? undefined;

    if (!response.ok) {
      const errBody = await response.json().catch(() => ({}));
      const message = errBody?.error?.message || `OpenAI image generation returned HTTP ${response.status}.`;
      appLogger.error(MODULE, "OpenAI image generation failed", new Error(message), { requestId, latencyMs, httpStatus: response.status, rawResponse: loggableResponse(errBody) });
      throw new Error(message);
    }

    const data = await response.json();
    // Per the incident brief: print the RAW OpenAI response, not a summary — with only the
    // multi-megabyte base64 payload itself elided (see `loggableResponse`'s own doc comment).
    appLogger.info(MODULE, "RAW OpenAI Images API response", { requestId, latencyMs, rawResponse: loggableResponse(data) });

    const image = data.data?.[0];
    if (!image) throw new Error("OpenAI image generation returned no image data.");

    let base64: string;
    if (image.b64_json) {
      base64 = image.b64_json;
    } else if (image.url) {
      const imageResponse = await fetch(image.url, { signal: controller.signal });
      if (!imageResponse.ok) throw new Error(`Failed to download the generated image (HTTP ${imageResponse.status}).`);
      const arrayBuffer = await imageResponse.arrayBuffer();
      base64 = Buffer.from(arrayBuffer).toString("base64");
    } else {
      throw new Error("OpenAI image generation returned neither a URL nor base64 data.");
    }

    appLogger.info(MODULE, "Real image received and decoded", { requestId, latencyMs, base64Length: base64.length, revisedPrompt: image.revised_prompt });
    return { base64, revisedPrompt: image.revised_prompt };
  } finally {
    clearTimeout(timeout);
  }
}
