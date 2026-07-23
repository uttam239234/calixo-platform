import "server-only";
import { NextResponse } from "next/server";
import { readGeneratedImage } from "@/aios/media/imageStore";

/**
 * Serves real, disk-persisted images from Creative Design Studio's real
 * OpenAI image generation (`imageStore.ts`) — not Next's `public/` folder,
 * since these are written at request time, not build time.
 */
export async function GET(_request: Request, { params }: { params: Promise<{ orgId: string; file: string }> }) {
  const { orgId, file } = await params;
  const buffer = readGeneratedImage(orgId, file);
  if (!buffer) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return new NextResponse(new Uint8Array(buffer), {
    headers: { "Content-Type": "image/png", "Cache-Control": "public, max-age=31536000, immutable" },
  });
}
