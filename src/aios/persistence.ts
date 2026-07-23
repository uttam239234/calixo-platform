import "server-only";

/**
 * Calixo Platform - AIOS Real Persistence
 *
 * `MemoryEngine`'s conversation storage and `AIAnalytics`'s usage records
 * are both plain in-memory `Map`s — real within one server process's
 * lifetime, but never survive a restart, and (per this codebase's own
 * Round 23 lesson) not something to convert to `fs`-backed storage
 * in-place, since both classes are re-exported from client-safe barrels
 * elsewhere. Instead of touching those classes, this is a dedicated,
 * `server-only` disk-backed store — mirrors
 * `core/platform/dashboardBuilder/persistence.ts`'s exact atomic-write +
 * per-key write-queue pattern — called directly from Server Actions
 * (Copilot/Content/Reports/Analytics/Brand) after every real AI call.
 *
 * Two tables:
 *  - `ai_conversations`: real transcripts (the brief's Part 10) — fixes
 *    Copilot's conversation history evaporating on refresh (it was only
 *    ever held in a client-side module-scope Map).
 *  - `ai_request_log`: one row per real provider call (Part 9's audit log
 *    + Part 11's health metrics, aggregated by `getHealthSummary()` rather
 *    than kept as two separate tables — every field the health dashboard
 *    needs is already on the per-request row).
 */
import fs from "fs";
import fsp from "fs/promises";
import path from "path";
import { generateId } from "@/shared/utils/string";
import type { AIProvider, AIModel, AIMessage } from "@/aios/types";

const DIR = path.join(process.cwd(), ".data", "aios");
const MAX_LOG_ENTRIES = 5000;

function filePath(name: string): string {
  return path.join(DIR, `${name}.json`);
}

function readFromDisk<T>(name: string): T | undefined {
  try {
    const raw = fs.readFileSync(filePath(name), "utf-8");
    return JSON.parse(raw) as T;
  } catch {
    return undefined;
  }
}

const writeQueues = new Map<string, Promise<void>>();

function writeToDisk<T>(name: string, data: T): Promise<void> {
  const prior = writeQueues.get(name) ?? Promise.resolve();
  const next = prior.catch(() => {}).then(async () => {
    await fsp.mkdir(DIR, { recursive: true });
    const target = filePath(name);
    const tmp = `${target}.${process.pid}.tmp`;
    await fsp.writeFile(tmp, JSON.stringify(data, null, 2), "utf-8");
    await fsp.rename(tmp, target);
  });
  writeQueues.set(name, next);
  return next;
}

// ---------------------------------------------------------------------
// Conversations
// ---------------------------------------------------------------------

export interface StoredConversation {
  id: string;
  organizationId: string;
  userId: string;
  module: string;
  messages: AIMessage[];
  createdAt: string;
  updatedAt: string;
}

let conversationsCache: Record<string, StoredConversation> | undefined;

function loadConversations(): Record<string, StoredConversation> {
  if (!conversationsCache) conversationsCache = readFromDisk<Record<string, StoredConversation>>("ai_conversations") ?? {};
  return conversationsCache;
}

export async function appendConversationMessage(params: {
  conversationId: string;
  organizationId: string;
  userId: string;
  module: string;
  message: AIMessage;
}): Promise<StoredConversation> {
  const all = loadConversations();
  const now = new Date().toISOString();
  const existing = all[params.conversationId];
  const conversation: StoredConversation = existing
    ? { ...existing, messages: [...existing.messages, params.message], updatedAt: now }
    : { id: params.conversationId, organizationId: params.organizationId, userId: params.userId, module: params.module, messages: [params.message], createdAt: now, updatedAt: now };
  all[params.conversationId] = conversation;
  await writeToDisk("ai_conversations", all);
  return conversation;
}

export async function getConversation(conversationId: string): Promise<StoredConversation | undefined> {
  return loadConversations()[conversationId];
}

export async function listConversations(organizationId: string, userId?: string): Promise<StoredConversation[]> {
  return Object.values(loadConversations())
    .filter(c => c.organizationId === organizationId && (!userId || c.userId === userId))
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}

// ---------------------------------------------------------------------
// Request log (audit trail + health metrics)
// ---------------------------------------------------------------------

export interface AIRequestLogEntry {
  id: string;
  conversationId?: string;
  messageId?: string;
  organizationId: string;
  userId: string;
  module: string;
  feature?: string;
  provider: AIProvider;
  model: AIModel;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  creditsUsed: number;
  latencyMs: number;
  success: boolean;
  error?: string;
  /** True when the request did NOT use the priority-1 provider (OpenAI) — i.e. `ProviderRouter` fell over to Anthropic or Gemini. */
  fallbackActivated: boolean;
  timestamp: string;
}

let logCache: AIRequestLogEntry[] | undefined;

function loadLog(): AIRequestLogEntry[] {
  if (!logCache) logCache = readFromDisk<AIRequestLogEntry[]>("ai_request_log") ?? [];
  return logCache;
}

export async function recordAIRequest(entry: Omit<AIRequestLogEntry, "id" | "timestamp">): Promise<AIRequestLogEntry> {
  const log = loadLog();
  const record: AIRequestLogEntry = { ...entry, id: generateId(16), timestamp: new Date().toISOString() };
  log.push(record);
  if (log.length > MAX_LOG_ENTRIES) log.splice(0, log.length - MAX_LOG_ENTRIES);
  await writeToDisk("ai_request_log", log);
  return record;
}

export interface AIHealthSummary {
  totalRequests: number;
  successRate: number;
  averageLatencyMs: number;
  totalCreditsUsed: number;
  fallbackActivations: number;
  byProvider: Record<string, { count: number; successCount: number; averageLatencyMs: number; credits: number }>;
  recentFailures: AIRequestLogEntry[];
}

export async function getHealthSummary(organizationId?: string, sinceHoursAgo = 24 * 7): Promise<AIHealthSummary> {
  const cutoff = Date.now() - sinceHoursAgo * 60 * 60 * 1000;
  let entries = loadLog().filter(e => new Date(e.timestamp).getTime() >= cutoff);
  if (organizationId) entries = entries.filter(e => e.organizationId === organizationId);

  const byProvider: AIHealthSummary["byProvider"] = {};
  for (const e of entries) {
    if (!byProvider[e.provider]) byProvider[e.provider] = { count: 0, successCount: 0, averageLatencyMs: 0, credits: 0 };
    const bucket = byProvider[e.provider];
    bucket.count++;
    if (e.success) bucket.successCount++;
    bucket.averageLatencyMs += e.latencyMs;
    bucket.credits += e.creditsUsed;
  }
  for (const bucket of Object.values(byProvider)) {
    bucket.averageLatencyMs = bucket.count > 0 ? Math.round(bucket.averageLatencyMs / bucket.count) : 0;
  }

  const successCount = entries.filter(e => e.success).length;
  return {
    totalRequests: entries.length,
    successRate: entries.length > 0 ? (successCount / entries.length) * 100 : 100,
    averageLatencyMs: entries.length > 0 ? Math.round(entries.reduce((s, e) => s + e.latencyMs, 0) / entries.length) : 0,
    totalCreditsUsed: entries.reduce((s, e) => s + e.creditsUsed, 0),
    fallbackActivations: entries.filter(e => e.fallbackActivated).length,
    byProvider,
    recentFailures: entries.filter(e => !e.success).slice(-20).reverse(),
  };
}
