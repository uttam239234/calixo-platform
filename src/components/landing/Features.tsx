const features = [
  {
    title: "Unified Dashboard",
    description: "Monitor every marketing channel from one intelligent dashboard.",
  },
  {
    title: "AI Analytics",
    description: "Get AI-powered insights and understand why your metrics changed.",
  },
  {
    title: "Ads Manager",
    description: "Create, optimize and manage Google Ads and Meta Ads in one place.",
  },
  {
    title: "Content Studio",
    description: "Generate blogs, social posts, emails and ad creatives using AI.",
  },
];

export default function Features() {
  return (
    <section className="py-24 px-10 bg-slate-900">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-14">
          Everything You Need to Grow
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-2xl border border-slate-700 p-6 bg-slate-950 hover:border-cyan-400 transition"
            >
              <h3 className="text-2xl font-semibold mb-4 text-cyan-400">
                {feature.title}
              </h3>

              <p className="text-gray-400">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}