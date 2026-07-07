/**
 * Calixo Platform - CQRS Readiness (NOT implemented)
 *
 * The mandate is explicit: "Do NOT implement CQRS. Prepare architecture."
 * These are marker types only — nothing in this package constructs a
 * `CommandBus`/`QueryBus`, and no existing module is rewired through them.
 * Their purpose is purely to give a future phase a stable vocabulary for
 * separating write paths (`EntityManager.create/update/softDelete/restore`)
 * from read paths (`RepositoryPlatformAPI`/`SearchPlatformAPI`) without
 * that future phase inventing the split from scratch.
 */

export interface Command<TInput = unknown> {
  readonly type: string;
  readonly input: TInput;
}

export interface Query<TInput = unknown> {
  readonly type: string;
  readonly input: TInput;
}

export interface CommandHandler<TCommand extends Command, TResult = void> {
  handle(command: TCommand): Promise<TResult>;
}

export interface QueryHandler<TQuery extends Query, TResult = unknown> {
  handle(query: TQuery): Promise<TResult>;
}

/** A read model is intentionally a separate shape from the write-side `BaseEntity` — future Event Sourcing readiness. Not populated or wired up this phase. */
export type ReadModel<T> = Readonly<T>;
export type WriteModel<T> = T;
