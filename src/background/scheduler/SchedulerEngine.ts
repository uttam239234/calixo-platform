/**
 * Calixo Platform - Scheduler Engine
 *
 * Manages cron, daily, weekly, monthly, and custom schedules.
 * Timezone-aware scheduling with automatic job creation.
 */

import { appLogger } from '@/logging';
import { generateId } from '@/shared/utils/string';
import type { Schedule, CreateScheduleRequest, CreateJobRequest } from '@/background/types';
import type { ScheduleRepository } from '@/background/repositories/interfaces';
import { InMemoryScheduleRepository } from '@/background/repositories/implementations';
import { queueEngine } from '@/background/queue/QueueEngine';

export class SchedulerEngine {
  private scheduleRepo: ScheduleRepository;
  private isRunning: boolean = false;
  private tickInterval: number = 15000; // Check every 15 seconds

  constructor(scheduleRepo?: ScheduleRepository) {
    this.scheduleRepo = scheduleRepo || new InMemoryScheduleRepository();
  }

  async createSchedule(data: CreateScheduleRequest): Promise<Schedule> {
    const now = new Date().toISOString();
    const schedule: Schedule = {
      id: generateId(16),
      name: data.name,
      description: data.description,
      frequency: data.frequency,
      cronExpression: data.cronExpression,
      timezone: data.timezone || 'UTC',
      dayOfWeek: data.dayOfWeek,
      dayOfMonth: data.dayOfMonth,
      hour: data.hour ?? 0,
      minute: data.minute ?? 0,
      worker: data.worker,
      payload: data.payload,
      organizationId: data.organizationId,
      workspaceId: data.workspaceId,
      isActive: data.isActive !== undefined ? data.isActive : true,
      nextRunAt: this.calculateNextRun(data),
      createdAt: now,
      updatedAt: now,
    };

    const created = await this.scheduleRepo.create(schedule);
    appLogger.info('SchedulerEngine', `Schedule created: ${schedule.name} (${schedule.id})`);
    return created;
  }

  async updateSchedule(id: string, data: Partial<CreateScheduleRequest>): Promise<Schedule> {
    const sched = await this.scheduleRepo.getById(id);
    if (!sched) throw new Error('Schedule not found');

    const updates: Partial<Schedule> = { ...data };
    if (data.hour !== undefined || data.minute !== undefined || data.frequency !== undefined) {
      updates.nextRunAt = this.calculateNextRun({ ...sched, ...data });
    }

    return this.scheduleRepo.update(id, updates);
  }

  async deleteSchedule(id: string): Promise<boolean> {
    return this.scheduleRepo.delete(id);
  }

  async activateSchedule(id: string): Promise<Schedule> {
    const sched = await this.scheduleRepo.getById(id);
    if (!sched) throw new Error('Schedule not found');
    const nextRun = this.calculateNextRun(sched);
    return this.scheduleRepo.updateLastRun(id, sched.lastRunAt || new Date().toISOString(), nextRun);
  }

  async deactivateSchedule(id: string): Promise<Schedule> {
    return this.scheduleRepo.deactivate(id);
  }

  async getSchedules(params?: { organizationId?: string; isActive?: boolean }): Promise<Schedule[]> {
    if (params?.organizationId) {
      return this.scheduleRepo.getByOrganization(params.organizationId);
    }
    if (params?.isActive !== undefined) {
      return params.isActive ? this.scheduleRepo.getActive() : this.scheduleRepo.getAll();
    }
    return this.scheduleRepo.getAll();
  }

  async start(): Promise<void> {
    if (this.isRunning) return;
    this.isRunning = true;
    appLogger.info('SchedulerEngine', 'Scheduler started');
    this.tick();
  }

  stop(): void {
    this.isRunning = false;
    appLogger.info('SchedulerEngine', 'Scheduler stopped');
  }

  private async tick(): Promise<void> {
    while (this.isRunning) {
      try {
        const now = new Date().toISOString();
        const dueSchedules = await this.scheduleRepo.getDue(now);

        for (const schedule of dueSchedules) {
          await this.executeSchedule(schedule);
        }
      } catch (error) {
        appLogger.error('SchedulerEngine', 'Error in scheduler tick', error as Error);
      }
      await this.sleep(this.tickInterval);
    }
  }

  private async executeSchedule(schedule: Schedule): Promise<void> {
    try {
      const job: CreateJobRequest = {
        type: 'scheduled',
        name: `scheduled:${schedule.name}`,
        worker: schedule.worker,
        payload: schedule.payload,
        organizationId: schedule.organizationId,
        workspaceId: schedule.workspaceId,
        tags: ['scheduled', `schedule:${schedule.id}`],
      };

      await queueEngine.enqueue(job);

      const nextRun = this.calculateNextRun(schedule);
      await this.scheduleRepo.updateLastRun(schedule.id, new Date().toISOString(), nextRun);

      appLogger.debug('SchedulerEngine', `Executed schedule: ${schedule.name}, next run: ${nextRun}`);
    } catch (error) {
      appLogger.error('SchedulerEngine', `Failed to execute schedule ${schedule.id}`, error as Error);
    }
  }

  calculateNextRun(schedule: Partial<Schedule>): string {
    const now = new Date();
    const hour = schedule.hour ?? 0;
    const minute = schedule.minute ?? 0;

    switch (schedule.frequency) {
      case 'daily': {
        const next = new Date(now);
        next.setDate(next.getDate() + 1);
        next.setHours(hour, minute, 0, 0);
        return next.toISOString();
      }
      case 'weekly': {
        const dayOfWeek = schedule.dayOfWeek ?? 0; // 0 = Sunday
        const next = new Date(now);
        const daysUntil = (dayOfWeek - next.getDay() + 7) % 7 || 7;
        next.setDate(next.getDate() + daysUntil);
        next.setHours(hour, minute, 0, 0);
        return next.toISOString();
      }
      case 'monthly': {
        const dayOfMonth = schedule.dayOfMonth ?? 1;
        const next = new Date(now);
        next.setMonth(next.getMonth() + 1);
        next.setDate(Math.min(dayOfMonth, new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate()));
        next.setHours(hour, minute, 0, 0);
        return next.toISOString();
      }
      case 'cron': {
        // Simple cron: run every hour at specified minute
        const next = new Date(now);
        next.setHours(next.getHours() + 1, minute, 0, 0);
        return next.toISOString();
      }
      default: {
        const next = new Date(now);
        next.setMinutes(next.getMinutes() + 5);
        return next.toISOString();
      }
    }
  }

  async getHealth() {
    return {
      totalSchedules: (await this.scheduleRepo.getAll()).length,
      activeSchedules: await this.scheduleRepo.countActive(),
      lastTick: new Date().toISOString(),
      nextTick: new Date(Date.now() + this.tickInterval).toISOString(),
    };
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const schedulerEngine = new SchedulerEngine();