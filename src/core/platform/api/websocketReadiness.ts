/**
 * Calixo Platform - WebSocket Readiness (NOT implemented)
 *
 * Declares the realtime channels a future phase would actually open
 * sockets for (notifications, dashboard, collaboration, AI streaming) —
 * no WebSocket server exists in this Next.js app yet, and none is started
 * here.
 */
import type { RealtimeChannelDefinition } from "./types";

export class RealtimeChannelRegistry {
  private channels = new Map<string, RealtimeChannelDefinition>();

  declare(channel: RealtimeChannelDefinition): void {
    this.channels.set(channel.channel, channel);
  }

  list(): RealtimeChannelDefinition[] {
    return Array.from(this.channels.values());
  }

  /** Always throws — no realtime transport exists yet. */
  subscribe(): never {
    throw new Error("WebSocket subscriptions are not implemented — channels are declared for readiness only, per the mandate.");
  }

  count(): number {
    return this.channels.size;
  }
}

export const realtimeChannelRegistry = new RealtimeChannelRegistry();

realtimeChannelRegistry.declare({ channel: "notifications", kind: "notifications", description: "Realtime in-app notification delivery." });
realtimeChannelRegistry.declare({ channel: "dashboard", kind: "dashboard", description: "Realtime dashboard widget updates." });
realtimeChannelRegistry.declare({ channel: "collaboration", kind: "collaboration", description: "Realtime multi-user editing presence/cursors." });
realtimeChannelRegistry.declare({ channel: "ai-stream", kind: "ai_stream", description: "Realtime AI Copilot response token streaming." });
