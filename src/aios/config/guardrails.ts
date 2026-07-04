/**
 * Calixo Platform - AIOS Guardrail Configuration
 *
 * Central guardrail configuration for content safety, rate limits,
 * sensitive data filtering, and prompt validation.
 */

import type { GuardrailConfig, GuardrailType } from '@/aios/types';

export interface GuardrailRule {
  type: GuardrailType;
  enabled: boolean;
  severity: 'info' | 'warning' | 'error' | 'critical';
  action: 'allow' | 'block' | 'warn' | 'modify';
  description: string;
}

export const DEFAULT_GUARDRAIL_RULES: GuardrailRule[] = [
  {
    type: 'permission',
    enabled: true,
    severity: 'error',
    action: 'block',
    description: 'Validate user permissions before processing AI requests',
  },
  {
    type: 'content_safety',
    enabled: true,
    severity: 'critical',
    action: 'block',
    description: 'Block harmful, illegal, or policy-violating content',
  },
  {
    type: 'prompt_validation',
    enabled: true,
    severity: 'warning',
    action: 'warn',
    description: 'Validate prompt format, length, and structure',
  },
  {
    type: 'sensitive_data',
    enabled: true,
    severity: 'warning',
    action: 'modify',
    description: 'Detect and redact sensitive PII data in prompts',
  },
  {
    type: 'rate_limit',
    enabled: true,
    severity: 'error',
    action: 'block',
    description: 'Enforce rate limits per user and organization',
  },
];

export const CONTENT_SAFETY_PATTERNS = {
  blockedKeywords: [
    'hack', 'exploit', 'malware', 'ransomware',
    'social security number', 'credit card number',
    'password steal', 'phishing', 'ddos', 'botnet',
    'child exploitation', 'terrorism', 'weapons',
  ],
  blockedTopics: [
    'illegal activities',
    'harmful instructions',
    'personal attacks',
    'discriminatory content',
    'self-harm',
  ],
};

export const SENSITIVE_DATA_PATTERNS = [
  { name: 'SSN', pattern: /\b\d{3}-\d{2}-\d{4}\b/g, replacement: '[REDACTED-SSN]' },
  { name: 'Credit Card', pattern: /\b(?:\d{4}[-\s]?){3}\d{4}\b/g, replacement: '[REDACTED-CC]' },
  { name: 'Email', pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g, replacement: '[REDACTED-EMAIL]' },
  { name: 'Phone', pattern: /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, replacement: '[REDACTED-PHONE]' },
  { name: 'API Key', pattern: /\b(sk|pk|api)[-_][A-Za-z0-9]{20,}\b/g, replacement: '[REDACTED-API-KEY]' },
];

export const RATE_LIMIT_CONFIG = {
  requestsPerMinute: 60,
  requestsPerHour: 1000,
  requestsPerDay: 10000,
  tokensPerMinute: 100000,
  tokensPerHour: 1000000,
  cooldownMinutes: 5,
  burstLimit: 10,
};