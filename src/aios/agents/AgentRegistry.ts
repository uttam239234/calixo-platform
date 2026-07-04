/**
 * Calixo Platform - Agent Registry
 *
 * Enterprise agents for marketing strategy, campaign optimization, SEO,
 * content writing, brand analysis, analytics, CRM, and executive advice.
 */

import { appLogger } from '@/logging';
import { generateId } from '@/shared/utils/string';
import type { Agent, AgentExecution, AIModel, AIProvider, AgentStatus } from '@/aios/types';

export const SYSTEM_AGENTS: Array<{
  name: string; description: string; role: string;
  model: AIModel; provider: AIProvider; systemPromptKey: string;
  tools: string[]; maxIterations: number;
}> = [
  {
    name: 'Marketing Strategist',
    description: 'Strategic marketing advisor for campaign planning and optimization',
    role: 'Senior Marketing Strategist',
    model: 'gpt-4o', provider: 'openai',
    systemPromptKey: 'agent.marketing_strategist',
    tools: ['analyze_campaign', 'get_analytics', 'get_reports'],
    maxIterations: 5,
  },
  {
    name: 'Campaign Optimizer',
    description: 'Campaign performance analysis and optimization expert',
    role: 'Campaign Optimization Expert',
    model: 'gpt-4o-mini', provider: 'openai',
    systemPromptKey: 'agent.campaign_optimizer',
    tools: ['analyze_campaign', 'get_metrics', 'get_recommendations'],
    maxIterations: 5,
  },
  {
    name: 'Content Writer',
    description: 'Professional content creation for all marketing channels',
    role: 'Content Writer',
    model: 'gpt-4o', provider: 'openai',
    systemPromptKey: 'agent.content_writer',
    tools: ['generate_content', 'analyze_content'],
    maxIterations: 3,
  },
  {
    name: 'Analytics Expert',
    description: 'Data analysis and insight generation from marketing data',
    role: 'Data Analytics Expert',
    model: 'gpt-4o-mini', provider: 'openai',
    systemPromptKey: 'agent.analytics_expert',
    tools: ['get_analytics', 'get_reports', 'analyze_trends'],
    maxIterations: 5,
  },
  {
    name: 'Brand Analyst',
    description: 'Brand monitoring, sentiment analysis, and competitive intelligence',
    role: 'Brand Analyst',
    model: 'gpt-4o', provider: 'openai',
    systemPromptKey: 'system.default',
    tools: ['get_mentions', 'analyze_sentiment', 'get_competitors'],
    maxIterations: 5,
  },
  {
    name: 'SEO Expert',
    description: 'Search engine optimization analysis and recommendations',
    role: 'SEO Expert',
    model: 'gpt-4o-mini', provider: 'openai',
    systemPromptKey: 'system.default',
    tools: ['analyze_seo', 'get_keywords', 'get_rankings'],
    maxIterations: 5,
  },
  {
    name: 'CRM Advisor',
    description: 'Customer relationship management insights and recommendations',
    role: 'CRM Advisor',
    model: 'gpt-4o', provider: 'openai',
    systemPromptKey: 'system.default',
    tools: ['get_customers', 'analyze_segments', 'get_insights'],
    maxIterations: 5,
  },
  {
    name: 'Executive Advisor',
    description: 'High-level business strategy and executive insights',
    role: 'Executive Advisor',
    model: 'gpt-4o', provider: 'openai',
    systemPromptKey: 'system.default',
    tools: ['get_analytics', 'get_reports', 'get_insights'],
    maxIterations: 8,
  },
];

export class AgentRegistry {
  private agents: Map<string, Agent> = new Map();
  private executions: Map<string, AgentExecution> = new Map();

  async initialize(): Promise<number> {
    let count = 0;
    for (const def of SYSTEM_AGENTS) {
      const existing = Array.from(this.agents.values()).find(a => a.name === def.name);
      if (!existing) {
        const agent: Agent = {
          id: generateId(16),
          name: def.name,
          description: def.description,
          role: def.role,
          model: def.model,
          provider: def.provider,
          systemPrompt: def.systemPromptKey,
          tools: def.tools,
          maxIterations: def.maxIterations,
          status: 'active',
          isSystem: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        this.agents.set(agent.id, agent);
        count++;
      }
    }
    appLogger.info('AgentRegistry', `Initialized ${count} system agents`);
    return count;
  }

  getAgent(id: string): Agent | undefined {
    return this.agents.get(id);
  }

  getAgentByName(name: string): Agent | undefined {
    return Array.from(this.agents.values()).find(a => a.name === name);
  }

  getAllAgents(): Agent[] {
    return Array.from(this.agents.values());
  }

  getActiveAgents(): Agent[] {
    return Array.from(this.agents.values()).filter(a => a.status === 'active');
  }

  registerAgent(agent: Agent): void {
    this.agents.set(agent.id, agent);
    appLogger.info('AgentRegistry', `Agent registered: ${agent.name}`);
  }

  async createExecution(params: {
    agentId: string; userId: string; organizationId?: string; input: string;
  }): Promise<AgentExecution> {
    const now = new Date().toISOString();
    const execution: AgentExecution = {
      id: generateId(16),
      agentId: params.agentId,
      userId: params.userId,
      organizationId: params.organizationId,
      input: params.input,
      messages: [],
      toolCalls: [],
      usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0, cost: 0 },
      latency: 0,
      status: 'running',
      createdAt: now,
    };
    this.executions.set(execution.id, execution);
    return { ...execution };
  }

  async completeExecution(id: string, output: string, usage: AgentExecution['usage'], latency: number): Promise<AgentExecution> {
    const exec = this.executions.get(id);
    if (!exec) throw new Error('Execution not found');
    exec.output = output;
    exec.usage = usage;
    exec.latency = latency;
    exec.status = 'completed';
    exec.completedAt = new Date().toISOString();
    return { ...exec };
  }

  async failExecution(id: string, error: string): Promise<AgentExecution> {
    const exec = this.executions.get(id);
    if (!exec) throw new Error('Execution not found');
    exec.error = error;
    exec.status = 'failed';
    exec.completedAt = new Date().toISOString();
    return { ...exec };
  }

  getExecution(id: string): AgentExecution | undefined {
    return this.executions.get(id);
  }

  getExecutionsByAgent(agentId: string): AgentExecution[] {
    return Array.from(this.executions.values()).filter(e => e.agentId === agentId);
  }
}

export const agentRegistry = new AgentRegistry();