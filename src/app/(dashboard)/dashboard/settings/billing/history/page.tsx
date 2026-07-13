"use client";

import { Download } from "lucide-react";
import { ModuleHeader } from "@/components/enterprise/module";
import { Button } from "@/components/ui/button";
import { useSettingsContext } from "@/features/settings/SettingsProvider";
import { useBilling } from "@/hooks/useBilling";

const STATUS_LABELS: Record<string, string> = {
  paid: "Paid",
  issued: "Awaiting Payment",
  overdue: "Overdue",
  draft: "Preparing",
  void: "Voided",
  refunded: "Refunded",
};

const STATUS_CLASSES: Record<string, string> = {
  paid: "text-success bg-success/10 border-success/20",
  issued: "text-primary bg-primary/10 border-primary/20",
  overdue: "text-destructive bg-destructive/10 border-destructive/20",
  draft: "text-muted-foreground bg-muted/10 border-border/60",
  void: "text-muted-foreground bg-muted/10 border-border/60",
  refunded: "text-warning bg-warning/10 border-warning/20",
};

export default function BillingHistoryPage() {
  const { tenantContext } = useSettingsContext();
  const organizationId = tenantContext.organizationId;
  const billing = useBilling(organizationId);

  return (
    <div>
      <ModuleHeader title="Billing History" description="Your past invoices, and their status." />

      {billing.loading ? (
        <p className="text-sm text-muted-foreground">Loading your billing history…</p>
      ) : billing.invoices.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">No invoices yet.</p>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted-foreground">
                <th className="px-5 py-3 font-medium">Date</th>
                <th className="px-5 py-3 font-medium">Amount</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {billing.invoices.map(invoice => (
                <tr key={invoice.id} className="border-b border-border last:border-none">
                  <td className="px-5 py-3.5 text-foreground">
                    {new Date(invoice.paidAt ?? invoice.issuedAt ?? invoice.createdAt).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                  <td className="px-5 py-3.5 font-medium text-foreground">${invoice.total.toFixed(2)}</td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${STATUS_CLASSES[invoice.status]}`}>{STATUS_LABELS[invoice.status]}</span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <Button size="xs" variant="outline" onClick={() => billing.downloadInvoice(invoice)}>
                      <Download size={12} /> Download
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
