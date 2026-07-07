/**
 * Calixo Platform - Add-On Platform
 *
 * Additional users/storage/connectors/AI/API/reports/workspaces/premium
 * support/custom packages as registrable, subscribable add-ons layered on
 * top of a base subscription.
 */
import { generateId } from "@/shared/utils/string";
import type { AddOnDefinition, AddOnSubscription } from "./types";

export class AddOnRegistry {
  private addOns = new Map<string, AddOnDefinition>();
  private subscriptions: AddOnSubscription[] = [];

  register(definition: AddOnDefinition): AddOnDefinition {
    this.addOns.set(definition.id, definition);
    return definition;
  }

  get(id: string): AddOnDefinition | undefined {
    return this.addOns.get(id);
  }

  list(): AddOnDefinition[] {
    return Array.from(this.addOns.values());
  }

  subscribe(organizationId: string, addOnId: string, quantity = 1): AddOnSubscription {
    if (!this.addOns.has(addOnId)) throw new Error(`Unknown add-on: ${addOnId}`);
    const subscription: AddOnSubscription = { id: generateId(14), organizationId, addOnId, quantity, activatedAt: new Date().toISOString() };
    this.subscriptions.push(subscription);
    return subscription;
  }

  listForOrganization(organizationId: string): AddOnSubscription[] {
    return this.subscriptions.filter(s => s.organizationId === organizationId);
  }

  /** Sums additional limit granted by an organization's active add-ons for a given usage type — the amount `QuotaEngine` should add on top of the tier's base quota. */
  getAdditionalLimit(organizationId: string, usageTypeId: string): number {
    return this.listForOrganization(organizationId)
      .map(s => ({ sub: s, addOn: this.addOns.get(s.addOnId) }))
      .filter(({ addOn }) => addOn?.usageTypeId === usageTypeId)
      .reduce((sum, { sub, addOn }) => sum + (addOn?.additionalLimit ?? 0) * sub.quantity, 0);
  }

  count(): number {
    return this.addOns.size;
  }
}

export const addOnRegistry = new AddOnRegistry();
