/**
 * Client-side encryption utilities.
 * NOTE: This is NOT production-grade encryption.
 * For production, use server-side encryption services.
 */

/**
 * Simple base64 encode (not encryption, just encoding).
 */
export function encodeBase64(data: string): string {
  if (typeof btoa !== 'undefined') {
    return btoa(data);
  }
  return Buffer.from(data).toString('base64');
}

/**
 * Simple base64 decode.
 */
export function decodeBase64(encoded: string): string {
  if (typeof atob !== 'undefined') {
    return atob(encoded);
  }
  return Buffer.from(encoded, 'base64').toString();
}

/**
 * Generate a simple hash from a string (not cryptographically secure).
 */
export function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16);
}

/**
 * Create a simple session fingerprint.
 */
export function createFingerprint(): string {
  const components = [
    navigator.userAgent,
    navigator.language,
    screen.colorDepth,
    screen.width,
    screen.height,
  ];
  return simpleHash(components.join('|'));
}

export interface SecureStorage {
  set(key: string, value: unknown): void;
  get<T>(key: string): T | null;
  remove(key: string): void;
}

/**
 * Simple obfuscated storage (NOT truly secure - use server-side for sensitive data).
 */
export const secureStorage: SecureStorage = {
  set(key: string, value: unknown): void {
    try {
      const encoded = encodeBase64(JSON.stringify(value));
      localStorage.setItem(`_calixo_${key}`, encoded);
    } catch {
      // Silently fail
    }
  },

  get<T>(key: string): T | null {
    try {
      const stored = localStorage.getItem(`_calixo_${key}`);
      if (!stored) return null;
      return JSON.parse(decodeBase64(stored)) as T;
    } catch {
      return null;
    }
  },

  remove(key: string): void {
    localStorage.removeItem(`_calixo_${key}`);
  },
};