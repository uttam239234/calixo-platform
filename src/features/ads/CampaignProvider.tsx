"use client";

import { createContext, useContext, useEffect, useMemo, useState, useCallback, type ReactNode } from "react";
import { X, CheckCircle2 } from "lucide-react";
import { campaigns as initialCampaigns } from "./mock-data";
import { applyCampaignAction } from "./campaign-utils";
import type { Campaign } from "./types";
import type { CampaignAction } from "./campaign-utils";

const CampaignContext = createContext<{
  campaigns: Campaign[];
  hydrated: boolean;
  addCampaign: (campaign: Campaign) => void;
  updateCampaign: ((campaign: Campaign) => void) & ((id: string, partial: Partial<Campaign>) => void);
  actOnCampaigns: (ids: string[], action: CampaignAction) => void;
  showToast: (message: string) => void;
} | undefined>(undefined);

const STORAGE_KEY = "calixo-campaigns";

export function CampaignProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState({ campaigns: initialCampaigns as Campaign[], hydrated: false });
  const [toast, setToast] = useState("");

  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (!active) return;
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as Campaign[];
          setState({ campaigns: parsed, hydrated: true });
        } else {
          setState(x => ({ ...x, hydrated: true }));
        }
      } catch {
        setState(x => ({ ...x, hydrated: true }));
      }
    });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (state.hydrated) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.campaigns));
    }
  }, [state.campaigns, state.hydrated]);

  useEffect(() => {
    if (toast) {
      const id = setTimeout(() => setToast(""), 3000);
      return () => clearTimeout(id);
    }
  }, [toast]);

  const addCampaign = useCallback((campaign: Campaign) => {
    setState(prev => ({ ...prev, campaigns: [...prev.campaigns, campaign] }));
  }, []);

  const updateCampaign = useCallback((idOrCampaign: string | Campaign, partial?: Partial<Campaign>) => {
    if (typeof idOrCampaign === "string" && partial) {
      setState(prev => ({
        ...prev,
        campaigns: prev.campaigns.map(c => c.id === idOrCampaign ? { ...c, ...partial } : c),
      }));
    } else if (typeof idOrCampaign === "object") {
      const campaign = idOrCampaign;
      setState(prev => ({
        ...prev,
        campaigns: prev.campaigns.map(c => c.id === campaign.id ? campaign : c),
      }));
    }
  }, []);

  const actOnCampaigns = useCallback((ids: string[], action: CampaignAction) => {
    setState(prev => ({ ...prev, campaigns: applyCampaignAction(prev.campaigns, ids, action) }));
  }, []);

  const showToast = useCallback((message: string) => {
    setToast(message);
  }, []);

  const value = useMemo(
    () => ({ campaigns: state.campaigns, hydrated: state.hydrated, addCampaign, updateCampaign, actOnCampaigns, showToast }),
    [state.campaigns, state.hydrated, addCampaign, updateCampaign, actOnCampaigns, showToast],
  );

  return (
    <CampaignContext.Provider value={value}>
      {children}
      {toast && (
        <div role="status" className="fixed bottom-6 right-6 z-50 flex max-w-sm items-center gap-3 rounded-2xl border border-success/20 bg-card px-4 py-3 text-sm text-foreground shadow-modal">
          <CheckCircle2 size={18} className="text-success" />
          <span>{toast}</span>
          <button onClick={() => setToast("")} className="ml-2 text-muted-foreground hover:text-foreground">
            <X size={15} />
          </button>
        </div>
      )}
    </CampaignContext.Provider>
  );
}

export function useCampaigns() {
  const context = useContext(CampaignContext);
  if (!context) throw new Error("useCampaigns must be used within CampaignProvider");
  return context;
}