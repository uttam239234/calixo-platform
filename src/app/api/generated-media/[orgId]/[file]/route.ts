import "server-only";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { readGeneratedImage } from "@/aios/media/imageStore";

/**
 * Serves real, disk-persisted images from Creative Design Studio's real
 * OpenAI image generation (`imageStore.ts`). Verifies the requester is
 * signed in and belongs to the organization that owns the image.
 */
export async function GET(_request: Request, { params }: { params: Promise<{ orgId: string; file: string }> }) {
  const { orgId, file } = await params;

  const { userId, orgId: clerkOrgId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }
  if (!clerkOrgId || clerkOrgId !== orgId) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const buffer = readGeneratedImage(orgId, file);
  if (!buffer) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return new NextResponse(new Uint8Array(buffer), {
    headers: { "Content-Type": "image/png", "Cache-Control": "public, max-age=31536000, immutable" },
  });
}
