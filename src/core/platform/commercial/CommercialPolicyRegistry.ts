/**
 * Calixo Platform - Commercial Policies
 *
 * Declarative registry — trial/upgrade/downgrade/renewal/cancellation/
 * refund/credit/quota/grace-period policies are configuration the relevant
 * engine (Subscription/Quota/Credit/Invoice) reads, not a separate rule
 * interpreter. Kept simple and real: register + list + lookup by kind.
 */
import type { CommercialPolicyDefinition, CommercialPolicyKind } from "./types";

export class CommercialPolicyRegistry {
  private policies = new Map<string, CommercialPolicyDefinition>();

  register(policy: CommercialPolicyDefinition): CommercialPolicyDefinition {
    this.policies.set(policy.id, policy);
    return policy;
  }

  get(id: string): CommercialPolicyDefinition | undefined {
    return this.policies.get(id);
  }

  listByKind(kind: CommercialPolicyKind): CommercialPolicyDefinition[] {
    return Array.from(this.policies.values()).filter(p => p.kind === kind && p.isActive);
  }

  list(): CommercialPolicyDefinition[] {
    return Array.from(this.policies.values());
  }

  count(): number {
    return this.policies.size;
  }
}

export const commercialPolicyRegistry = new CommercialPolicyRegistry();
