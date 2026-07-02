export default function Hero() {
  return (
    <section className="flex flex-col items-center justify-center text-center py-32 px-8">
      <div className="max-w-5xl">
        <span className="inline-block rounded-full border border-cyan-500/40 bg-cyan-500/10 px-4 py-2 text-sm text-cyan-300">
          🚀 AI First Marketing Operating System
        </span>

        <h1 className="mt-8 text-6xl font-extrabold leading-tight">
          Grow Faster with
          <span className="text-cyan-400"> AI-Powered </span>
          Marketing
        </h1>

        <p className="mt-8 text-xl text-gray-400 max-w-3xl mx-auto">
          Calixo unifies Analytics, Google Ads, Meta Ads,
          Social Media Management, Brand Monitoring and AI
          Content Creation into one intelligent platform.
        </p>

        <div className="mt-12 flex justify-center gap-6">
          <button className="rounded-xl bg-cyan-500 px-8 py-4 font-semibold hover:bg-cyan-600">
            Start Free Trial
          </button>

          <button className="rounded-xl border border-slate-600 px-8 py-4 hover:bg-slate-800">
            Watch Demo
          </button>
        </div>
      </div>
    </section>
  );
}