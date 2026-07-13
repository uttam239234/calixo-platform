import { organizationRegistry } from "../organizations/OrganizationRegistry";
import { workspaceRegistry } from "../workspaces/WorkspaceRegistry";
import { subscriptionEngine } from "../subscription/SubscriptionEngine";
import { featureFlagRegistry } from "./FeatureFlagRegistry";
import type { FeatureFlagEvaluation, FeatureFlagEvaluationContext } from "./types";

/** Deterministic 0-99 bucket for `organizationId + flagId` — same inputs always land in the same bucket, so a rollout percentage is stable across evaluations rather than random per-call. */
function rolloutBucket(organizationId: string, flagId: string): number {
  const input = `${organizationId}:${flagId}`;
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 31 + input.charCodeAt(i)) | 0;
  }
  return Math.abs(hash) % 100;
}

/**
 * Resolves a flag at the most specific scope available: workspace override
 * > organization override > subscription-tier gate (for "subscription"
 * category flags) > percentage rollout (for flags with `rolloutPercent` set,
 * e.g. Experiments) > platform default. This is the reusable evaluator every
 * module should call instead of re-implementing tier/override logic.
 */
export class FeatureFlagEngine {
  isEnabled(flagId: string, context: FeatureFlagEvaluationContext = {}): boolean {
    return this.evaluate(flagId, context).enabled;
  }

  evaluate(flagId: string, context: FeatureFlagEvaluationContext = {}): FeatureFlagEvaluation {
    const definition = featureFlagRegistry.get(flagId);
    if (!definition) return { flagId, enabled: false, resolvedAt: "platform", reason: "Unknown flag" };

    if (context.workspaceId) {
      const workspace = workspaceRegistry.lookup(context.workspaceId);
      if (workspace && flagId in workspace.featureFlagOverrides) {
        return { flagId, enabled: workspace.featureFlagOverrides[flagId], resolvedAt: "workspace", reason: "Workspace-level override" };
      }
    }

    if (context.organizationId) {
      const organization = organizationRegistry.lookup(context.organizationId);
      if (organization && flagId in organization.featureFlagOverrides) {
        return { flagId, enabled: organization.featureFlagOverrides[flagId], resolvedAt: "organization", reason: "Organization-level override" };
      }
      if (definition.category === "subscription") {
        const gated = subscriptionEngine.hasFeatureGate(context.organizationId, flagId);
        return { flagId, enabled: gated, resolvedAt: "subscription", reason: gated ? "Unlocked by subscription tier" : "Not included in the organization's current subscription tier" };
      }
      if (definition.rolloutPercent !== undefined) {
        const inRollout = rolloutBucket(context.organizationId, flagId) < definition.rolloutPercent;
        return { flagId, enabled: inRollout, resolvedAt: "organization", reason: `Percentage rollout: ${definition.rolloutPercent}% of organizations` };
      }
    }

    return { flagId, enabled: definition.defaultEnabled, resolvedAt: "platform", reason: "Platform default" };
  }

  getAllForContext(context: FeatureFlagEvaluationContext = {}): FeatureFlagEvaluation[] {
    return featureFlagRegistry.list().map(d => this.evaluate(d.id, context));
  }
}

export const featureFlagEngine = new FeatureFlagEngine();
