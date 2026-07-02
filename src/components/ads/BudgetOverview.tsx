import { WalletCards } from "lucide-react";
import Card from "@/components/dashboard/common/Card";
import { budget } from "@/features/ads/mock-data";

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", notation: "compact", maximumFractionDigits: 1 });

export function BudgetOverview() {
  const used = Math.round((budget.spent / budget.total) * 100);
  return <Card className="p-5" hover={false}><div className="flex items-center justify-between"><div><p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Budget overview</p><h3 className="mt-1 font-semibold text-white">{budget.period}</h3></div><span className="rounded-xl bg-cyan-500/10 p-2.5 text-cyan-300"><WalletCards size={19} /></span></div>
    <div className="mt-6 flex items-end justify-between"><div><span className="text-3xl font-semibold text-white">{currency.format(budget.spent)}</span><span className="text-sm text-slate-500"> / {currency.format(budget.total)}</span></div><span className="text-sm font-medium text-cyan-300">{used}% used</span></div>
    <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-800"><div className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500" style={{ width: `${used}%` }} /></div>
    <div className="mt-5 grid grid-cols-2 gap-3"><div className="rounded-2xl bg-slate-950/50 p-3"><p className="text-xs text-slate-500">Remaining</p><p className="mt-1 font-semibold text-white">{currency.format(budget.remaining)}</p></div><div className="rounded-2xl bg-slate-950/50 p-3"><p className="text-xs text-slate-500">Projected</p><p className="mt-1 font-semibold text-white">{currency.format(budget.projected)}</p></div></div>
  </Card>;
}
