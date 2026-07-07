/**
 * Calixo Platform - Scheduler Platform API
 *
 * Thin facade over `background`'s real `SchedulerEngine` (cron/daily/
 * weekly/monthly/timezone-aware, already genuine — see its own tick/
 * calculateNextRun logic). "Hourly" is expressed via the `cron` frequency
 * (its `calculateNextRun` already runs every hour at a fixed minute).
 * Calendar/holiday-aware scheduling is not implemented — see the Remaining
 * Roadmap.
 */
import { schedulerEngine } from "@/background/scheduler/SchedulerEngine";
import type { CreateScheduleRequest, Schedule } from "@/background/types";

export class SchedulerPlatformAPI {
  createSchedule(request: CreateScheduleRequest): Promise<Schedule> {
    return schedulerEngine.createSchedule(request);
  }

  updateSchedule(id: string, data: Partial<CreateScheduleRequest>): Promise<Schedule> {
    return schedulerEngine.updateSchedule(id, data);
  }

  pause(id: string): Promise<Schedule> {
    return schedulerEngine.deactivateSchedule(id);
  }

  resume(id: string): Promise<Schedule> {
    return schedulerEngine.activateSchedule(id);
  }

  delete(id: string): Promise<boolean> {
    return schedulerEngine.deleteSchedule(id);
  }

  list(params?: { organizationId?: string; isActive?: boolean }): Promise<Schedule[]> {
    return schedulerEngine.getSchedules(params);
  }

  getHealth() {
    return schedulerEngine.getHealth();
  }
}

export const schedulerPlatformAPI = new SchedulerPlatformAPI();
