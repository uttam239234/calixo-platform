/**
 * Calixo Platform - Invoice Platform API
 */
import { invoiceEngine, type CreateInvoiceOptions } from "./InvoiceEngine";
import type { CreditNote, Invoice, InvoiceLineItem, Refund } from "./types";

export class InvoicePlatformAPI {
  create(organizationId: string, lineItems: InvoiceLineItem[], options?: CreateInvoiceOptions): Invoice {
    return invoiceEngine.create(organizationId, lineItems, options);
  }

  issue(id: string): Invoice {
    return invoiceEngine.issue(id);
  }

  markPaid(id: string): Invoice {
    return invoiceEngine.markPaid(id);
  }

  markOverdue(id: string): Invoice {
    return invoiceEngine.markOverdue(id);
  }

  voidInvoice(id: string): Invoice {
    return invoiceEngine.voidInvoice(id);
  }

  issueCreditNote(invoiceId: string, amount: number, reason: string): CreditNote {
    return invoiceEngine.issueCreditNote(invoiceId, amount, reason);
  }

  requestRefund(invoiceId: string, amount: number, reason: string): Refund {
    return invoiceEngine.requestRefund(invoiceId, amount, reason);
  }

  get(id: string): Invoice | undefined {
    return invoiceEngine.get(id);
  }

  listForOrganization(organizationId: string): Invoice[] {
    return invoiceEngine.listForOrganization(organizationId);
  }
}

export const invoicePlatformAPI = new InvoicePlatformAPI();
