import "server-only";

/**
 * Calixo Platform - Generated Image Store
 *
 * Real OpenAI image generation (`OpenAIImageProvider.ts`) is requested with
 * `response_format: "b64_json"` specifically because the default `url`
 * response expires in ~1 hour — useless for "My Creations" / Assets /
 * campaign history, which need the image to still resolve days later.
 * This writes the decoded bytes to disk (mirroring `../persistence.ts`'s
 * atomic-write pattern) under `.data/generated-media/`, served back by
 * `src/app/api/generated-media/[orgId]/[file]/route.ts` rather than
 * Next's `public/` folder — `.data/` is this codebase's established home
 * for anything written at runtime rather than build time.
 */
import fs from "fs";
import fsp from "fs/promises";
import path from "path";
import { generateId } from "@/shared/utils/string";

const DIR = path.join(process.cwd(), ".data", "generated-media");

/** Organization IDs and generated IDs are both internal, never user-typed path segments — but sanitize anyway before touching the filesystem. */
function sanitizeSegment(segment: string): string {
  return segment.replace(/[^a-zA-Z0-9_-]/g, "");
}

export async function saveGeneratedImage(organizationId: string, base64: string): Promise<{ url: string; id: string }> {
  const orgDir = path.join(DIR, sanitizeSegment(organizationId));
  await fsp.mkdir(orgDir, { recursive: true });
  const id = generateId(20);
  const target = path.join(orgDir, `${id}.png`);
  const tmp = `${target}.${process.pid}.tmp`;
  await fsp.writeFile(tmp, Buffer.from(base64, "base64"));
  await fsp.rename(tmp, target);
  return { url: `/api/generated-media/${sanitizeSegment(organizationId)}/${id}.png`, id };
}

export function readGeneratedImage(organizationId: string, id: string): Buffer | undefined {
  try {
    const target = path.join(DIR, sanitizeSegment(organizationId), `${sanitizeSegment(id.replace(/\.png$/, ""))}.png`);
    return fs.readFileSync(target);
  } catch {
    return undefined;
  }
}
