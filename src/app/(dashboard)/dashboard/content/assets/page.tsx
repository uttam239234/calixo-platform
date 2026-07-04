"use client";

import { ContentHeader } from "@/components/content/ContentSharedComponents";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { contentAssets } from "@/lib/content-data";
import { FileText, Image as ImageIcon, Video, File, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

const typeIcons: Record<string, React.ComponentType<{ size?: number; className?: string }>> = { image: ImageIcon, video: Video, document: FileText, audio: File };

export default function AssetsPage() {
  return (
    <div className="space-y-6 pb-8">
      <ContentHeader title="Asset Library" description={`${contentAssets.length} assets`}>
        <Button size="sm" className="gap-2"><Plus size={14} /> Upload</Button>
      </ContentHeader>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {contentAssets.slice(0, 20).map((asset) => {
          const Icon = typeIcons[asset.type] || File;
          return (
            <motion.div key={asset.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <Card padding="sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-700/50">
                    <Icon size={18} className="text-slate-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-white truncate">{asset.name}</p>
                    <p className="text-[10px] text-slate-500">{asset.format} • {asset.size}</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}