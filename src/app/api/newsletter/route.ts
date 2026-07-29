import "server-only";
import { NextResponse } from "next/server";
import fs from "fs";
import fsp from "fs/promises";
import path from "path";

/**
 * Real (if minimal) newsletter capture for the marketing footer — replaces
 * a form whose entire submit handler was `e.preventDefault()`. Mirrors the
 * atomic-write pattern used across this codebase's other file-backed
 * stores (`core/platform/dashboardBuilder/persistence.ts`,
 * `core/platform/configStore/`) at a scale that doesn't need a queue: one
 * append per request, guarded by a single in-process write lock.
 */

const FILE = path.join(process.cwd(), ".data", "newsletter-subscribers.json");
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

let writeLock: Promise<void> = Promise.resolve();

// Basic per-IP rate limiting: 5 requests per minute, sliding window.
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 5;
const ipHits = new Map<string, number[]>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const hits = (ipHits.get(ip) ?? []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  if (hits.length >= RATE_LIMIT_MAX) {
    ipHits.set(ip, hits);
    return false;
  }
  hits.push(now);
  ipHits.set(ip, hits);
  return true;
}

function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}

export async function POST(request: Request) {
  const ip = getClientIp(request);
  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { ok: false, error: "Too many requests. Please try again later." },
      { status: 429 }
    );
  }

  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim() : "";

  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ ok: false, error: "Enter a valid email address." }, { status: 400 });
  }

  const task = writeLock.catch(() => {}).then(async () => {
    await fsp.mkdir(path.dirname(FILE), { recursive: true });
    let subscribers: { email: string; subscribedAt: string }[] = [];
    try {
      subscribers = JSON.parse(fs.readFileSync(FILE, "utf-8"));
    } catch {
      subscribers = [];
    }
    if (!subscribers.some((s) => s.email.toLowerCase() === email.toLowerCase())) {
      subscribers.push({ email, subscribedAt: new Date().toISOString() });
    }
    const tmp = `${FILE}.${process.pid}.tmp`;
    await fsp.writeFile(tmp, JSON.stringify(subscribers, null, 2), "utf-8");
    await fsp.rename(tmp, FILE);
  });
  writeLock = task;
  await task;

  return NextResponse.json({ ok: true });
}
