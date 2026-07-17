"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, ChevronLeft, Rocket, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/Card";
import { useCampaigns } from "@/features/ads/CampaignProvider";
import { createCampaignId } from "@/features/ads/campaign-utils";
import type { Campaign } from "@/core/ads";

const steps = ["Platform", "Objective", "Name", "Budget", "Audience", "Keywords", "Creatives", "Review", "Publish"];
const objectives = ["Conversions", "Lead generation", "Revenue", "Awareness", "Traffic", "Engagement"];

export function CampaignWizard() {
  const router = useRouter();
  const { platforms, currentUserName, tenantContext, addCampaign, showToast } = useCampaigns();
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState("");
  const [publishError, setPublishError] = useState("");
  const [uploadedCreative, setUploadedCreative] = useState("");
  const [form, setForm] = useState({
    platform: "google",
    objective: "Conversions",
    name: "",
    budget: "10000",
    audience: "High-intent professionals",
    keywords: "marketing automation, growth platform",
    creatives: "Product demo video, Brand image",
  });
  const set = (key: string, value: string) => setForm(x => ({ ...x, [key]: value }));

  const validate = () => {
    const message =
      step === 2 && !form.name.trim() ? "Campaign name is required." :
      step === 3 && Number(form.budget) <= 0 ? "Budget must be greater than zero." :
      step === 4 && !form.audience.trim() ? "Audience is required." :
      step === 5 && !form.keywords.trim() ? "Add at least one keyword." :
      step === 6 && !form.creatives.trim() ? "Add at least one creative." : "";
    setErrors(message);
    return !message;
  };

  const publish = () => {
    const now = new Date().toISOString().slice(0, 10);
    const campaign: Campaign = {
      id: createCampaignId(),
      platformId: form.platform,
      name: form.name.trim(),
      objective: form.objective,
      budget: Number(form.budget),
      spend: 0,
      status: "Running",
      conversions: 0,
      ctr: 0,
      roas: 0,
      revenue: 0,
      clicks: 0,
      impressions: 0,
      cpa: 0,
      qualityScore: 7,
      owner: currentUserName,
      createdAt: now,
      startDate: now,
      endDate: new Date(Date.now() + 90 * 86400000).toISOString().slice(0, 10),
      audience: form.audience.trim(),
      keywords: form.keywords.split(",").map(x => x.trim()).filter(Boolean),
      creatives: form.creatives.split(",").filter(x => x.trim()).length,
      organizationId: tenantContext.organizationId,
    };
    setPublishError("");
    try {
      addCampaign(campaign);
    } catch (error) {
      setPublishError(error instanceof Error ? error.message : "Failed to publish campaign. Please try again.");
      return;
    }
    showToast(`"${campaign.name}" created successfully.`);
    router.push("/dashboard/ads/campaigns");
  };

  const next = () => {
    if (!validate()) return;
    setErrors("");
    if (step === 8) publish();
    else setStep(x => x + 1);
  };

  return (
    <div className="mx-auto max-w-5xl pb-8">
      <Link href="/dashboard/ads/campaigns" className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors">
        <ArrowLeft size={14} /> Cancel and return
      </Link>

      <div className="mt-5">
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-primary">Campaign builder</p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Create a new campaign</h1>
        <p className="mt-2 text-sm text-muted-foreground">A guided setup across every connected advertising platform.</p>
      </div>

      {/* Stepper */}
      <div className="mt-7 overflow-x-auto">
        <div className="flex min-w-[760px] items-center">
          {steps.map((label, i) => (
            <div key={label} className="flex flex-1 items-center">
              <div className="flex flex-col items-center gap-2">
                <span className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-semibold transition-all duration-200 ${
                  i < step
                    ? "border-primary bg-primary text-primary-foreground"
                    : i === step
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground"
                }`}>
                  {i < step ? <Check size={14} /> : i + 1}
                </span>
                <span className={`text-[10px] font-medium ${i === step ? "text-primary" : "text-muted-foreground"}`}>
                  {label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <span className={`mb-5 h-0.5 flex-1 rounded-full transition-all duration-300 ${i < step ? "bg-primary" : "bg-border"}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <Card className="mt-7">
        <CardContent>
          <div className="mb-7">
            <span className="text-xs text-muted-foreground">Step {step + 1} of 9</span>
            <h2 className="mt-1 text-xl font-semibold text-foreground">
              {["Select an advertising platform", "Choose your campaign objective", "Name your campaign", "Set your budget", "Define your audience", "Add keywords", "Upload campaign creatives", "Review your campaign", "Publish campaign"][step]}
            </h2>
          </div>

          {step === 0 && (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {platforms.map(p => (
                <button
                  key={p.id}
                  onClick={() => set("platform", p.id)}
                  className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition-all duration-150 ${
                    form.platform === p.id
                      ? "border-primary/60 bg-primary/5"
                      : "border-border bg-card/50 hover:border-border/80 hover:bg-accent/50"
                  }`}
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl font-bold text-sm" style={{ color: p.color, background: `${p.color}20` }}>
                    {p.shortName}
                  </span>
                  <span>
                    <span className="block text-sm font-medium text-foreground">{p.name}</span>
                    <span className="text-xs text-muted-foreground">{p.status}</span>
                  </span>
                </button>
              ))}
            </div>
          )}

          {step === 1 && (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {objectives.map(x => (
                <button
                  key={x}
                  onClick={() => set("objective", x)}
                  className={`rounded-2xl border p-5 text-left transition-all duration-150 ${
                    form.objective === x
                      ? "border-primary/60 bg-primary/5"
                      : "border-border text-muted-foreground hover:border-border/80 hover:bg-accent/50"
                  }`}
                >
                  <Sparkles size={18} className="mb-3 text-primary" />
                  <span className="font-medium text-foreground">{x}</span>
                </button>
              ))}
            </div>
          )}

          {step === 2 && (
            <div className="max-w-xl">
              <label className="block text-sm font-medium text-foreground mb-2">Campaign name</label>
              <input
                value={form.name}
                onChange={e => set("name", e.target.value)}
                placeholder="e.g. Q3 Enterprise Growth — Search"
                className="input"
              />
            </div>
          )}

          {step === 3 && (
            <div className="max-w-md space-y-5">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Total campaign budget (USD)</label>
                <input
                  type="number"
                  value={form.budget}
                  onChange={e => set("budget", e.target.value)}
                  className="input"
                />
              </div>
              <div className="rounded-2xl border border-border/50 bg-card/50 p-4 text-xs text-muted-foreground">
                Estimated daily budget: <span className="font-medium text-foreground">${Math.round(Number(form.budget || 0) / 30).toLocaleString()}</span>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="max-w-xl space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Audience name</label>
                <input value={form.audience} onChange={e => set("audience", e.target.value)} className="input" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                {["India, UK & US", "Ages 24–54", "English", "All devices"].map(x => (
                  <button
                    key={x}
                    onClick={() => set("audience", x)}
                    className={`rounded-xl border p-3 text-left text-xs transition-all duration-150 ${
                      form.audience === x
                        ? "border-primary/60 bg-primary/5 text-primary"
                        : "border-border/50 bg-card/50 text-muted-foreground hover:border-border/80"
                    }`}
                  >
                    ✓ {x}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="max-w-xl">
              <label className="block text-sm font-medium text-foreground mb-2">Keywords (comma separated)</label>
              <input value={form.keywords} onChange={e => set("keywords", e.target.value)} className="input" />
            </div>
          )}

          {step === 6 && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Creative assets</label>
              <input value={form.creatives} onChange={e => set("creatives", e.target.value)} className="input" />
              <button
                onClick={() => {
                  const file = "calixo-campaign-creative.png";
                  setUploadedCreative(file);
                  set("creatives", form.creatives ? `${form.creatives}, ${file}` : file);
                }}
                className="mt-4 w-full rounded-2xl border border-dashed border-border p-8 text-sm text-muted-foreground hover:border-primary/40 hover:text-primary transition-all duration-150"
              >
                Simulate creative upload
              </button>
              {uploadedCreative && (
                <div className="mt-3 flex items-center gap-3 rounded-2xl border border-success/20 bg-success/5 p-3">
                  <div className="flex h-12 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-primary/30 to-ai/20 text-xs text-primary">PNG</div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{uploadedCreative}</p>
                    <p className="mt-0.5 text-xs text-success">Upload complete</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {(step === 7 || step === 8) && (
            <div className="grid gap-3 sm:grid-cols-2">
              {Object.entries(form).map(([key, value]) => (
                <div key={key} className="rounded-2xl border border-border/50 bg-card/50 p-4">
                  <p className="text-xs capitalize text-muted-foreground">{key}</p>
                  <p className="mt-1 text-sm font-medium text-foreground">
                    {key === "platform" ? platforms.find(p => p.id === value)?.name : value || "Not provided"}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {errors && <p className="mt-3 text-sm text-destructive">{errors}</p>}
      {publishError && <p className="mt-3 text-sm text-destructive">{publishError}</p>}

      <div className="mt-5 flex items-center justify-between">
        <Button variant="outline" disabled={step === 0} onClick={() => { setErrors(""); setStep(x => x - 1); }}>
          <ChevronLeft size={16} /> Back
        </Button>
        <Button variant="primary" onClick={next}>
          {step === 8 ? "Publish campaign" : "Continue"}
          {step === 8 ? <Rocket size={16} /> : <ArrowRight size={16} />}
        </Button>
      </div>
    </div>
  );
}