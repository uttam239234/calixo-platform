const modules = [
  {
    icon: "📊",
    title: "Analytics",
    description: "Understand your traffic, campaigns, and conversions with AI insights.",
  },
  {
    icon: "📢",
    title: "Ads Manager",
    description: "Manage Google Ads and Meta Ads from one dashboard.",
  },
  {
    icon: "📱",
    title: "Social Media",
    description: "Schedule, publish and manage all your social channels.",
  },
  {
    icon: "🛡️",
    title: "Brand Monitoring",
    description: "Track mentions, sentiment, and competitors in real time.",
  },
  {
    icon: "✍️",
    title: "Content Studio",
    description: "Generate blogs, emails, ads, and social posts using AI.",
  },
  {
    icon: "🤖",
    title: "AI Copilot",
    description: "Ask questions, automate work, and receive intelligent recommendations.",
  },
];

export default function Modules() {
  return (
    <section className="bg-slate-950 py-24">
      <div className="max-w-7xl mx-auto px-8">

        <h2 className="text-center text-5xl font-bold mb-4">
          Explore Calixo Modules
        </h2>

        <p className="text-center text-gray-400 max-w-3xl mx-auto mb-16">
          Everything your marketing team needs in one AI-powered operating system.
        </p>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">

          {modules.map((module) => (

            <div
              key={module.title}
              className="rounded-2xl border border-slate-700 bg-slate-900 p-8 hover:border-cyan-400 transition duration-300 hover:-translate-y-2"
            >

              <div className="text-5xl mb-6">
                {module.icon}
              </div>

              <h3 className="text-2xl font-bold mb-3">
                {module.title}
              </h3>

              <p className="text-gray-400">
                {module.description}
              </p>

            </div>

          ))}

        </div>

      </div>
    </section>
  );
}