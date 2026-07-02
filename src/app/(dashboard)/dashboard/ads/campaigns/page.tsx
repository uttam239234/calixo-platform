import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CampaignList } from "@/components/ads/campaigns/CampaignList";
export default function CampaignsPage() { return <div className="space-y-6 pb-8"><div><Link href="/dashboard/ads" className="mb-3 inline-flex items-center gap-2 text-xs text-slate-400 hover:text-cyan-300"><ArrowLeft size={14} /> Ads Manager</Link><h1 className="text-3xl font-semibold text-white">Campaign management</h1><p className="mt-2 text-sm text-slate-400">Create, monitor, and optimize campaigns across every advertising platform.</p></div><CampaignList /></div>; }
