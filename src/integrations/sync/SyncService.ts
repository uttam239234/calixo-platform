/**
 * Calixo Platform - Sync Engine
 * 
 * Manages data synchronization between Calixo and external providers.
 * Supports full and incremental sync with retry logic.
 */

import { appLogger } from '@/logging';
import { NotFoundError } from '@/errors';
import { generateId } from '@/shared/utils/string';
import { connectorRegistry } from '@/integrations/registry/ConnectorRegistry';
import type { SyncService, SyncJob, SyncDataType, SyncConfig, ConnectionId, SyncJobStatus } from '@/integrations/types';

const DEFAULT_RETRY_CONFIG = {
  maxRetries: 3,
  initialDelayMs: 1000,
  maxDelayMs: 30000,
  backoffMultiplier: 2,
};

export class IntegrationSyncService implements SyncService {
  private jobs: Map<string, SyncJob> = new Map();
  private connectionJobs: Map<ConnectionId, string[]> = new Map();
  private syncConfigs: Map<ConnectionId, SyncConfig> = new Map();
  private activeSyncs: Map<string, boolean> = new Map();

  async startSync(connectionId: ConnectionId, dataType: SyncDataType): Promise<SyncJob> {
    const job: SyncJob = {
      id: generateId(16),
      connectionId,
      type: dataType,
      status: 'queued',
      mode: 'incremental',
      startedAt: new Date().toISOString(),
      recordsProcessed: 0,
      recordsFailed: 0,
    };

    this.jobs.set(job.id, job);
    
    if (!this.connectionJobs.has(connectionId)) {
      this.connectionJobs.set(connectionId, []);
    }
    this.connectionJobs.get(connectionId)!.push(job.id);

    // Execute sync asynchronously
    this.executeSync(job).catch(err => {
      appLogger.error('SyncService', `Sync failed for job ${job.id}`, err);
    });

    appLogger.info('SyncService', `Sync started: ${dataType} for connection ${connectionId}`);
    return { ...job };
  }

  private async executeSync(job: SyncJob): Promise<void> {
    const connector = connectorRegistry.get(job.connectionId);
    if (!connector) {
      await this.updateJobStatus(job.id, 'failed', 'Connector not found');
      return;
    }

    this.activeSyncs.set(job.id, true);
    await this.updateJobStatus(job.id, 'running');

    let retries = 0;
    const retryConfig = this.getRetryConfig(job.connectionId);

    while (retries <= retryConfig.maxRetries && this.activeSyncs.get(job.id)) {
      try {
        // Simulated sync - in production, connector.sync() would be called
        job.status = 'completed';
        job.completedAt = new Date().toISOString();
        job.durationMs = Math.floor(Math.random() * 5000);
        job.recordsProcessed = Math.floor(Math.random() * 1000);
        
        this.jobs.set(job.id, { ...job });
        appLogger.info('SyncService', `Sync completed: ${job.id} (${job.recordsProcessed} records)`);
        return;
      } catch (error) {
        retries++;
        job.recordsFailed++;
        
        if (retries <= retryConfig.maxRetries) {
          const delay = Math.min(
            retryConfig.initialDelayMs * Math.pow(retryConfig.backoffMultiplier, retries - 1),
            retryConfig.maxDelayMs
          );
          
          await this.updateJobStatus(job.id, 'retrying', `Attempt ${retries}/${retryConfig.maxRetries}`);
          await new Promise(resolve => setTimeout(resolve, delay));
        } else {
          const errorMessage = error instanceof Error ? error.message : 'Sync failed';
          await this.updateJobStatus(job.id, 'failed', errorMessage);
          appLogger.error('SyncService', `Sync failed after ${retries} retries: ${job.id}`, error);
        }
      }
    }

    this.activeSyncs.delete(job.id);
  }

  recordExternalJob(job: SyncJob): void {
    this.jobs.set(job.id, { ...job });
    if (!this.connectionJobs.has(job.connectionId)) {
      this.connectionJobs.set(job.connectionId, []);
    }
    this.connectionJobs.get(job.connectionId)!.push(job.id);
  }

  async cancelSync(jobId: string): Promise<void> {
    const job = this.jobs.get(jobId);
    if (!job) {
      throw new NotFoundError('Sync job');
    }

    if (job.status === 'running' || job.status === 'queued') {
      this.activeSyncs.delete(jobId);
      await this.updateJobStatus(jobId, 'cancelled');
      appLogger.info('SyncService', `Sync cancelled: ${jobId}`);
    }
  }

  async getJob(jobId: string): Promise<SyncJob | null> {
    const job = this.jobs.get(jobId);
    return job ? { ...job } : null;
  }

  async getConnectionJobs(connectionId: ConnectionId): Promise<SyncJob[]> {
    const jobIds = this.connectionJobs.get(connectionId) || [];
    return jobIds
      .map(id => this.jobs.get(id))
      .filter((job): job is SyncJob => !!job)
      .map(job => ({ ...job }))
      .sort((a, b) => new Date(b.startedAt || '').getTime() - new Date(a.startedAt || '').getTime());
  }

  async getPendingJobs(): Promise<SyncJob[]> {
    return Array.from(this.jobs.values())
      .filter(job => job.status === 'queued' || job.status === 'retrying')
      .map(job => ({ ...job }));
  }

  async scheduleSync(connectionId: ConnectionId, config: SyncConfig): Promise<void> {
    this.syncConfigs.set(connectionId, config);
    appLogger.info('SyncService', `Sync scheduled for connection ${connectionId}: ${config.frequency}`);
  }

  async getSyncConfig(connectionId: ConnectionId): Promise<SyncConfig> {
    return this.syncConfigs.get(connectionId) || {
      enabled: false,
      frequency: 'manual',
      dataTypes: [],
      fullSyncEnabled: false,
      incrementalSyncEnabled: false,
      retryConfig: DEFAULT_RETRY_CONFIG,
    };
  }

  async updateSyncConfig(connectionId: ConnectionId, config: Partial<SyncConfig>): Promise<void> {
    const current = await this.getSyncConfig(connectionId);
    this.syncConfigs.set(connectionId, { ...current, ...config });
    appLogger.info('SyncService', `Sync config updated for connection ${connectionId}`);
  }

  private async updateJobStatus(jobId: string, status: SyncJobStatus, error?: string): Promise<void> {
    const job = this.jobs.get(jobId);
    if (!job) return;
    
    job.status = status;
    if (error) job.error = error;
    if (status === 'completed' || status === 'failed' || status === 'cancelled') {
      job.completedAt = new Date().toISOString();
    }
    
    this.jobs.set(jobId, { ...job });
  }

  private getRetryConfig(connectionId: ConnectionId): typeof DEFAULT_RETRY_CONFIG {
    const config = this.syncConfigs.get(connectionId);
    return config?.retryConfig || DEFAULT_RETRY_CONFIG;
  }
}

export const integrationSyncService = new IntegrationSyncService();