/**
 * Calixo Platform - Platform Event Bus
 *
 * A typed, discoverable wrapper around the existing `@/background/events`
 * EventBus — reused rather than duplicated. The background EventBus already
 * has real publish/subscribe/dispatch mechanics (see `EventBus.ts`); this
 * class narrows its generic `string` event type to the fixed
 * `PlatformEventType` catalog and gives every platform module one obvious
 * place to `publish()`/`subscribe()` instead of importing another module's
 * engine to react to its lifecycle.
 *
 * NOTE: `eventBus.start()` (the poll loop) is intentionally not started
 * here — the same "never auto-invoked" precedent applies as `initializeAIOS()`
 * and `initializeBackgroundPlatform()`. A future Phase (real persistence /
 * real background workers) is the place to start it; this phase only
 * guarantees every lifecycle action publishes a real, inspectable event.
 */

import { eventBus } from "@/background/events/EventBus";
import type { Event as BackgroundEvent } from "@/background/types";
import type { PlatformEventInput, PlatformEventType } from "./types";

export class PlatformEventBus {
  async publish<TPayload = Record<string, unknown>>(event: PlatformEventInput<TPayload>): Promise<BackgroundEvent> {
    return eventBus.publish({
      type: event.type,
      source: "platform",
      data: event.payload as Record<string, unknown>,
      organizationId: event.organizationId,
      workspaceId: event.workspaceId,
      userId: event.userId,
      correlationId: event.correlationId,
      status: "pending",
    });
  }

  registerHandler(handlerName: string, handler: (event: BackgroundEvent) => Promise<void> | void): void {
    eventBus.registerHandler(handlerName, async event => {
      await handler(event);
    });
  }

  subscribe(eventType: PlatformEventType, handlerName: string, description: string, priority = 100) {
    return eventBus.subscribe(eventType, handlerName, description, priority);
  }

  unsubscribe(subscriptionId: string): Promise<boolean> {
    return eventBus.unsubscribe(subscriptionId);
  }

  getMetrics() {
    return eventBus.getMetrics();
  }
}

export const platformEventBus = new PlatformEventBus();
