/**
 * Calixo Platform - Billing & Plans: Invoice Receipt Download
 *
 * `InvoiceEngine` has no PDF generation (by its own design — "architecture
 * only" for tax/PDF, per its header comment). Rather than leave "Download"
 * as a dead button, this builds a real, readable receipt from the real
 * `Invoice` record and triggers a genuine browser download — no server-side
 * pipeline invented.
 */
import type { Invoice } from "@/core/platform/commercial";

function escapeHtml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function downloadInvoiceReceipt(invoice: Invoice, organizationName: string, planLabel: string): void {
  const date = new Date(invoice.paidAt ?? invoice.issuedAt ?? invoice.createdAt).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
  const rows = invoice.lineItems
    .map(item => `<tr><td>${escapeHtml(item.description)}</td><td class="amount">$${item.amount.toFixed(2)}</td></tr>`)
    .join("");

  const html = `<!doctype html>
<html><head><meta charset="utf-8"><title>Calixo Receipt — ${invoice.id}</title>
<style>
  body { font-family: -apple-system, "Segoe UI", Roboto, sans-serif; max-width: 480px; margin: 48px auto; color: #171a23; }
  h1 { font-size: 20px; margin-bottom: 4px; }
  .sub { color: #6b7080; font-size: 13px; margin-bottom: 28px; }
  dl { display: grid; grid-template-columns: 1fr auto; gap: 8px 20px; font-size: 14px; margin-bottom: 20px; }
  dt { color: #6b7080; } dd { margin: 0; text-align: right; font-weight: 600; }
  table { width: 100%; border-collapse: collapse; margin-top: 8px; }
  th { text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 0.04em; color: #6b7080; padding: 8px 0; border-bottom: 1px solid #e2e4ec; }
  td { padding: 10px 0; border-bottom: 1px solid #e2e4ec; font-size: 14px; }
  .amount { text-align: right; }
  .total-row td { border-bottom: none; padding-top: 14px; font-size: 16px; font-weight: 700; }
</style></head>
<body>
  <h1>Calixo</h1>
  <p class="sub">Receipt for ${escapeHtml(organizationName)}</p>
  <dl>
    <dt>Plan</dt><dd>${escapeHtml(planLabel)}</dd>
    <dt>Date</dt><dd>${date}</dd>
    <dt>Status</dt><dd>${invoice.status === "paid" ? "Paid" : escapeHtml(invoice.status)}</dd>
  </dl>
  <table>
    <thead><tr><th>Description</th><th class="amount">Amount</th></tr></thead>
    <tbody>
      ${rows}
      <tr class="total-row"><td>Total</td><td class="amount">$${invoice.total.toFixed(2)} ${invoice.currency}</td></tr>
    </tbody>
  </table>
</body></html>`;

  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `calixo-receipt-${invoice.id}.html`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
