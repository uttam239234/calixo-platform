/**
 * Calixo Platform - Prompt Service
 *
 * Manages prompt lifecycle: create, update, approve, rollback, delete.
 * Supports prompt categories, variables, version history, and rendering.
 */

import { appLogger } from '@/logging';
import { NotFoundError, ValidationError } from '@/errors';
import type {
  Prompt, PromptVersion, CreatePromptRequest, PromptCategory,
  PaginatedPrompts,
} from '@/aios/types';
import { promptLibrary } from '@/aios/prompts/PromptLibrary';
import type { PromptRepository, PromptVersionRepository } from '@/aios/repositories/interfaces';
import { InMemoryPromptRepository, InMemoryPromptVersionRepository } from '@/aios/repositories/implementations';

export class PromptService {
  private promptRepo: PromptRepository;
  private versionRepo: PromptVersionRepository;

  constructor(
    promptRepo?: PromptRepository,
    versionRepo?: PromptVersionRepository,
  ) {
    this.promptRepo = promptRepo || new InMemoryPromptRepository();
    this.versionRepo = versionRepo || new InMemoryPromptVersionRepository();
  }

  async getPrompt(id: string): Promise<Prompt> {
    const prompt = await this.promptRepo.getById(id);
    if (!prompt) throw new NotFoundError('Prompt');
    return prompt;
  }

  async getPromptByKey(key: string): Promise<Prompt> {
    const prompt = await this.promptRepo.getByKey(key);
    if (!prompt) throw new NotFoundError('Prompt');
    return prompt;
  }

  async getAllPrompts(): Promise<Prompt[]> {
    return this.promptRepo.getAll();
  }

  async getPromptsByCategory(category: PromptCategory): Promise<Prompt[]> {
    return this.promptRepo.getByCategory(category);
  }

  async getPaginatedPrompts(params: {
    page?: number;
    limit?: number;
    category?: string;
    status?: string;
    search?: string;
  }): Promise<PaginatedPrompts> {
    return this.promptRepo.getPaginated(params);
  }

  async createPrompt(data: CreatePromptRequest): Promise<Prompt> {
    if (!data.key || !data.key.trim()) {
      throw new ValidationError('Prompt key is required');
    }
    if (!data.name || !data.name.trim()) {
      throw new ValidationError('Prompt name is required');
    }
    if (!data.content || !data.content.trim()) {
      throw new ValidationError('Prompt content is required');
    }

    const exists = await this.promptRepo.existsByKey(data.key);
    if (exists) {
      throw new ValidationError(`Prompt with key "${data.key}" already exists`);
    }

    const prompt = await this.promptRepo.create(data);
    appLogger.info('PromptService', `Prompt created: ${prompt.name} (${prompt.key})`);
    return prompt;
  }

  async updatePrompt(id: string, content: string, changeLog?: string): Promise<Prompt> {
    const prompt = await this.promptRepo.getById(id);
    if (!prompt) throw new NotFoundError('Prompt');

    const updated = await this.promptRepo.update(id, content, prompt.variables);
    await this.versionRepo.create({
      id: '', // Will be generated
      promptId: id,
      version: updated.version,
      content,
      variables: updated.variables,
      status: 'draft',
      changeLog,
      createdAt: new Date().toISOString(),
    });

    appLogger.info('PromptService', `Prompt updated: ${prompt.name} (v${updated.version})`);
    return updated;
  }

  async approvePrompt(id: string, approvedBy: string): Promise<Prompt> {
    const prompt = await this.promptRepo.getById(id);
    if (!prompt) throw new NotFoundError('Prompt');
    if (prompt.status === 'archived') throw new ValidationError('Cannot approve an archived prompt');

    const approved = await this.promptRepo.approve(id, approvedBy);
    appLogger.info('PromptService', `Prompt approved: ${prompt.name} by ${approvedBy}`);
    return approved;
  }

  async rollbackPrompt(id: string, version: number): Promise<Prompt> {
    const prompt = await this.promptRepo.getById(id);
    if (!prompt) throw new NotFoundError('Prompt');

    const targetVersion = await this.versionRepo.getByVersion(id, version);
    if (!targetVersion) throw new ValidationError(`Version ${version} not found`);

    const updated = await this.promptRepo.update(id, targetVersion.content, targetVersion.variables);
    appLogger.info('PromptService', `Prompt rolled back: ${prompt.name} to v${version}`);
    return updated;
  }

  async deletePrompt(id: string): Promise<boolean> {
    const prompt = await this.promptRepo.getById(id);
    if (!prompt) throw new NotFoundError('Prompt');
    if (prompt.isSystem) throw new ValidationError('Cannot delete system prompts');

    appLogger.info('PromptService', `Prompt deleted: ${prompt.name}`);
    return this.promptRepo.softDelete(id);
  }

  async getPromptVersions(id: string): Promise<PromptVersion[]> {
    const prompt = await this.promptRepo.getById(id);
    if (!prompt) throw new NotFoundError('Prompt');
    return this.versionRepo.getByPromptId(id);
  }

  renderPrompt(prompt: Prompt, variables: Record<string, unknown>): string {
    return promptLibrary.render(prompt, variables);
  }

  async validatePromptVariables(key: string, variables: Record<string, unknown>): Promise<{ valid: boolean; missing: string[] }> {
    const prompt = await this.promptRepo.getByKey(key);
    if (!prompt) throw new NotFoundError('Prompt');

    const missing = prompt.variables.filter(v => !(v in variables));
    return { valid: missing.length === 0, missing };
  }
}

export const promptService = new PromptService();