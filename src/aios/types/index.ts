/**
 * Calixo Platform - Enterprise AI Operating System (AIOS) Types
 *
 * Core types for the centralized AI platform that powers every module.
 * Supports provider abstraction, prompt management, context, memory,
 * knowledge base, tools, agents, analytics, and guardrails.
 */

// ============================================================================
// Provider Types
// ============================================================================

export type AIProvider = 'openai' | 'anthropic' | 'google' | 'azure_openai' | 'local';

export type AIModel =
  | 'gpt-4o'
  | 'gpt-4o-mini'
  | 'gpt-4-turbo'
  | 'gpt-3.5-turbo'
  | 'claude-3-opus'
  | 'claude-3-sonnet'
  | 'claude-3-haiku'
  | 'gemini-pro'
  | 'gemini-ultra'
  | 'azure-gpt-4o'
  | 'local-llama'
  | 'local-mistral'
  | 'gpt-image-1';

export type AIAction = 'chat' | 'completion' | 'embedding' | 'image' | 'audio' | 'function_call';

export interface ModelConfig {
  model: AIModel;
  provider: AIProvider;
  maxTokens: number;
  temperature: number;
  topP: number;
  frequencyPenalty: number;
  presencePenalty: number;
  stopSequences?: string[];
}

export const DEFAULT_MODEL_CONFIG: ModelConfig = {
  model: 'gpt-4o-mini',
  provider: 'openai',
  maxTokens: 4096,
  temperature: 0.7,
  topP: 1,
  frequencyPenalty: 0,
  presencePenalty: 0,
};

// ============================================================================
// Message Types
// ============================================================================

export type MessageRole = 'system' | 'user' | 'assistant' | 'tool' | 'function';

export interface AIMessage {
  id: string;
  role: MessageRole;
  content: string;
  name?: string;
  toolCalls?: ToolCall[];
  toolCallId?: string;
  /** Data URIs (`data:image/png;base64,...`) attached to a `user` message for vision-capable models — used by Creative Design Studio's real quality-control pass. Each real provider converts these into its own multipart content format; a provider that doesn't translate them simply analyzes the text alone. */
  imageUrls?: string[];
  metadata?: Record<string, unknown>;
  timestamp: string;
}

export interface ToolCall {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string;
  };
}

// ============================================================================
// Request/Response Types
// ============================================================================

export interface AICompletionRequest {
  messages: AIMessage[];
  model?: AIModel;
  config?: Partial<ModelConfig>;
  tools?: ToolDefinition[];
  stream?: boolean;
  userId?: string;
  organizationId?: string;
  workspaceId?: string;
  sessionId?: string;
  metadata?: Record<string, unknown>;
}

export interface AICompletionResponse {
  id: string;
  message: AIMessage;
  model: AIModel;
  provider: AIProvider;
  usage: TokenUsage;
  latency: number;
  finishReason: string;
  metadata?: Record<string, unknown>;
}

export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  cost: number;
}

// ============================================================================
// Model Registry Types
// ============================================================================

export interface ModelDefinition {
  id: string;
  model: AIModel;
  provider: AIProvider;
  displayName: string;
  description: string;
  capabilities: ModelCapability[];
  maxTokens: number;
  costPer1KPrompt: number;
  costPer1KCompletion: number;
  isActive: boolean;
  isExperimental: boolean;
  metadata?: Record<string, unknown>;
}

export type ModelCapability = 'chat' | 'completion' | 'embedding' | 'image' | 'audio' | 'function_calling' | 'vision' | 'streaming';

// ============================================================================
// Provider Interface Types
// ============================================================================

export interface AIProviderInterface {
  provider: AIProvider;
  name: string;
  isAvailable: boolean;
  models: AIModel[];
  complete(request: AICompletionRequest): Promise<AICompletionResponse>;
  completeStream(request: AICompletionRequest): Promise<AsyncIterable<AICompletionResponse>>;
  embed?(text: string): Promise<number[]>;
  validateConfig(): Promise<boolean>;
  /** Re-checks real availability (e.g. against the Platform Secrets Console) rather than trusting a boolean set once at registration — `ProviderRouter` calls this before every selection. */
  refreshAvailability?(): Promise<boolean>;
}

// ============================================================================
// Prompt Types
// ============================================================================

export type PromptStatus = 'draft' | 'active' | 'deprecated' | 'archived';
export type PromptCategory = 'system' | 'agent' | 'task' | 'template' | 'few_shot' | 'custom';

