/**
 * Calixo Platform - Contract Platform API
 */
import { contractEngine } from "./ContractEngine";
import type { ContractDefinition } from "./types";

export class ContractPlatformAPI {
  create(input: Omit<ContractDefinition, "id" | "status" | "createdAt" | "updatedAt">): ContractDefinition {
    return contractEngine.create(input);
  }

  submitForApproval(id: string): ContractDefinition {
    return contractEngine.submitForApproval(id);
  }

  approve(id: string, approvedBy: string): ContractDefinition {
    return contractEngine.approve(id, approvedBy);
  }

  terminate(id: string): ContractDefinition {
    return contractEngine.terminate(id);
  }

  renew(id: string, newEndsAt: string): ContractDefinition {
    return contractEngine.renew(id, newEndsAt);
  }

  get(id: string): ContractDefinition | undefined {
    return contractEngine.get(id);
  }

  listForOrganization(organizationId: string): ContractDefinition[] {
    return contractEngine.listForOrganization(organizationId);
  }
}

export const contractPlatformAPI = new ContractPlatformAPI();
