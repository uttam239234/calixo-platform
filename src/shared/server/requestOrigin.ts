import "server-only";
import { headers } from "next/headers";

/**
 * Calixo Platform - Request Origin Resolver
 *
 * The one place `next/headers` gets called to answer "what origin is this
 * request actually being served from" — used wherever a scheme+host needs
 * to be combined with a fixed path (e.g. a provider's OAuth
 * `redirectPathHint`) to compute a real, environment-correct absolute URL,
 * without ever hardcoding a per-environment domain. Callable from Server
 * Actions and Route Handlers; `headers()`'s request-scoped context survives
 * across `await`s within the same request, so this works correctly even
 * called from a nested async function, not just the action's own top level.
 *
 * Deliberately has no fallback — a caller needing a real origin should fail
 * loudly if one genuinely can't be determined (e.g. called outside a real
 * request, such as a scheduled job) rather than silently guessing wrong.
 */
export async function getRequestOrigin(): Promise<string> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
  if (!host) throw new Error("Unable to determine the request origin — no host header present.");

  const isLocal = host.startsWith("localhost") || host.startsWith("127.0.0.1");
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (isLocal ? "http" : "https");

  return `${protocol}://${host}`;
}