export interface Prompt {
  id: string;
  key: string;
  name: string;
  description?: string;
  category: PromptCategory;
  content: string;
  variables: string[];
  version: number;
  status: PromptStatus;
  isSystem: boolean;
  tags: string[];
  metadata?: Record<string, unknown>;
  createdBy?: string;
  approvedBy?: string;
  approvedAt?: string;
  isDeleted: boolean;
  deletedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PromptVersion {
  id: string;
  promptId: string;
  version: number;
  content: string;
  variables: string[];
  status: PromptStatus;
  changeLog?: string;
  createdBy?: string;
  createdAt: string;
}

export interface CreatePromptRequest {
  key: string;
  name: string;
  description?: string;
  category: PromptCategory;
  content: string;
  variables?: string[];
  tags?: string[];
  metadata?: Record<string, unknown>;
}

// ============================================================================
// Context Types
// ============================================================================

export interface AIExecutionContext {
  userId: string;
  userName?: string;
  userEmail?: string;
  userRole?: string;
  organizationId?: string;
  organizationName?: string;
  organizationSlug?: string;
  workspaceId?: string;
  workspaceName?: string;
  module?: string;
  feature?: string;
  subscriptionTier?: string;
  permissions: string[];
  integrations: string[];
  timezone: string;
  locale: string;
  metadata?: Record<string, unknown>;
}

// ============================================================================
// Memory Types
// ============================================================================

export type MemoryScope = 'conversation' | 'workspace' | 'organization' | 'user' | 'global';

export interface MemoryEntry {
  id: string;
  scope: MemoryScope;
  scopeId: string;
  key: string;
  value: string;
  type: 'fact' | 'preference' | 'history' | 'context' | 'custom';
  importance: number;
  expiresAt?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface ConversationMemory {
  id: string;
  sessionId: string;
  userId: string;
  organizationId?: string;
  workspaceId?: string;
  messages: AIMessage[];
  summary?: string;
  tokenCount: number;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// Knowledge Base Types
// ============================================================================

export type KnowledgeSource = 'manual' | 'integration' | 'upload' | 'web' | 'api';
export type KnowledgeStatus = 'processing' | 'ready' | 'failed' | 'archived';

export interface KnowledgeDocument {
  id: string;
  organizationId: string;
  title: string;
  content: string;
  source: KnowledgeSource;
  status: KnowledgeStatus;
  chunkCount: number;
  embedding?: number[];
  tags: string[];
  metadata?: Record<string, unknown>;
  isDeleted: boolean;
  deletedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface KnowledgeChunk {
  id: string;
  documentId: string;
  content: string;
  embedding?: number[];
  index: number;
  metadata?: Record<string, unknown>;
}

// ============================================================================
// Tool Types
// ============================================================================

export interface ToolDefinition {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
  };
}

export interface Tool {
  id: string;
  name: string;
  description: string;
  module: string;
  version: string;
  definition: ToolDefinition;
  handler: string;
  isActive: boolean;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface ToolResult {
  success: boolean;
  data?: unknown;
  error?: string;
  metadata?: Record<string, unknown>;
}

// ============================================================================
// Agent Types
// ============================================================================

export type AgentStatus = 'active' | 'inactive' | 'draft' | 'deprecated';

export interface Agent {
  id: string;
  name: string;
  description: string;
  role: string;
  model: AIModel;
  provider: AIProvider;
  systemPrompt: string;
  tools: string[];
  maxIterations: number;
  status: AgentStatus;
  isSystem: boolean;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface AgentExecution {
  id: string;
  agentId: string;
  userId: string;
  organizationId?: string;
  input: string;
  output?: string;
  messages: AIMessage[];
  toolCalls: ToolCall[];
  usage: TokenUsage;
  latency: number;
  status: 'running' | 'completed' | 'failed';
  error?: string;
  createdAt: string;
  completedAt?: string;
}

// ============================================================================
// Analytics Types
// ============================================================================

export interface AIAnalyticsRecord {
  id: string;
  userId?: string;
  organizationId?: string;
  workspaceId?: string;
  model: AIModel;
  provider: AIProvider;
  action: AIAction;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  cost: number;
  latency: number;
  success: boolean;
  error?: string;
  toolCalls: number;
  sessionId?: string;
  module?: string;
  feature?: string;
  metadata?: Record<string, unknown>;
  timestamp: string;
}

export interface AIAnalyticsSummary {
  totalTokens: number;
  totalCost: number;
  totalRequests: number;
  successRate: number;
  averageLatency: number;
  topModels: Array<{ model: AIModel; count: number; cost: number }>;
  topModules: Array<{ module: string; count: number; tokens: number }>;
  errorsByType: Record<string, number>;
  periodStart: string;
  periodEnd: string;
}

// ============================================================================
// Guardrail Types
// ============================================================================

export type GuardrailType = 'permission' | 'content_safety' | 'prompt_validation' | 'sensitive_data' | 'rate_limit';

export interface GuardrailResult {
  passed: boolean;
  type: GuardrailType;
  reason?: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  action: 'allow' | 'block' | 'warn' | 'modify';
  metadata?: Record<string, unknown>;
}

export interface GuardrailConfig {
  enabled: boolean;
  type: GuardrailType;
  rules: Record<string, unknown>;
  action: GuardrailResult['action'];
}

// ============================================================================
// Orchestrator Types
// ============================================================================

export interface AIExecutionPlan {
  id: string;
  steps: AIExecutionStep[];
  context: AIExecutionContext;
  metadata?: Record<string, unknown>;
}

export interface AIExecutionStep {
  id: string;
  type: 'prompt' | 'tool' | 'agent' | 'memory' | 'knowledge' | 'transform';
  config: Record<string, unknown>;
  dependsOn: string[];
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  result?: unknown;
  error?: string;
}

// ============================================================================
// Paginated Responses
// ============================================================================

export interface PaginatedPrompts {
  data: Prompt[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedAgents {
  data: Agent[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedAnalytics {
  data: AIAnalyticsRecord[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedKnowledge {
  data: KnowledgeDocument[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedMemory {
  data: MemoryEntry[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}