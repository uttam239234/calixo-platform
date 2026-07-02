import { campaignPerformance } from "./mock-data";

export function CampaignPerformance() {
  return (
    <section className="rounded-[28px] border border-slate-800 bg-slate-900/80 p-6 shadow-[0_12px_50px_rgba(2,8,23,0.25)]">
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-white">Campaign Performance</h2>
        <p className="mt-1 text-sm text-slate-400">High-yield initiatives and conversion efficiency</p>
      </div>

      <div className="space-y-4">
        {campaignPerformance.map((campaign) => (
          <div key={campaign.name} className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold text-white">{campaign.name}</h3>
                <p className="mt-1 text-sm text-slate-400">{campaign.conversions} conversions • {campaign.revenue}</p>
              </div>
              <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-2.5 py-1 text-xs font-semibold text-cyan-200">ROI {campaign.roi}</span>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Clicks</p>
                <p className="mt-1 text-sm font-semibold text-white">{campaign.clicks.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">CTR</p>
                <p className="mt-1 text-sm font-semibold text-white">{campaign.ctr}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">CPC</p>
                <p className="mt-1 text-sm font-semibold text-white">{campaign.cpc}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Spend</p>
                <p className="mt-1 text-sm font-semibold text-white">{campaign.spend}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
