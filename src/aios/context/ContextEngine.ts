/**
 * Calixo Platform - Context Engine
 *
 * Automatically injects current user, organization, workspace, role,
 * permissions, module, feature, subscription, and integrations context.
 */

import type { AIExecutionContext } from '@/aios/types';

export class ContextEngine {
  async buildContext(params: {
    userId: string;
    userName?: string;
    userEmail?: string;
    userRole?: string;
    organizationId?: string;
    organizationName?: string;
    organizationSlug?: string;
    workspaceId?: string;
    workspaceName?: string;
    module?: string;
    feature?: string;
    subscriptionTier?: string;
    permissions?: string[];
    integrations?: string[];
    timezone?: string;
    locale?: string;
  }): Promise<AIExecutionContext> {
    return {
      userId: params.userId,
      userName: params.userName,
      userEmail: params.userEmail,
      userRole: params.userRole,
      organizationId: params.organizationId,
      organizationName: params.organizationName,
      organizationSlug: params.organizationSlug,
      workspaceId: params.workspaceId,
      workspaceName: params.workspaceName,
      module: params.module,
      feature: params.feature,
      subscriptionTier: params.subscriptionTier,
      permissions: params.permissions || [],
      integrations: params.integrations || [],
      timezone: params.timezone || 'UTC',
      locale: params.locale || 'en-US',
    };
  }

  contextToSystemMessage(context: AIExecutionContext): string {
    const parts: string[] = ['Current Context:'];
    if (context.userName) parts.push(`- User: ${context.userName} (${context.userEmail || context.userId})`);
    if (context.userRole) parts.push(`- Role: ${context.userRole}`);
    if (context.organizationName) parts.push(`- Organization: ${context.organizationName}`);
    if (context.workspaceName) parts.push(`- Workspace: ${context.workspaceName}`);
    if (context.module) parts.push(`- Module: ${context.module}`);
    if (context.feature) parts.push(`- Feature: ${context.feature}`);
    if (context.subscriptionTier) parts.push(`- Plan: ${context.subscriptionTier}`);
    if (context.permissions.length > 0) parts.push(`- Permissions: ${context.permissions.join(', ')}`);
    if (context.integrations.length > 0) parts.push(`- Connected Integrations: ${context.integrations.join(', ')}`);
    parts.push(`- Timezone: ${context.timezone}`);
    parts.push(`- Locale: ${context.locale}`);
    return parts.join('\n');
  }
}

export const contextEngine = new ContextEngine();