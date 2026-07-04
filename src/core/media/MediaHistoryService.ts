/** Calixo Platform — Media History Service */
import type { MediaHistoryEntry, MediaRequest, MediaResponse } from "./types";

const history: MediaHistoryEntry[] = [];
const MAX_HISTORY = 500;

export const MediaHistoryService = {
  record(entry: Omit<MediaHistoryEntry, "id" | "timestamp">): MediaHistoryEntry {
    const record: MediaHistoryEntry = {
      ...entry, id: `hist-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toISOString(),
    };
    history.push(record);
    if (history.length > MAX_HISTORY) history.shift();
    return record;
  },
  getAll(): MediaHistoryEntry[] { return [...history].reverse(); },
  getByBrand(brand: string): MediaHistoryEntry[] { return history.filter(e => e.brand === brand).reverse(); },
  getByCampaign(campaign: string): MediaHistoryEntry[] { return history.filter(e => e.campaign === campaign).reverse(); },
  getByCreativeDocument(docId: string): MediaHistoryEntry[] { return history.filter(e => e.creativeDocumentId === docId).reverse(); },
  clear(): void { history.length = 0; },
};