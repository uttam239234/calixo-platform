/**
 * Calixo Platform - AI Analytics
 *
 * Tracks tokens, latency, model, cost, errors, tool calls, and success rate.
 */

import { appLogger } from '@/logging';
import { generateId } from '@/shared/utils/string';
import type { AIAnalyticsRecord, AIAnalyticsSummary, AIModel, AIProvider, AIAction } from '@/aios/types';

export class AIAnalytics {
  private records: Map<string, AIAnalyticsRecord> = new Map();

  async record(params: {
    userId?: string; organizationId?: string; workspaceId?: string;
    model: AIModel; provider: AIProvider; action: AIAction;
    promptTokens: number; completionTokens: number; totalTokens: number;
    cost: number; latency: number; success: boolean; error?: string;
    toolCalls: number; sessionId?: string; module?: string; feature?: string;
  }): Promise<AIAnalyticsRecord> {
    const record: AIAnalyticsRecord = {
      id: generateId(16),
      ...params,
      timestamp: new Date().toISOString(),
    };
    this.records.set(record.id, record);
    return { ...record };
  }

  async getSummary(organizationId?: string, periodStart?: string, periodEnd?: string): Promise<AIAnalyticsSummary> {
    let filtered = Array.from(this.records.values());
    if (organizationId) filtered = filtered.filter(r => r.organizationId === organizationId);
    if (periodStart) filtered = filtered.filter(r => new Date(r.timestamp) >= new Date(periodStart));
    if (periodEnd) filtered = filtered.filter(r => new Date(r.timestamp) <= new Date(periodEnd));

    const total = filtered.length;
    if (total === 0) {
      return {
        totalTokens: 0, totalCost: 0, totalRequests: 0, successRate: 0,
        averageLatency: 0, topModels: [], topModules: [], errorsByType: {},
        periodStart: periodStart || '', periodEnd: periodEnd || '',
      };
    }

    const totalTokens = filtered.reduce((s, r) => s + r.totalTokens, 0);
    const totalCost = filtered.reduce((s, r) => s + r.cost, 0);
    const successCount = filtered.filter(r => r.success).length;
    const totalLatency = filtered.reduce((s, r) => s + r.latency, 0);

    // Top models
    const modelCounts: Record<string, { count: number; cost: number }> = {};
    for (const r of filtered) {
      if (!modelCounts[r.model]) modelCounts[r.model] = { count: 0, cost: 0 };
      modelCounts[r.model].count++;
      modelCounts[r.model].cost += r.cost;
    }
    const topModels = Object.entries(modelCounts)
      .sort(([, a], [, b]) => b.count - a.count)
      .slice(0, 5)
      .map(([model, data]) => ({ model: model as AIModel, count: data.count, cost: data.cost }));

    // Top modules
    const moduleCounts: Record<string, { count: number; tokens: number }> = {};
    for (const r of filtered) {
      const mod = r.module || 'unknown';
      if (!moduleCounts[mod]) moduleCounts[mod] = { count: 0, tokens: 0 };
      moduleCounts[mod].count++;
      moduleCounts[mod].tokens += r.totalTokens;
    }
    const topModules = Object.entries(moduleCounts)
      .sort(([, a], [, b]) => b.count - a.count)
      .slice(0, 5)
      .map(([module, data]) => ({ module, count: data.count, tokens: data.tokens }));

    // Errors by type
    const errorsByType: Record<string, number> = {};
    for (const r of filtered) {
      if (!r.success && r.error) {
        errorsByType[r.error] = (errorsByType[r.error] || 0) + 1;
      }
    }

    return {
      totalTokens,
      totalCost,
      totalRequests: total,
      successRate: total > 0 ? (successCount / total) * 100 : 0,
      averageLatency: total > 0 ? totalLatency / total : 0,
      topModels,
      topModules,
      errorsByType,
      periodStart: periodStart || new Date(Math.min(...filtered.map(r => new Date(r.timestamp).getTime()))).toISOString(),
      periodEnd: periodEnd || new Date(Math.max(...filtered.map(r => new Date(r.timestamp).getTime()))).toISOString(),
    };
  }

  async getRecords(params: {
    organizationId?: string; model?: AIModel; module?: string;
    page?: number; limit?: number;
  }): Promise<{ data: AIAnalyticsRecord[]; total: number; page: number; limit: number }> {
    let filtered = Array.from(this.records.values());
    if (params.organizationId) filtered = filtered.filter(r => r.organizationId === params.organizationId);
    if (params.model) filtered = filtered.filter(r => r.model === params.model);
    if (params.module) filtered = filtered.filter(r => r.module === params.module);
    filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    const page = params.page || 1;
    const limit = params.limit || 20;
    const total = filtered.length;
    const start = (page - 1) * limit;
    return { data: filtered.slice(start, start + limit), total, page, limit };
  }
}

export const aiAnalytics = new AIAnalytics();