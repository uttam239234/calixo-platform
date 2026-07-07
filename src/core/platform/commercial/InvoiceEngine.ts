/**
 * Calixo Platform - Invoice Platform
 *
 * Real structured invoice/credit-note/refund records with genuine line-item
 * arithmetic (subtotal/tax/discount/total) — no PDF generation, no real tax
 * jurisdiction engine (GST/VAT are a `taxLabel` + flat `taxPercent` param,
 * not a compliance-grade calculator).
 */
import { generateId } from "@/shared/utils/string";
import { platformEventBus } from "@/core/platform/events/PlatformEventBus";
import type { CreditNote, Invoice, InvoiceLineItem, Refund } from "./types";

export interface CreateInvoiceOptions {
  taxPercent?: number;
  taxLabel?: string;
  discountAmount?: number;
  currency?: string;
  dueAt?: string;
  isManual?: boolean;
  isRecurring?: boolean;
}

export class InvoiceEngine {
  private invoices = new Map<string, Invoice>();
  private creditNotes: CreditNote[] = [];
  private refunds: Refund[] = [];

  create(organizationId: string, lineItems: InvoiceLineItem[], options: CreateInvoiceOptions = {}): Invoice {
    const subtotal = Math.round(lineItems.reduce((sum, l) => sum + l.amount, 0) * 100) / 100;
    const taxAmount = Math.round(subtotal * ((options.taxPercent ?? 0) / 100) * 100) / 100;
    const discountAmount = options.discountAmount ?? 0;
    const total = Math.max(0, Math.round((subtotal + taxAmount - discountAmount) * 100) / 100);
    const now = new Date().toISOString();
    const invoice: Invoice = {
      id: generateId(16),
      organizationId,
      status: "draft",
      lineItems,
      subtotal,
      taxAmount,
      taxLabel: options.taxLabel,
      discountAmount,
      total,
      currency: options.currency ?? "USD",
      dueAt: options.dueAt,
      isManual: options.isManual ?? false,
      isRecurring: options.isRecurring ?? false,
      createdAt: now,
    };
    this.invoices.set(invoice.id, invoice);
    return invoice;
  }

  issue(id: string): Invoice {
    const invoice = this.mustGet(id);
    invoice.status = "issued";
    invoice.issuedAt = new Date().toISOString();
    void platformEventBus.publish({ type: "InvoiceGenerated", organizationId: invoice.organizationId, payload: { invoiceId: id, total: invoice.total, currency: invoice.currency } });
    return invoice;
  }

  markPaid(id: string): Invoice {
    const invoice = this.mustGet(id);
    invoice.status = "paid";
    invoice.paidAt = new Date().toISOString();
    return invoice;
  }

  markOverdue(id: string): Invoice {
    const invoice = this.mustGet(id);
    invoice.status = "overdue";
    return invoice;
  }

  voidInvoice(id: string): Invoice {
    const invoice = this.mustGet(id);
    invoice.status = "void";
    return invoice;
  }

  issueCreditNote(invoiceId: string, amount: number, reason: string): CreditNote {
    this.mustGet(invoiceId);
    const note: CreditNote = { id: generateId(14), invoiceId, amount, reason, issuedAt: new Date().toISOString() };
    this.creditNotes.push(note);
    return note;
  }

  requestRefund(invoiceId: string, amount: number, reason: string): Refund {
    const invoice = this.mustGet(invoiceId);
    const refund: Refund = { id: generateId(14), invoiceId, amount, reason, status: "pending", requestedAt: new Date().toISOString() };
    this.refunds.push(refund);
    invoice.status = "refunded";
    return refund;
  }

  get(id: string): Invoice | undefined {
    return this.invoices.get(id);
  }

  listForOrganization(organizationId: string): Invoice[] {
    return Array.from(this.invoices.values()).filter(i => i.organizationId === organizationId).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  getCreditNotes(invoiceId: string): CreditNote[] {
    return this.creditNotes.filter(c => c.invoiceId === invoiceId);
  }

  getRefunds(invoiceId: string): Refund[] {
    return this.refunds.filter(r => r.invoiceId === invoiceId);
  }

  private mustGet(id: string): Invoice {
    const invoice = this.invoices.get(id);
    if (!invoice) throw new Error(`Invoice not found: ${id}`);
    return invoice;
  }

  count(): number {
    return this.invoices.size;
  }
}

export const invoiceEngine = new InvoiceEngine();
