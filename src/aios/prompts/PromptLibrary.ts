/**
 * Calixo Platform - Prompt Library
 *
 * Central prompt management with categories, version history,
 * variables, templates, testing, approval status, and rollback.
 */

import { appLogger } from '@/logging';
import { generateId } from '@/shared/utils/string';
import type { Prompt, PromptVersion, CreatePromptRequest, PromptCategory, PromptStatus } from '@/aios/types';

export const SYSTEM_PROMPTS: Array<{
  key: string; name: string; description: string; category: PromptCategory;
  content: string; variables: string[];
}> = [
  {
    key: 'system.default',
    name: 'Default System Prompt',
    description: 'Default system prompt for general AI interactions',
    category: 'system',
    content: 'You are Calixo AI, an enterprise marketing AI assistant. Help users with their marketing tasks including campaign management, social media, analytics, content creation, and brand monitoring. Be concise, accurate, and actionable.',
    variables: [],
  },
  {
    key: 'agent.marketing_strategist',
    name: 'Marketing Strategist',
    description: 'System prompt for the Marketing Strategist agent',
    category: 'agent',
    content: 'You are a senior marketing strategist. Analyze campaign performance data, market trends, and provide strategic recommendations. Focus on ROI, audience targeting, and channel optimization.',
    variables: ['organizationName', 'industry'],
  },
  {
    key: 'agent.campaign_optimizer',
    name: 'Campaign Optimizer',
    description: 'System prompt for the Campaign Optimizer agent',
    category: 'agent',
    content: 'You are a campaign optimization expert. Analyze ad performance metrics and provide actionable recommendations to improve CTR, conversion rates, and reduce CPA.',
    variables: ['platform', 'campaignName'],
  },
  {
    key: 'agent.content_writer',
    name: 'Content Writer',
    description: 'System prompt for the Content Writer agent',
    category: 'agent',
    content: 'You are a professional content writer. Create engaging, platform-optimized content for marketing campaigns. Adapt tone and style based on the target audience and platform.',
    variables: ['platform', 'tone', 'audience'],
  },
  {
    key: 'agent.analytics_expert',
    name: 'Analytics Expert',
    description: 'System prompt for the Analytics Expert agent',
    category: 'agent',
    content: 'You are a data analytics expert. Interpret marketing data, identify trends, and provide data-driven insights. Explain complex metrics in simple terms.',
    variables: ['metrics', 'dateRange'],
  },
  {
    key: 'task.analyze_campaign',
    name: 'Analyze Campaign',
    description: 'Prompt for analyzing campaign performance',
    category: 'task',
    content: 'Analyze the following campaign data and provide insights:\n\nCampaign: {{campaignName}}\nPlatform: {{platform}}\nMetrics: {{metrics}}\n\nProvide: 1) Key findings 2) Areas for improvement 3) Specific recommendations',
    variables: ['campaignName', 'platform', 'metrics'],
  },
  {
    key: 'task.generate_content',
    name: 'Generate Content',
    description: 'Prompt for generating marketing content',
    category: 'task',
    content: 'Create {{contentType}} for {{platform}} about {{topic}}.\n\nTone: {{tone}}\nTarget Audience: {{audience}}\nKey Message: {{keyMessage}}\n\nInclude: 1) Headline 2) Body copy 3) Call to action 4) Hashtags',
    variables: ['contentType', 'platform', 'topic', 'tone', 'audience', 'keyMessage'],
  },
  {
    key: 'template.report_summary',
    name: 'Report Summary',
    description: 'Template for generating report summaries',
    category: 'template',
    content: 'Summarize the following {{reportType}} report:\n\n{{reportData}}\n\nProvide: 1) Executive summary 2) Key metrics 3) Trends 4) Recommendations',
    variables: ['reportType', 'reportData'],
  },
];

export class PromptLibrary {
  private prompts: Map<string, Prompt> = new Map();
  private versions: Map<string, PromptVersion[]> = new Map();
  private initialized = false;

  async initialize(): Promise<number> {
    let count = 0;
    for (const def of SYSTEM_PROMPTS) {
      const existing = Array.from(this.prompts.values()).find(p => p.key === def.key);
      if (!existing) {
        const prompt = await this.create({
          key: def.key,
          name: def.name,
          description: def.description,
          category: def.category,
          content: def.content,
          variables: def.variables,
          tags: ['system'],
        });
        count++;
      }
    }
    this.initialized = true;
    appLogger.info('PromptLibrary', `Initialized ${count} system prompts`);
    return count;
  }

