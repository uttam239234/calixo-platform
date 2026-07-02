import { channelPerformance } from "./mock-data";

export function ChannelPerformance() {
  return (
    <section className="rounded-[28px] border border-slate-800 bg-slate-900/80 p-6 shadow-[0_12px_50px_rgba(2,8,23,0.25)]">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Channel Performance</h2>
          <p className="mt-1 text-sm text-slate-400">Spend efficiency and pipeline contribution</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-800">
        <table className="min-w-full divide-y divide-slate-800 text-sm">
          <thead className="bg-slate-950/80 text-left text-slate-400">
            <tr>
              <th className="px-4 py-3 font-medium">Channel</th>
              <th className="px-4 py-3 font-medium">Spend</th>
              <th className="px-4 py-3 font-medium">Revenue</th>
              <th className="px-4 py-3 font-medium">ROAS</th>
              <th className="px-4 py-3 font-medium">CPA</th>
              <th className="px-4 py-3 font-medium">Leads</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 bg-slate-900/70">
            {channelPerformance.map((row) => (
              <tr key={row.channel}>
                <td className="px-4 py-3 font-medium text-white">{row.channel}</td>
                <td className="px-4 py-3 text-slate-300">{row.spend}</td>
                <td className="px-4 py-3 text-slate-300">{row.revenue}</td>
                <td className="px-4 py-3 text-slate-300">{row.roas}</td>
                <td className="px-4 py-3 text-slate-300">{row.cpa}</td>
                <td className="px-4 py-3 text-slate-300">{row.leads}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${row.status === "Healthy" ? "bg-emerald-500/10 text-emerald-300" : row.status === "Optimizing" ? "bg-cyan-500/10 text-cyan-300" : "bg-amber-500/10 text-amber-300"}`}>
                    {row.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
