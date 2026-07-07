export type FeatureFlagScope = "platform" | "organization" | "workspace" | "user" | "subscription";

export interface FeatureFlagEvaluationContext {
  organizationId?: string;
  workspaceId?: string;
  userId?: string;
}

export interface FeatureFlagEvaluation {
  flagId: string;
  enabled: boolean;
  resolvedAt: FeatureFlagScope;
  reason: string;
}
