"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { CheckCircle2, X } from "lucide-react";
import { campaigns as seedCampaigns } from "./mock-data";
import type { Campaign } from "./types";
import { applyCampaignAction, type CampaignAction } from "./campaign-utils";

const STORAGE_KEY = "calixo-ads-campaigns-v1";
interface CampaignContextValue { campaigns: Campaign[]; hydrated: boolean; addCampaign: (campaign: Campaign) => void; updateCampaign: (id: string, updates: Partial<Campaign>) => void; actOnCampaigns: (ids: string[], action: CampaignAction) => void; showToast: (message: string) => void; }
const CampaignContext = createContext<CampaignContextValue | null>(null);

export function CampaignProvider({ children }: { children: ReactNode }) {
  const [campaigns, setCampaigns] = useState<Campaign[]>(seedCampaigns); const [hydrated, setHydrated] = useState(false); const [toast, setToast] = useState("");
  useEffect(() => { let active = true; queueMicrotask(() => { if (!active) return; let storedCampaigns = seedCampaigns; try { const stored = localStorage.getItem(STORAGE_KEY); if (stored) storedCampaigns = JSON.parse(stored) as Campaign[]; } catch { localStorage.removeItem(STORAGE_KEY); } setCampaigns(storedCampaigns); setHydrated(true); }); return () => { active = false; }; }, []);
  useEffect(() => { if (hydrated) localStorage.setItem(STORAGE_KEY, JSON.stringify(campaigns)); }, [campaigns, hydrated]);
  useEffect(() => { if (!toast) return; const timer = window.setTimeout(() => setToast(""), 3200); return () => window.clearTimeout(timer); }, [toast]);
  const showToast = useCallback((message: string) => setToast(message), []);
  const addCampaign = useCallback((campaign: Campaign) => setCampaigns((items) => [...items, campaign]), []);
  const updateCampaign = useCallback((id: string, updates: Partial<Campaign>) => setCampaigns((items) => items.map((item) => item.id === id ? { ...item, ...updates } : item)), []);
  const actOnCampaigns = useCallback((ids: string[], action: CampaignAction) => setCampaigns((items) => applyCampaignAction(items, ids, action)), []);
  const value = useMemo(() => ({ campaigns, hydrated, addCampaign, updateCampaign, actOnCampaigns, showToast }), [campaigns, hydrated, addCampaign, updateCampaign, actOnCampaigns, showToast]);
  return <CampaignContext.Provider value={value}>{children}{toast && <div role="status" className="fixed bottom-6 right-6 z-50 flex max-w-sm items-center gap-3 rounded-2xl border border-emerald-500/30 bg-slate-900 px-4 py-3 text-sm text-white shadow-2xl"><CheckCircle2 size={18} className="text-emerald-400" /><span>{toast}</span><button onClick={() => setToast("")} className="ml-2 text-slate-500 hover:text-white"><X size={15} /></button></div>}</CampaignContext.Provider>;
}

export function useCampaigns() { const context = useContext(CampaignContext); if (!context) throw new Error("useCampaigns must be used within CampaignProvider"); return context; }