  /** Nothing in this codebase reliably calls a single app-boot hook (`initializeAIOS()` has zero callers) — every read path self-initializes idempotently instead of trusting that to have happened already. */
  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) await this.initialize();
  }

  async create(data: CreatePromptRequest): Promise<Prompt> {
    const now = new Date().toISOString();
    const prompt: Prompt = {
      id: generateId(16),
      key: data.key,
      name: data.name,
      description: data.description,
      category: data.category,
      content: data.content,
      variables: data.variables || [],
      version: 1,
      status: 'active',
      isSystem: data.tags?.includes('system') || false,
      tags: data.tags || [],
      metadata: data.metadata,
      isDeleted: false,
      createdAt: now,
      updatedAt: now,
    };
    this.prompts.set(prompt.id, prompt);
    this.addVersion(prompt.id, prompt.content, prompt.variables, 'active', 'Initial version');
    return { ...prompt };
  }

  async getById(id: string): Promise<Prompt | null> {
    await this.ensureInitialized();
    return this.prompts.get(id) || null;
  }

  async getByKey(key: string): Promise<Prompt | null> {
    await this.ensureInitialized();
    return Array.from(this.prompts.values()).find(p => p.key === key && !p.isDeleted) || null;
  }

  async getAll(): Promise<Prompt[]> {
    await this.ensureInitialized();
    return Array.from(this.prompts.values()).filter(p => !p.isDeleted);
  }

  async getByCategory(category: PromptCategory): Promise<Prompt[]> {
    await this.ensureInitialized();
    return Array.from(this.prompts.values()).filter(p => p.category === category && !p.isDeleted);
  }

  async update(id: string, content: string, changeLog?: string): Promise<Prompt> {
    const prompt = this.prompts.get(id);
    if (!prompt) throw new Error('Prompt not found');
    prompt.content = content;
    prompt.version++;
    prompt.status = 'draft';
    prompt.updatedAt = new Date().toISOString();
    this.addVersion(id, content, prompt.variables, 'draft', changeLog);
    return { ...prompt };
  }

  async approve(id: string, approvedBy: string): Promise<Prompt> {
    const prompt = this.prompts.get(id);
    if (!prompt) throw new Error('Prompt not found');
    prompt.status = 'active';
    prompt.approvedBy = approvedBy;
    prompt.approvedAt = new Date().toISOString();
    prompt.updatedAt = prompt.approvedAt;
    return { ...prompt };
  }

  async rollback(id: string, version: number): Promise<Prompt> {
    const prompt = this.prompts.get(id);
    if (!prompt) throw new Error('Prompt not found');
    const promptVersions = this.versions.get(id) || [];
    const targetVersion = promptVersions.find(v => v.version === version);
    if (!targetVersion) throw new Error(`Version ${version} not found`);
    prompt.content = targetVersion.content;
    prompt.version = version + 1;
    prompt.updatedAt = new Date().toISOString();
    this.addVersion(id, targetVersion.content, prompt.variables, 'active', `Rolled back to version ${version}`);
    return { ...prompt };
  }

  async getVersions(id: string): Promise<PromptVersion[]> {
    return this.versions.get(id) || [];
  }

  async delete(id: string): Promise<boolean> {
    const prompt = this.prompts.get(id);
    if (!prompt) return false;
    prompt.isDeleted = true;
    prompt.deletedAt = new Date().toISOString();
    return true;
  }

  render(prompt: Prompt, data: Record<string, unknown>): string {
    return prompt.content.replace(/\{\{(\w+)\}\}/g, (_, key) => {
      return String(data[key] ?? `{{${key}}}`);
    });
  }

  private addVersion(promptId: string, content: string, variables: string[], status: PromptStatus, changeLog?: string): void {
    const prompt = this.prompts.get(promptId);
    if (!prompt) return;
    const version: PromptVersion = {
      id: generateId(16),
      promptId,
      version: prompt.version,
      content,
      variables,
      status,
      changeLog,
      createdAt: new Date().toISOString(),
    };
    if (!this.versions.has(promptId)) {
      this.versions.set(promptId, []);
    }
    this.versions.get(promptId)!.push(version);
  }
}

export const promptLibrary = new PromptLibrary();