import { conversionFunnel } from "./mock-data";

export function ConversionFunnel() {
  return (
    <section className="rounded-[28px] border border-slate-800 bg-slate-900/80 p-6 shadow-[0_12px_50px_rgba(2,8,23,0.25)]">
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-white">Conversion Funnel</h2>
        <p className="mt-1 text-sm text-slate-400">How qualified demand moves through the lifecycle</p>
      </div>

      <div className="space-y-3">
        {conversionFunnel.map((stage) => (
          <div key={stage.stage}>
            <div className="mb-2 flex items-center justify-between text-sm text-slate-400">
              <span>{stage.stage}</span>
              <span>{stage.value.toLocaleString()}</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-slate-800">
              <div className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-sky-400 to-emerald-400" style={{ width: `${Math.max(stage.percent, 8)}%` }} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
