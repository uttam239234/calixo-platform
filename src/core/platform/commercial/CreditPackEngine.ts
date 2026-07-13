/**
 * Calixo Platform - Credit Pack Catalog
 *
 * The real, single source of truth for purchasable AI credit packs — built
 * for the Internal Plan Management Console. Before this, `CREDIT_PACKS` was
 * a hardcoded UI constant in `features/settings/billing/constants.ts` with no
 * backing registry; `BuyCreditsDialog`/`aiCredits.ts` now read from here
 * instead, so editing a pack here takes effect instantly at checkout.
 */
import type { CreditPackDefinition } from "./types";

export class CreditPackEngine {
  private packs = new Map<string, CreditPackDefinition>();

  register(pack: CreditPackDefinition): CreditPackDefinition {
    this.packs.set(pack.id, pack);
    return pack;
  }

  get(id: string): CreditPackDefinition | undefined {
    return this.packs.get(id);
  }

  list(opts: { activeOnly?: boolean } = {}): CreditPackDefinition[] {
    const all = Array.from(this.packs.values()).sort((a, b) => a.order - b.order);
    return opts.activeOnly ? all.filter(p => p.isActive) : all;
  }

  setActive(id: string, isActive: boolean): CreditPackDefinition {
    const pack = this.packs.get(id);
    if (!pack) throw new Error(`Unknown credit pack: ${id}`);
    pack.isActive = isActive;
    return pack;
  }

  /** Moves a pack one position up (`"up"`) or down (`"down"`) in display order by swapping `order` with its neighbor. */
  reorder(id: string, direction: "up" | "down"): CreditPackDefinition[] {
    const ordered = this.list();
    const index = ordered.findIndex(p => p.id === id);
    if (index === -1) throw new Error(`Unknown credit pack: ${id}`);
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= ordered.length) return ordered;
    const a = ordered[index];
    const b = ordered[swapIndex];
    const aOrder = a.order;
    a.order = b.order;
    b.order = aOrder;
    return this.list();
  }

  count(): number {
    return this.packs.size;
  }
}

export const creditPackEngine = new CreditPackEngine();
