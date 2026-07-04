/**
 * Calixo Platform - Notification Templates
 *
 * Reusable template architecture for all notification types.
 * Every module registers its notification templates here.
 */

import type { NotificationTemplate, NotificationCategory, NotificationChannel, NotificationPriority } from '@/communication/types';

export interface TemplateDefinition {
  key: string;
  name: string;
  description: string;
  category: NotificationCategory;
  titleTemplate: string;
  bodyTemplate: string;
  channels: NotificationChannel[];
  defaultPriority: NotificationPriority;
  actionUrlTemplate?: string;
  actionLabelTemplate?: string;
  variables: string[];
}

export const NOTIFICATION_TEMPLATES: TemplateDefinition[] = [
  // ============================================================================
  // Campaign Templates
  // ============================================================================
  {
    key: 'campaign.created',
    name: 'Campaign Created',
    description: 'Sent when a new campaign is created',
    category: 'info',
    titleTemplate: 'Campaign Created: {{campaignName}}',
    bodyTemplate: 'Your campaign "{{campaignName}}" has been created on {{platform}}. It is currently in {{status}} status.',
    channels: ['in_app', 'email'],
    defaultPriority: 'normal',
    actionUrlTemplate: '/dashboard/ads/campaigns/{{campaignId}}',
    actionLabelTemplate: 'View Campaign',
    variables: ['campaignName', 'platform', 'status', 'campaignId'],
  },
  {
    key: 'campaign.published',
    name: 'Campaign Published',
    description: 'Sent when a campaign is published and goes live',
    category: 'success',
    titleTemplate: 'Campaign Live: {{campaignName}}',
    bodyTemplate: 'Your campaign "{{campaignName}}" is now live on {{platform}}. Daily budget: {{budget}}.',
    channels: ['in_app', 'email', 'slack'],
    defaultPriority: 'high',
    actionUrlTemplate: '/dashboard/ads/campaigns/{{campaignId}}',
    actionLabelTemplate: 'View Performance',
    variables: ['campaignName', 'platform', 'budget', 'campaignId'],
  },
  {
    key: 'campaign.failed',
    name: 'Campaign Failed',
    description: 'Sent when a campaign fails to publish or encounters errors',
    category: 'error',
    titleTemplate: 'Campaign Failed: {{campaignName}}',
    bodyTemplate: 'Your campaign "{{campaignName}}" has failed on {{platform}}. Reason: {{reason}}.',
    channels: ['in_app', 'email', 'slack', 'teams'],
    defaultPriority: 'urgent',
    actionUrlTemplate: '/dashboard/ads/campaigns/{{campaignId}}',
    actionLabelTemplate: 'View Details',
    variables: ['campaignName', 'platform', 'reason', 'campaignId'],
  },
  {
    key: 'campaign.budget_alert',
    name: 'Campaign Budget Alert',
    description: 'Sent when a campaign approaches or exceeds budget',
    category: 'warning',
    titleTemplate: 'Budget Alert: {{campaignName}}',
    bodyTemplate: 'Campaign "{{campaignName}}" has spent {{spent}} of {{budget}} budget ({{percentage}}%).',
    channels: ['in_app', 'email', 'slack'],
    defaultPriority: 'high',
    actionUrlTemplate: '/dashboard/ads/campaigns/{{campaignId}}',
    actionLabelTemplate: 'Manage Budget',
    variables: ['campaignName', 'spent', 'budget', 'percentage', 'campaignId'],
  },

  // ============================================================================
  // Report Templates
  // ============================================================================
  {
    key: 'report.ready',
    name: 'Report Ready',
    description: 'Sent when a generated report is ready for download',
    category: 'info',
    titleTemplate: 'Report Ready: {{reportName}}',
    bodyTemplate: 'Your report "{{reportName}}" has been generated and is ready for download.',
    channels: ['in_app', 'email'],
    defaultPriority: 'normal',
    actionUrlTemplate: '/dashboard/reports/{{reportId}}',
    actionLabelTemplate: 'Download Report',
    variables: ['reportName', 'reportId'],
  },
  {
    key: 'report.scheduled',
    name: 'Report Scheduled',
    description: 'Sent when a report is scheduled for generation',
    category: 'info',
    titleTemplate: 'Report Scheduled: {{reportName}}',
    bodyTemplate: 'Your report "{{reportName}}" has been scheduled. It will be generated {{frequency}}.',
    channels: ['in_app'],
    defaultPriority: 'low',
    variables: ['reportName', 'frequency'],
  },

  // ============================================================================
  // AI Templates
  // ============================================================================
  {
    key: 'ai.recommendation',
    name: 'AI Recommendation',
    description: 'Sent when AI generates a recommendation',
    category: 'ai',
    titleTemplate: 'AI Recommendation: {{title}}',
    bodyTemplate: 'AI has generated a new recommendation: {{recommendation}}. Expected impact: {{impact}}.',
    channels: ['in_app', 'email'],
    defaultPriority: 'normal',
    actionUrlTemplate: '/dashboard/ai/{{conversationId}}',
    actionLabelTemplate: 'View Recommendation',
    variables: ['title', 'recommendation', 'impact', 'conversationId'],
  },
  {
    key: 'ai.completed',
    name: 'AI Task Completed',
    description: 'Sent when an AI generation or analysis task completes',
    category: 'ai',
    titleTemplate: 'AI Task Complete: {{taskName}}',
    bodyTemplate: 'Your AI task "{{taskName}}" has completed. Duration: {{duration}}.',
    channels: ['in_app', 'email'],
    defaultPriority: 'normal',
    actionUrlTemplate: '/dashboard/ai/{{conversationId}}',
    actionLabelTemplate: 'View Results',
    variables: ['taskName', 'duration', 'conversationId'],
  },
  {
    key: 'ai.insight',
    name: 'AI Insight Generated',
    description: 'Sent when AI generates a new insight',
    category: 'ai',
    titleTemplate: 'New AI Insight',
    bodyTemplate: 'AI has identified a new insight: {{insight}}. Confidence: {{confidence}}%.',
    channels: ['in_app'],
    defaultPriority: 'low',
    variables: ['insight', 'confidence'],
  },

  // ============================================================================
  // User & Team Templates
  // ============================================================================
  {
    key: 'user.invited',
    name: 'User Invited',
    description: 'Sent when a user is invited to an organization',
    category: 'info',
    titleTemplate: 'Welcome to {{organizationName}}',
    bodyTemplate: 'You have been invited to join {{organizationName}} on Calixo. Role: {{role}}.',
    channels: ['in_app', 'email'],
    defaultPriority: 'high',
    actionUrlTemplate: '/invitation/{{invitationId}}',
    actionLabelTemplate: 'Accept Invitation',
    variables: ['organizationName', 'role', 'invitationId', 'invitedBy'],
  },
  {
    key: 'user.joined',
    name: 'User Joined',
    description: 'Sent to admins when a new user joins',
    category: 'info',
    titleTemplate: 'New Team Member: {{userName}}',
    bodyTemplate: '{{userName}} ({{userEmail}}) has joined {{organizationName}} as {{role}}.',
    channels: ['in_app', 'email', 'slack'],
    defaultPriority: 'normal',
    actionUrlTemplate: '/dashboard/users',
    actionLabelTemplate: 'View Team',
    variables: ['userName', 'userEmail', 'organizationName', 'role'],
  },
  {
    key: 'role.assigned',
    name: 'Role Assigned',
    description: 'Sent when a user is assigned a new role',
    category: 'info',
    titleTemplate: 'Role Updated: {{roleName}}',
    bodyTemplate: 'Your role has been updated to {{roleName}} in {{organizationName}}.',
    channels: ['in_app', 'email'],
    defaultPriority: 'high',
    actionUrlTemplate: '/dashboard/settings',
    actionLabelTemplate: 'View Settings',
    variables: ['roleName', 'organizationName'],
  },

  // ============================================================================
  // Workspace & Organization Templates
  // ============================================================================
  {
    key: 'workspace.created',
    name: 'Workspace Created',
    description: 'Sent when a new workspace is created',
    category: 'success',
    titleTemplate: 'Workspace Created: {{workspaceName}}',
    bodyTemplate: 'Workspace "{{workspaceName}}" has been created in {{organizationName}}.',
    channels: ['in_app', 'email'],
    defaultPriority: 'normal',
    actionUrlTemplate: '/dashboard/workspaces/{{workspaceId}}',
    actionLabelTemplate: 'Open Workspace',
    variables: ['workspaceName', 'organizationName', 'workspaceId'],
  },
  {
    key: 'organization.updated',
    name: 'Organization Updated',
    description: 'Sent when organization settings are updated',
    category: 'info',
    titleTemplate: 'Organization Updated',
    bodyTemplate: '{{organizationName}} settings have been updated by {{updatedBy}}.',
    channels: ['in_app', 'email'],
    defaultPriority: 'normal',
    variables: ['organizationName', 'updatedBy'],
  },

  // ============================================================================
  // Integration Templates
  // ============================================================================
  {
    key: 'integration.connected',
    name: 'Integration Connected',
    description: 'Sent when an integration is successfully connected',
    category: 'success',
    titleTemplate: 'Integration Connected: {{providerName}}',
    bodyTemplate: '{{providerName}} has been successfully connected to {{organizationName}}.',
    channels: ['in_app', 'email', 'slack'],
    defaultPriority: 'high',
    actionUrlTemplate: '/dashboard/integrations/{{integrationId}}',
    actionLabelTemplate: 'View Integration',
    variables: ['providerName', 'organizationName', 'integrationId'],
  },
  {
    key: 'integration.failed',
    name: 'Integration Failed',
    description: 'Sent when an integration encounters an error',
    category: 'error',
    titleTemplate: 'Integration Error: {{providerName}}',
    bodyTemplate: '{{providerName}} integration encountered an error: {{error}}. Please check your connection settings.',
    channels: ['in_app', 'email', 'slack', 'teams'],
    defaultPriority: 'urgent',
    actionUrlTemplate: '/dashboard/integrations/{{integrationId}}',
    actionLabelTemplate: 'Fix Integration',
    variables: ['providerName', 'error', 'integrationId'],
  },
  {
    key: 'sync.completed',
    name: 'Sync Completed',
    description: 'Sent when a data sync completes successfully',
    category: 'success',
    titleTemplate: 'Sync Complete: {{providerName}}',
    bodyTemplate: 'Data sync with {{providerName}} completed. {{recordsSynced}} records synced in {{duration}}.',
    channels: ['in_app', 'email'],
    defaultPriority: 'normal',
    variables: ['providerName', 'recordsSynced', 'duration'],
  },

  // ============================================================================
  // Workflow Templates
  // ============================================================================
  {
    key: 'workflow.completed',
    name: 'Workflow Completed',
    description: 'Sent when a workflow execution completes',
    category: 'success',
    titleTemplate: 'Workflow Complete: {{workflowName}}',
    bodyTemplate: 'Workflow "{{workflowName}}" has completed successfully. {{actionsCompleted}} actions executed.',
    channels: ['in_app', 'email', 'slack'],
    defaultPriority: 'normal',
    actionUrlTemplate: '/dashboard/workflows/{{workflowId}}',
    actionLabelTemplate: 'View Execution',
    variables: ['workflowName', 'actionsCompleted', 'workflowId'],
  },
  {
    key: 'workflow.failed',
    name: 'Workflow Failed',
    description: 'Sent when a workflow execution fails',
    category: 'error',
    titleTemplate: 'Workflow Failed: {{workflowName}}',
    bodyTemplate: 'Workflow "{{workflowName}}" has failed. Error: {{error}}. Action: {{failedAction}}.',
    channels: ['in_app', 'email', 'slack', 'teams'],
    defaultPriority: 'urgent',
    actionUrlTemplate: '/dashboard/workflows/{{workflowId}}',
    actionLabelTemplate: 'View Details',
    variables: ['workflowName', 'error', 'failedAction', 'workflowId'],
  },

  // ============================================================================
  // Approval Templates
  // ============================================================================
  {
    key: 'approval.required',
    name: 'Approval Required',
    description: 'Sent when an item requires approval',
    category: 'warning',
    titleTemplate: 'Approval Required: {{itemName}}',
    bodyTemplate: '{{itemType}} "{{itemName}}" requires your approval. Submitted by {{submittedBy}}.',
    channels: ['in_app', 'email', 'slack', 'teams'],
    defaultPriority: 'high',
    actionUrlTemplate: '/dashboard/approvals/{{approvalId}}',
    actionLabelTemplate: 'Review & Approve',
    variables: ['itemName', 'itemType', 'submittedBy', 'approvalId'],
  },
  {
    key: 'approval.approved',
    name: 'Approval Granted',
    description: 'Sent when an item is approved',
    category: 'success',
    titleTemplate: 'Approved: {{itemName}}',
    bodyTemplate: '{{itemType}} "{{itemName}}" has been approved by {{approvedBy}}.',
    channels: ['in_app', 'email'],
    defaultPriority: 'normal',
    actionUrlTemplate: '/dashboard/approvals/{{approvalId}}',
    actionLabelTemplate: 'View Details',
    variables: ['itemName', 'itemType', 'approvedBy', 'approvalId'],
  },

  // ============================================================================
  // System Templates
  // ============================================================================
  {
    key: 'system.alert',
    name: 'System Alert',
    description: 'Sent for system-level alerts and warnings',
    category: 'system',
    titleTemplate: 'System Alert: {{alertTitle}}',
    bodyTemplate: '{{alertMessage}} Severity: {{severity}}.',
    channels: ['in_app', 'email', 'slack', 'teams'],
    defaultPriority: 'urgent',
    variables: ['alertTitle', 'alertMessage', 'severity'],
  },
  {
    key: 'system.maintenance',
    name: 'System Maintenance',
    description: 'Sent to notify about scheduled maintenance',
    category: 'system',
    titleTemplate: 'Scheduled Maintenance',
    bodyTemplate: 'Calixo will undergo scheduled maintenance on {{date}} from {{startTime}} to {{endTime}} {{timezone}}.',
    channels: ['in_app', 'email'],
    defaultPriority: 'high',
    variables: ['date', 'startTime', 'endTime', 'timezone'],
  },

  // ============================================================================
  // Security Templates
  // ============================================================================
  {
    key: 'security.login.new_device',
    name: 'New Device Login',
    description: 'Sent when a user logs in from a new device',
    category: 'security',
    titleTemplate: 'New Sign-In Detected',
    bodyTemplate: 'A new sign-in to your account was detected from {{device}} in {{location}} at {{time}}.',
    channels: ['in_app', 'email'],
    defaultPriority: 'high',
    actionUrlTemplate: '/dashboard/settings/security',
    actionLabelTemplate: 'Review Activity',
    variables: ['device', 'location', 'time'],
  },
  {
    key: 'security.password_changed',
    name: 'Password Changed',
    description: 'Sent when a user changes their password',
    category: 'security',
    titleTemplate: 'Password Changed',
    bodyTemplate: 'Your Calixo password was changed successfully. If you did not make this change, please contact support immediately.',
    channels: ['in_app', 'email'],
    defaultPriority: 'urgent',
    actionUrlTemplate: '/dashboard/settings/security',
    actionLabelTemplate: 'Secure Account',
    variables: [],
  },
];

export class TemplateRegistry {
  private templates: Map<string, TemplateDefinition> = new Map();

  constructor() {
    for (const tpl of NOTIFICATION_TEMPLATES) {
      this.templates.set(tpl.key, tpl);
    }
  }

  get(key: string): TemplateDefinition | undefined {
    return this.templates.get(key);
  }

  getAll(): TemplateDefinition[] {
    return Array.from(this.templates.values());
  }

  getByCategory(category: NotificationCategory): TemplateDefinition[] {
    return this.getAll().filter(t => t.category === category);
  }

  register(template: TemplateDefinition): void {
    if (this.templates.has(template.key)) {
      throw new Error(`Template '${template.key}' already registered`);
    }
    this.templates.set(template.key, template);
  }

  has(key: string): boolean {
    return this.templates.has(key);
  }
}

export const templateRegistry = new TemplateRegistry();