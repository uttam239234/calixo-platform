"use client";
import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCompetitors } from "@/features/social/competitors/CompetitorProvider";
import type { CompetitorPlatform } from "@/features/social/competitors/types";

const platforms: CompetitorPlatform[] = [
  "Facebook",
  "Instagram",
  "LinkedIn",
  "X",
  "TikTok",
  "YouTube",
  "Pinterest",
  "Threads",
];
const industries = [
  "Marketing Technology",
  "SaaS",
  "Digital Agency",
  "Social Media",
  "Creator Economy",
  "Analytics",
  "E-commerce",
  "AI Software",
];
const countries = [
  "United States",
  "India",
  "United Kingdom",
  "Singapore",
  "Canada",
  "Germany",
  "Australia",
  "France",
];

function CompetitorForm({ editingCompetitor, onClose, onSave }: {
  editingCompetitor: ReturnType<typeof useCompetitors>["editingCompetitor"];
  onClose: () => void;
  onSave: ReturnType<typeof useCompetitors>["saveCompetitor"];
}) {
  const [name, setName] = useState("");
  const [handle, setHandle] = useState("");
  const [platform, setPlatform] = useState<CompetitorPlatform>("Instagram");
  const [industry, setIndustry] = useState("Marketing Technology");
  const [country, setCountry] = useState("United States");
  const [followers, setFollowers] = useState(50000);
  const [engagement, setEngagement] = useState(5);

  if (editingCompetitor) {
    setName(editingCompetitor.name);
    setHandle(editingCompetitor.handle);
    setPlatform(editingCompetitor.platform);
    setIndustry(editingCompetitor.industry);
    setCountry(editingCompetitor.country);
    setFollowers(editingCompetitor.metrics.followers);
    setEngagement(Math.round(editingCompetitor.metrics.engagement));
  }

  const handleSubmit = () => {
    if (!name.trim() || !handle.trim()) return;
    onSave(
      { name: name.trim(), handle: handle.trim(), platform, industry, country, followers, engagement },
      editingCompetitor?.id
    );
  };

  return (
    <div className="w-full max-w-lg rounded-3xl border border-border/60 bg-card p-6 shadow-2xl">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">
          {editingCompetitor ? "Edit Competitor" : "Add Competitor"}
        </h2>
        <button
          onClick={onClose}
          className="rounded-lg p-1.5 text-muted-foreground hover:bg-surface hover:text-foreground"
        >
          <X size={18} />
        </button>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">
              Brand name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. NovaReach"
              className="h-10 w-full rounded-xl border border-border bg-surface/50 px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary/50"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">
              Handle
            </label>
            <input
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              placeholder="e.g. @novareach"
              className="h-10 w-full rounded-xl border border-border bg-surface/50 px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary/50"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">
              Platform
            </label>
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value as CompetitorPlatform)}
              className="h-10 w-full rounded-xl border border-border bg-surface/50 px-3 text-sm text-foreground outline-none focus:border-primary/50"
            >
              {platforms.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">
              Industry
            </label>
            <select
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className="h-10 w-full rounded-xl border border-border bg-surface/50 px-3 text-sm text-foreground outline-none focus:border-primary/50"
            >
              {industries.map((ind) => (
                <option key={ind}>{ind}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">
              Country
            </label>
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="h-10 w-full rounded-xl border border-border bg-surface/50 px-3 text-sm text-foreground outline-none focus:border-primary/50"
            >
              {countries.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">
              Followers
            </label>
            <input
              type="number"
              value={followers}
              onChange={(e) => setFollowers(Number(e.target.value))}
              className="h-10 w-full rounded-xl border border-border bg-surface/50 px-3 text-sm text-foreground outline-none focus:border-primary/50"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">
              Engagement %
            </label>
            <input
              type="number"
              step="0.1"
              value={engagement}
              onChange={(e) => setEngagement(Number(e.target.value))}
              className="h-10 w-full rounded-xl border border-border bg-surface/50 px-3 text-sm text-foreground outline-none focus:border-primary/50"
            />
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <Button
          variant="outline"
          className="border-border text-foreground"
          onClick={onClose}
        >
          Cancel
        </Button>
        <Button
          className="bg-primary text-primary-foreground hover:bg-primary/90"
          onClick={handleSubmit}
          disabled={!name.trim() || !handle.trim()}
        >
          {editingCompetitor ? "Update" : "Add Competitor"}
        </Button>
      </div>
    </div>
  );
}

export function CompetitorAddDialog() {
  const {
    dialogOpen,
    closeDialog,
    saveCompetitor,
    editingCompetitor,
  } = useCompetitors();

  if (!dialogOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-sm">
      <CompetitorForm
        key={editingCompetitor?.id ?? "new"}
        editingCompetitor={editingCompetitor}
        onClose={closeDialog}
        onSave={saveCompetitor}
      />
    </div>
  );
}