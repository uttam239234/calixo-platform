"use client";

import { motion } from "framer-motion";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/button";
import { ModuleReportsToolbar } from "@/components/enterprise/module";
import { useBrandMonitoring } from "@/features/brand/BrandMonitoringProvider";
import { FileText, Download, Clock, Eye, FileDown, BarChart3, Calendar } from "lucide-react";

const typeIcons: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  weekly: Clock,
  monthly: Calendar,
  quarterly: Calendar,
  executive: BarChart3,
};

const formatIcons: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  PDF: FileText,
  CSV: FileDown,
  Excel: FileDown,
};

const TYPE_OVERVIEW: { type: string; label: string; iconBg: string; iconText: string }[] = [
  { type: 'weekly', label: 'Weekly Reports', iconBg: 'bg-success/20 border-success/30', iconText: 'text-success' },
  { type: 'monthly', label: 'Monthly Reports', iconBg: 'bg-info/20 border-info/30', iconText: 'text-info' },
  { type: 'quarterly', label: 'Quarterly Reports', iconBg: 'bg-ai/20 border-ai/30', iconText: 'text-ai' },
  { type: 'executive', label: 'Executive Summaries', iconBg: 'bg-primary/20 border-primary/30', iconText: 'text-primary' },
];

export function BrandReports() {
  const { reports, generateReport, previewReport, downloadReport, refreshAll, canCreate, canExport } = useBrandMonitoring();

  return (
    <div className="space-y-6 pb-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-ai/20 border border-ai/30">
              <FileText size={20} className="text-ai" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">Brand Reports</h2>
              <p className="text-sm text-muted-foreground">Automated brand performance reports</p>
            </div>
          </div>
          <ModuleReportsToolbar
            onGenerateReport={() => canCreate && reports[0] && generateReport(reports[0].id)}
            onExport={() => canExport && reports[0] && downloadReport(reports[0].id)}
            onRefresh={refreshAll}
          />
        </div>
      </motion.div>

      {/* Report Type Overview */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.05 }}>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {TYPE_OVERVIEW.map((item) => (
            <Card key={item.type} padding="sm" gradient>
              <div className="flex items-center gap-3">
                <div className={`flex h-9 w-9 items-center justify-center rounded-xl border ${item.iconBg}`}>
                  <FileText size={18} className={item.iconText} />
                </div>
                <div>
                  <p className="text-xl font-bold text-foreground">{reports.filter(r => r.type === item.type).length}</p>
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </motion.div>

      {/* Reports List */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.1 }}>
        <Card>
          <CardHeader title="Generated Reports" description={`${reports.length} reports available`} />
          <CardContent>
            <div className="space-y-3">
              {reports.map((report) => {
                const TypeIcon = typeIcons[report.type] || FileText;
                const FormatIcon = formatIcons[report.format] || FileText;

                return (
                  <div key={report.id} className="flex items-center justify-between p-4 rounded-xl bg-surface/30 border border-border hover:border-primary/30 transition-all">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface flex-shrink-0">
                        <TypeIcon size={18} className="text-muted-foreground" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-semibold text-foreground">{report.name}</h4>
                        <p className="text-xs text-muted-foreground mt-0.5">{report.description}</p>
                        <div className="flex items-center gap-3 mt-1.5 text-[10px] text-muted-foreground flex-wrap">
                          <span className="flex items-center gap-1">
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              report.status === 'ready' ? 'bg-success' :
                              report.status === 'generating' ? 'bg-warning' : 'bg-info'
                            }`} />
                            {report.status}
                          </span>
                          <span className="flex items-center gap-1"><FormatIcon size={11} />{report.format}</span>
                          <span>{report.size}</span>
                          <span>Generated: {report.lastGenerated}</span>
                          <span>Next: {report.nextScheduled}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Button size="sm" variant="outline" className="gap-1.5 h-8 text-xs border-border bg-surface/70 text-foreground" onClick={() => previewReport(report.id)}>
                        <Eye size={12} /> Preview
                      </Button>
                      {canExport && (
                        <Button size="sm" className="gap-1.5 h-8 text-xs" onClick={() => downloadReport(report.id)} disabled={report.status === "generating"}>
                          <Download size={12} /> Download
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
