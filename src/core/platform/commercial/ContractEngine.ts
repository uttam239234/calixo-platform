/**
 * Calixo Platform - Contract Platform
 *
 * Enterprise agreements/purchase orders/custom contracts/renewals as real
 * structured records with a lifecycle — genuinely new.
 */
import { generateId } from "@/shared/utils/string";
import { platformEventBus } from "@/core/platform/events/PlatformEventBus";
import type { ContractDefinition } from "./types";

export class ContractEngine {
  private contracts = new Map<string, ContractDefinition>();

  create(input: Omit<ContractDefinition, "id" | "status" | "createdAt" | "updatedAt">): ContractDefinition {
    const now = new Date().toISOString();
    const contract: ContractDefinition = { ...input, id: generateId(16), status: "draft", createdAt: now, updatedAt: now };
    this.contracts.set(contract.id, contract);
    return contract;
  }

  submitForApproval(id: string): ContractDefinition {
    const contract = this.mustGet(id);
    contract.status = "pending_approval";
    contract.updatedAt = new Date().toISOString();
    return contract;
  }

  approve(id: string, approvedBy: string): ContractDefinition {
    const contract = this.mustGet(id);
    contract.status = "active";
    contract.approvedBy = approvedBy;
    contract.updatedAt = new Date().toISOString();
    void platformEventBus.publish({ type: "ContractSigned", organizationId: contract.organizationId, payload: { contractId: id, kind: contract.kind, value: contract.value } });
    return contract;
  }

  terminate(id: string): ContractDefinition {
    const contract = this.mustGet(id);
    contract.status = "terminated";
    contract.updatedAt = new Date().toISOString();
    return contract;
  }

  renew(id: string, newEndsAt: string): ContractDefinition {
    const contract = this.mustGet(id);
    contract.endsAt = newEndsAt;
    contract.status = "active";
    contract.updatedAt = new Date().toISOString();
    return contract;
  }

  get(id: string): ContractDefinition | undefined {
    return this.contracts.get(id);
  }

  listForOrganization(organizationId: string): ContractDefinition[] {
    return Array.from(this.contracts.values()).filter(c => c.organizationId === organizationId);
  }

  private mustGet(id: string): ContractDefinition {
    const contract = this.contracts.get(id);
    if (!contract) throw new Error(`Contract not found: ${id}`);
    return contract;
  }

  count(): number {
    return this.contracts.size;
  }
}

export const contractEngine = new ContractEngine();
