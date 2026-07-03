"use client";

import { PlugZap, Globe, Wifi, WifiOff, AlertCircle, Loader2 } from "lucide-react";
import ActionButton from "./common/ActionButton";
import { connectedPlatforms } from "./mock-data";

const statusConfig = {
  connected: { label: "Connected", icon: Wifi, className: "border-emerald-500/20 bg-emerald-500/10 text-emerald-300" },
  syncing: { label: "Syncing", icon: Loader2, className: "border-cyan-500/20 bg-cyan-500/10 text-cyan-300" },
  error: { label: "Error", icon: AlertCircle, className: "border-rose-500/20 bg-rose-500/10 text-rose-300" },
  disconnected: { label: "Disconnected", icon: WifiOff, className: "border-slate-700 bg-slate-800 text-slate-300" },
};

export default function ConnectedAccounts() {
  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Connected accounts</h3>
        <div className="rounded-full bg-cyan-500/10 p-2 text-cyan-300">
          <PlugZap size={16} />
        </div>
      </div>

      <div className="space-y-3">
        {connectedPlatforms.map((account) => {
          const status = statusConfig[account.status as keyof typeof statusConfig] ?? statusConfig.disconnected;
          const StatusIcon = status.icon;
          const color = account.platform === "google" ? "text-blue-500" : account.platform === "meta" ? "text-blue-600" : account.platform === "linkedin" ? "text-blue-700" : account.platform === "instagram" ? "text-pink-500" : "text-red-500";

          return (
            <div key={account.id} className="flex items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3">
              <div className="flex items-center gap-3">
                <div className={color}><Globe size={18} /></div>
                <div>
                  <p className="font-medium text-white">{account.name}</p>
                  <p className="text-sm text-slate-400">{account.lastSync}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium ${status.className}`}>
                  <StatusIcon size={12} className={account.status === "syncing" ? "animate-spin" : ""} />
                  {status.label}
                </span>
                {account.status === "error" && (
                  <ActionButton className="text-slate-300">Retry</ActionButton>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}