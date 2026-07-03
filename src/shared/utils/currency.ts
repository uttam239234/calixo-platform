/**
 * Currency formatting utilities.
 */

export function formatCurrency(
  amount: number,
  currency: string = 'USD',
  locale: string = 'en-US'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatCompactCurrency(amount: number, currency: string = 'USD'): string {
  if (amount >= 1_000_000_000) {
    return `${formatCurrency(amount / 1_000_000_000, currency).replace(/\.00$/, '')}B`;
  }
  if (amount >= 1_000_000) {
    return `${formatCurrency(amount / 1_000_000, currency).replace(/\.00$/, '')}M`;
  }
  if (amount >= 1_000) {
    return `${formatCurrency(amount / 1_000, currency).replace(/\.00$/, '')}K`;
  }
  return formatCurrency(amount, currency);
}

export function formatCurrencyDelta(amount: number, currency: string = 'USD'): string {
  const prefix = amount >= 0 ? '+' : '';
  return `${prefix}${formatCurrency(amount, currency)}`;
}

export function parseCurrency(value: string): number {
  const cleaned = value.replace(/[^0-9.\-]/g, '');
  return parseFloat(cleaned) || 0;
}

export const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  CAD: 'C$',
  AUD: 'A$',
  INR: '₹',
};