/**
 * Calixo Platform - Event Bus
 *
 * Event-driven architecture with event registry, dispatcher,
 * subscribers, and handlers. Supports asynchronous event publishing.
 */

import { appLogger } from '@/logging';
import type { Event, EventSubscriber, EventHandler } from '@/background/types';
import type { EventRepository, EventSubscriberRepository } from '@/background/repositories/interfaces';
import { InMemoryEventRepository, InMemoryEventSubscriberRepository } from '@/background/repositories/implementations';

export class EventBus {
  private eventRepo: EventRepository;
  private subscriberRepo: EventSubscriberRepository;
  private handlers: Map<string, EventHandler> = new Map();
  private isProcessing: boolean = false;

  constructor(
    eventRepo?: EventRepository,
    subscriberRepo?: EventSubscriberRepository
  ) {
    this.eventRepo = eventRepo || new InMemoryEventRepository();
    this.subscriberRepo = subscriberRepo || new InMemoryEventSubscriberRepository();
  }

  registerHandler(handlerName: string, handler: EventHandler): void {
    this.handlers.set(handlerName, handler);
    appLogger.debug('EventBus', `Handler registered: ${handlerName}`);
  }

  async publish(event: Omit<Event, 'id' | 'createdAt' | 'publishedAt'>): Promise<Event> {
    const eventData = { ...event, status: 'pending' as const };
    const created = await this.eventRepo.create(eventData);
    const published = await this.eventRepo.markPublished(created.id);
    appLogger.debug('EventBus', `Event published: ${event.type} (${published.id})`);
    return published;
  }

  async publishBatch(events: Array<Omit<Event, 'id' | 'createdAt' | 'publishedAt'>>): Promise<Event[]> {
    const results: Event[] = [];
    for (const event of events) {
      results.push(await this.publish(event));
    }
    appLogger.info('EventBus', `Published ${results.length} events`);
    return results;
  }

  async subscribe(eventType: string, handlerName: string, description: string, priority: number = 100): Promise<EventSubscriber> {
    return this.subscriberRepo.create({
      eventType,
      handler: handlerName,
      description,
      isActive: true,
      priority,
    });
  }

  async unsubscribe(id: string): Promise<boolean> {
    return this.subscriberRepo.delete(id);
  }

  async start(): Promise<void> {
    if (this.isProcessing) return;
    this.isProcessing = true;
    appLogger.info('EventBus', 'Event bus processing started');
    this.processLoop();
  }

  stop(): void {
    this.isProcessing = false;
    appLogger.info('EventBus', 'Event bus processing stopped');
  }

  private async processLoop(): Promise<void> {
    while (this.isProcessing) {
      try {
        const pendingEvents = await this.eventRepo.getByStatus('published');
        for (const event of pendingEvents) {
          await this.dispatch(event);
        }
      } catch (error) {
        appLogger.error('EventBus', 'Error in event processing loop', error as Error);
      }
      await this.sleep(500);
    }
  }

  private async dispatch(event: Event): Promise<void> {
    try {
      const subscribers = await this.subscriberRepo.getByEventType(event.type);

      for (const subscriber of subscribers) {
        const handler = this.handlers.get(subscriber.handler);
        if (handler) {
          try {
            await handler(event);
          } catch (error) {
            appLogger.error('EventBus', `Handler ${subscriber.handler} failed for event ${event.id}`, error as Error);
          }
        }
      }

      await this.eventRepo.markDelivered(event.id);
    } catch (error) {
      appLogger.error('EventBus', `Failed to dispatch event ${event.id}`, error as Error);
      await this.eventRepo.markFailed(event.id);
    }
  }

  async getMetrics() {
    return {
      totalEvents: await this.eventRepo.countByStatus('delivered') + await this.eventRepo.countByStatus('published') + await this.eventRepo.countByStatus('failed'),
      pendingEvents: await this.eventRepo.countByStatus('published'),
      failedEvents: await this.eventRepo.countByStatus('failed'),
      subscribers: (await this.subscriberRepo.getActive()).length,
    };
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const eventBus = new EventBus();