/**
 * Calixo Platform - AI Guardrails
 *
 * Permission validation, content safety, prompt validation,
 * sensitive data filtering, and rate limits.
 */

import { appLogger } from '@/logging';
import type { GuardrailResult, GuardrailType, AICompletionRequest } from '@/aios/types';

export class AIGuardrails {
  private rateLimitCounts: Map<string, { count: number; resetAt: number }> = new Map();

  async checkPermission(request: AICompletionRequest): Promise<GuardrailResult> {
    // Permission validation - in production, check against access management
    return {
      passed: true,
      type: 'permission',
      severity: 'info',
      action: 'allow',
    };
  }

  async checkContentSafety(request: AICompletionRequest): Promise<GuardrailResult> {
    const allContent = request.messages.map(m => m.content).join(' ').toLowerCase();

    // Blocked patterns
    const blockedPatterns = [
      /hack/i, /exploit/i, /malware/i, /ransomware/i,
      /social security number/i, /credit card number/i,
      /password.*steal/i, /phishing/i,
    ];

    for (const pattern of blockedPatterns) {
      if (pattern.test(allContent)) {
        return {
          passed: false,
          type: 'content_safety',
          reason: 'Content contains blocked patterns',
          severity: 'critical',
          action: 'block',
        };
      }
    }

    return {
      passed: true,
      type: 'content_safety',
      severity: 'info',
      action: 'allow',
    };
  }

  async checkPromptValidation(request: AICompletionRequest): Promise<GuardrailResult> {
    const lastMessage = request.messages[request.messages.length - 1];
    if (!lastMessage || !lastMessage.content.trim()) {
      return {
        passed: false,
        type: 'prompt_validation',
        reason: 'Empty message content',
        severity: 'warning',
        action: 'block',
      };
    }

    // Max length check
    if (lastMessage.content.length > 100000) {
      return {
        passed: false,
        type: 'prompt_validation',
        reason: 'Message exceeds maximum length of 100000 characters',
        severity: 'warning',
        action: 'block',
      };
    }

    return {
      passed: true,
      type: 'prompt_validation',
      severity: 'info',
      action: 'allow',
    };
  }

  async checkSensitiveData(request: AICompletionRequest): Promise<GuardrailResult> {
    const allContent = request.messages.map(m => m.content).join(' ');

    // Sensitive data patterns
    const sensitivePatterns = [
      /\b\d{3}-\d{2}-\d{4}\b/, // SSN
      /\b(?:\d{4}[-\s]?){3}\d{4}\b/, // Credit card
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/, // Email
    ];

    for (const pattern of sensitivePatterns) {
      if (pattern.test(allContent)) {
        return {
          passed: false,
          type: 'sensitive_data',
          reason: 'Request contains potentially sensitive data',
          severity: 'warning',
          action: 'modify',
        };
      }
    }

    return {
      passed: true,
      type: 'sensitive_data',
      severity: 'info',
      action: 'allow',
    };
  }

  async checkRateLimit(userId: string): Promise<GuardrailResult> {
    const now = Date.now();
    const key = `rate:${userId}`;
    const current = this.rateLimitCounts.get(key);

    // Reset if expired (1 minute window)
    if (!current || now > current.resetAt) {
      this.rateLimitCounts.set(key, { count: 1, resetAt: now + 60000 });
      return { passed: true, type: 'rate_limit', severity: 'info', action: 'allow' };
    }

    // Max 60 requests per minute
    if (current.count >= 60) {
      return {
        passed: false,
        type: 'rate_limit',
        reason: 'Rate limit exceeded. Max 60 requests per minute.',
        severity: 'error',
        action: 'block',
      };
    }

    current.count++;
    return { passed: true, type: 'rate_limit', severity: 'info', action: 'allow' };
  }

  async validateAll(request: AICompletionRequest): Promise<GuardrailResult[]> {
    const results: GuardrailResult[] = [];

    const checks = [
      this.checkPermission(request),
      this.checkContentSafety(request),
      this.checkPromptValidation(request),
      this.checkSensitiveData(request),
    ];

    if (request.userId) {
      checks.push(this.checkRateLimit(request.userId));
    }

    const guardrailResults = await Promise.all(checks);

    for (const result of guardrailResults) {
      results.push(result);
      if (result.action === 'block') {
        appLogger.warn('AIGuardrails', `Guardrail blocked: ${result.type} - ${result.reason}`);
        break;
      }
    }

    return results;
  }
}

export const aiGuardrails = new AIGuardrails();