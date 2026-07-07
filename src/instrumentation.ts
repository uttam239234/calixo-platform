/**
 * Calixo Platform - Server Instrumentation
 *
 * Next.js's standard "run once when the server process starts" hook.
 * Found during the Track 1 Enterprise Platform Certification:
 * `initializePlatformFoundation()` (Identity/Access/Data/Connectors/API/
 * Execution/Observability/Commercial — every phase's bootstrap) was only
 * ever invoked from `src/app/api/v1/[...path]/route.ts`, meaning a normal
 * browser page load never started it — the Execution Platform's real
 * queue/event-bus/scheduler loops (Phase 7) and the Observability/
 * Commercial recurring ticks (Phases 8-9) never ran unless something first
 * hit the HTTP gateway. This is the correct fix, not a new subsystem: the
 * platform foundation already documents itself as safe to call from
 * server-side code exactly once; it simply never had a real "server
 * started" call site. Guarded to the Node.js runtime only — the platform's
 * background loops are Node-process concerns and must never run in the
 * edge runtime or (per Phase 7's explicit design) in a browser tab.
 */
export async function register(): Promise<void> {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { initializePlatformFoundation } = await import("@/core/platform");
    await initializePlatformFoundation();
  }
}
