import { BadgeCheck, PlugZap } from "lucide-react";
import ActionButton from "./common/ActionButton";
import { connectedAccounts } from "./mock-data";

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
        {connectedAccounts.map((account) => (
          <div key={account.id} className="flex items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3">
            <div>
              <p className="font-medium text-white">{account.name}</p>
              <p className="text-sm text-slate-400">{account.status}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-sm text-emerald-300">Healthy</span>
              <ActionButton className="text-slate-300">Reconnect</ActionButton>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
