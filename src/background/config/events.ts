/**
 * Calixo Platform - Standard Event Definitions
 *
 * Every module registers its events here.
 * Future modules should add their events to this registry.
 */

export interface StandardEventDefinition {
  type: string;
  source: string;
  description: string;
  schema?: Record<string, string>;
}

export const STANDARD_EVENTS: StandardEventDefinition[] = [
  // Campaign Events
  { type: 'campaign.created', source: 'campaigns', description: 'Campaign was created' },
  { type: 'campaign.updated', source: 'campaigns', description: 'Campaign was updated' },
  { type: 'campaign.published', source: 'campaigns', description: 'Campaign was published' },
  { type: 'campaign.paused', source: 'campaigns', description: 'Campaign was paused' },
  { type: 'campaign.ended', source: 'campaigns', description: 'Campaign ended' },
  { type: 'campaign.deleted', source: 'campaigns', description: 'Campaign was deleted' },

  // Social Media Events
  { type: 'social.post.created', source: 'social', description: 'Social post was created' },
  { type: 'social.post.published', source: 'social', description: 'Social post was published' },
  { type: 'social.post.scheduled', source: 'social', description: 'Social post was scheduled' },
  { type: 'social.post.failed', source: 'social', description: 'Social post publishing failed' },
  { type: 'social.post.deleted', source: 'social', description: 'Social post was deleted' },

  // Integration Events
  { type: 'integration.connected', source: 'integrations', description: 'Integration was connected' },
  { type: 'integration.disconnected', source: 'integrations', description: 'Integration was disconnected' },
  { type: 'integration.synced', source: 'integrations', description: 'Integration sync completed' },
  { type: 'integration.sync_failed', source: 'integrations', description: 'Integration sync failed' },
  { type: 'integration.error', source: 'integrations', description: 'Integration encountered an error' },

  // Report Events
  { type: 'report.generated', source: 'reports', description: 'Report was generated' },
  { type: 'report.scheduled', source: 'reports', description: 'Report was scheduled' },
  { type: 'report.exported', source: 'reports', description: 'Report was exported' },
  { type: 'report.failed', source: 'reports', description: 'Report generation failed' },

  // Notification Events
  { type: 'notification.created', source: 'notifications', description: 'Notification was created' },
  { type: 'notification.sent', source: 'notifications', description: 'Notification was sent' },
  { type: 'notification.read', source: 'notifications', description: 'Notification was read' },

  // AI Events
  { type: 'ai.conversation.started', source: 'ai', description: 'AI conversation was started' },
  { type: 'ai.conversation.completed', source: 'ai', description: 'AI conversation was completed' },
  { type: 'ai.generation.completed', source: 'ai', description: 'AI content generation completed' },
  { type: 'ai.insight.generated', source: 'ai', description: 'AI insight was generated' },

  // Organization Events
  { type: 'organization.created', source: 'organizations', description: 'Organization was created' },
  { type: 'organization.updated', source: 'organizations', description: 'Organization was updated' },
  { type: 'organization.archived', source: 'organizations', description: 'Organization was archived' },

  // Workspace Events
  { type: 'workspace.created', source: 'workspaces', description: 'Workspace was created' },
  { type: 'workspace.updated', source: 'workspaces', description: 'Workspace was updated' },
  { type: 'workspace.archived', source: 'workspaces', description: 'Workspace was archived' },

  // User Events
  { type: 'user.invited', source: 'users', description: 'User was invited' },
  { type: 'user.joined', source: 'users', description: 'User joined organization' },
  { type: 'user.removed', source: 'users', description: 'User was removed' },
  { type: 'user.role_changed', source: 'users', description: 'User role was changed' },

  // Team Events
  { type: 'team.created', source: 'teams', description: 'Team was created' },
  { type: 'team.updated', source: 'teams', description: 'Team was updated' },
  { type: 'team.archived', source: 'teams', description: 'Team was archived' },
  { type: 'team.member.added', source: 'teams', description: 'Member added to team' },
  { type: 'team.member.removed', source: 'teams', description: 'Member removed from team' },

  // Role Events
  { type: 'role.assigned', source: 'roles', description: 'Role was assigned to user' },
  { type: 'role.removed', source: 'roles', description: 'Role was removed from user' },
  { type: 'role.created', source: 'roles', description: 'Role was created' },
  { type: 'role.updated', source: 'roles', description: 'Role was updated' },

  // System Events
  { type: 'system.job.completed', source: 'system', description: 'Background job completed' },
  { type: 'system.job.failed', source: 'system', description: 'Background job failed' },
  { type: 'system.health.check', source: 'system', description: 'System health check' },
  { type: 'system.error', source: 'system', description: 'System error occurred' },
];

export class EventRegistry {
  private events: Map<string, StandardEventDefinition> = new Map();

  constructor() {
    for (const event of STANDARD_EVENTS) {
      this.events.set(event.type, event);
    }
  }

  getEvent(type: string): StandardEventDefinition | undefined {
    return this.events.get(type);
  }

  getAllEvents(): StandardEventDefinition[] {
    return Array.from(this.events.values());
  }

  getEventsBySource(source: string): StandardEventDefinition[] {
    return this.getAllEvents().filter(e => e.source === source);
  }

  registerEvent(event: StandardEventDefinition): void {
    if (this.events.has(event.type)) {
      throw new Error(`Event '${event.type}' is already registered`);
    }
    this.events.set(event.type, event);
  }

  hasEvent(type: string): boolean {
    return this.events.has(type);
  }
}

export const eventRegistry = new EventRegistry();