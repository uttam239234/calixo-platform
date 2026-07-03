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
    <div className="w-full max-w-lg rounded-3xl border border-slate-700/60 bg-slate-900 p-6 shadow-2xl">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">
          {editingCompetitor ? "Edit Competitor" : "Add Competitor"}
        </h2>
        <button
          onClick={onClose}
          className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-800 hover:text-white"
        >
          <X size={18} />
        </button>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-xs text-slate-400">
              Brand name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. NovaReach"
              className="h-10 w-full rounded-xl border border-slate-700 bg-slate-800/50 px-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-500/50"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-slate-400">
              Handle
            </label>
            <input
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              placeholder="e.g. @novareach"
              className="h-10 w-full rounded-xl border border-slate-700 bg-slate-800/50 px-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-500/50"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-xs text-slate-400">
              Platform
            </label>
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value as CompetitorPlatform)}
              className="h-10 w-full rounded-xl border border-slate-700 bg-slate-800/50 px-3 text-sm text-white outline-none focus:border-cyan-500/50"
            >
              {platforms.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs text-slate-400">
              Industry
            </label>
            <select
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className="h-10 w-full rounded-xl border border-slate-700 bg-slate-800/50 px-3 text-sm text-white outline-none focus:border-cyan-500/50"
            >
              {industries.map((ind) => (
                <option key={ind}>{ind}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="mb-1 block text-xs text-slate-400">
              Country
            </label>
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="h-10 w-full rounded-xl border border-slate-700 bg-slate-800/50 px-3 text-sm text-white outline-none focus:border-cyan-500/50"
            >
              {countries.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs text-slate-400">
              Followers
            </label>
            <input
              type="number"
              value={followers}
              onChange={(e) => setFollowers(Number(e.target.value))}
              className="h-10 w-full rounded-xl border border-slate-700 bg-slate-800/50 px-3 text-sm text-white outline-none focus:border-cyan-500/50"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-slate-400">
              Engagement %
            </label>
            <input
              type="number"
              step="0.1"
              value={engagement}
              onChange={(e) => setEngagement(Number(e.target.value))}
              className="h-10 w-full rounded-xl border border-slate-700 bg-slate-800/50 px-3 text-sm text-white outline-none focus:border-cyan-500/50"
            />
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <Button
          variant="outline"
          className="border-slate-700 text-slate-300"
          onClick={onClose}
        >
          Cancel
        </Button>
        <Button
          className="bg-cyan-400 text-slate-950 hover:bg-cyan-300"
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <CompetitorForm
        key={editingCompetitor?.id ?? "new"}
        editingCompetitor={editingCompetitor}
        onClose={closeDialog}
        onSave={saveCompetitor}
      />
    </div>
  );
}