/**
 * Calixo Platform - API & Webhooks presentation helpers
 *
 * Pure functions turning real `WebhookConfig`/`WebhookDelivery`/`ApiKeyDefinition`
 * records into plain-language display shapes. No fabricated data — every
 * label is either a static human translation of a real enum value, or
 * derived directly from a real field.
 */
import type { WebhookConfig, WebhookDelivery, WebhookEvent } from "@/integrations/types";
import type { ApiKeyDefinition } from "@/core/platform/access/apiAuth/types";
import type { ActivityItem } from "@/components/enterprise/module";

export const EVENT_LABELS: Record<WebhookEvent, string> = {
  "campaign.updated": "Campaign status changes",
  "campaign.created": "New campaign created",
  "campaign.deleted": "Campaign ended",
  "lead.created": "New lead created",
  "lead.updated": "Lead updated",
  "contact.created": "New contact created",
  "contact.updated": "Contact updated",
  "form.submitted": "Form submitted",
  "report.completed": "Report completed",
  "credits.low": "AI credits below 20%",
};

export const EVENT_EMOJI: Record<WebhookEvent, string> = {
  "campaign.updated": "📈",
  "campaign.created": "📈",
  "campaign.deleted": "📈",
  "lead.created": "📥",
  "lead.updated": "📥",
  "contact.created": "📥",
  "contact.updated": "📥",
  "form.submitted": "📝",
  "report.completed": "📊",
  "credits.low": "🔔",
};

export const AUTOMATION_EVENTS: WebhookEvent[] = [
  "lead.created",
  "campaign.updated",
  "report.completed",
  "credits.low",
  "contact.created",
  "form.submitted",
];

export function eventLabel(event: WebhookEvent): string {
  return EVENT_LABELS[event] ?? event;
}

export const SCOPE_LABELS: Record<string, string> = {
  "*": "Full access",
  "report:read": "Read Reports",
  "analytics:read": "Read Analytics",
  "connector:read": "Read Integrations",
  "organization:read": "Read Organization",
  "billing:read": "Read Billing",
};

export const AVAILABLE_SCOPES = ["report:read", "analytics:read", "connector:read", "organization:read", "billing:read", "*"] as const;

export function scopeLabel(scope: string): string {
  return SCOPE_LABELS[scope] ?? scope;
}

export interface AutomationCard {
  id: string;
  name: string;
  event: WebhookEvent;
  eventLabel: string;
  emoji: string;
  destinationLabel: string;
  url: string;
  enabled: boolean;
  workspaceId?: string;
  lastRunAt?: string;
  lastRunStatus?: WebhookDelivery["status"];
}

function fallbackDestination(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return url || "Custom URL";
  }
}

export function toAutomationCard(webhook: WebhookConfig, latestDelivery?: WebhookDelivery): AutomationCard {
  const event = webhook.events[0] ?? "lead.created";
  const destinationLabel = webhook.destinationLabel ?? fallbackDestination(webhook.url);
  return {
    id: webhook.id,
    name: webhook.name ?? `${eventLabel(event)} → ${destinationLabel}`,
    event,
    eventLabel: eventLabel(event),
    emoji: EVENT_EMOJI[event] ?? "🔗",
    destinationLabel,
    url: webhook.url,
    enabled: webhook.enabled,
    workspaceId: webhook.workspaceId,
    lastRunAt: latestDelivery?.createdAt,
    lastRunStatus: latestDelivery?.status,
  };
}

export interface ApiActivityEntry {
  id: string;
  actor: string;
  action: string;
  timestamp: string;
  failed?: boolean;
}

export function deliveryToActivity(delivery: WebhookDelivery, automationName: string): ApiActivityEntry {
  const failed = delivery.status === "failed";
  return {
    id: `delivery:${delivery.id}`,
    actor: "Automation",
    action: failed ? `${automationName} failed to send` : `${automationName} sent successfully`,
    timestamp: delivery.createdAt,
    failed,
  };
}

export function keyCreatedActivity(key: ApiKeyDefinition): ApiActivityEntry {
  return { id: `key-created:${key.id}`, actor: "You", action: `API key "${key.name}" created`, timestamp: key.createdAt };
}

export function keyRevokedActivity(key: ApiKeyDefinition): ApiActivityEntry | null {
  if (!key.revokedAt) return null;
  return { id: `key-revoked:${key.id}`, actor: "You", action: `API key "${key.name}" disabled`, timestamp: key.revokedAt };
}

export function toActivityItems(entries: ApiActivityEntry[]): ActivityItem[] {
  return entries
    .slice()
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .map(e => ({ id: e.id, actor: e.actor, action: e.action, timestamp: e.timestamp, metadata: e.failed ? "Failed" : undefined }));
}
