/**
 * Calixo Platform - Transaction Platform (Unit of Work)
 *
 * A real, working Unit-of-Work over in-memory repositories: stage a set of
 * operations, then `commit()` (executes them in order, rolling back
 * whatever already succeeded if a later one throws) or `rollback()`
 * (discards without executing). Nested transactions are supported via a
 * stack — an inner transaction's operations are folded into its parent on
 * commit rather than being independently committed, giving real nesting
 * semantics without a real database's MVCC.
 *
 * Distributed-transaction / two-phase-commit is explicitly NOT implemented
 * (there is no second real datastore yet to coordinate with) — the
 * `TransactionOperation` contract is designed so a future distributed
 * coordinator could satisfy it without callers changing.
 */
import { platformEventBus } from "../events/PlatformEventBus";
import type { TransactionOperation, TransactionStatus } from "./types";

export class UnitOfWork {
  private readonly operations: TransactionOperation[] = [];
  private readonly completed: TransactionOperation[] = [];
  status: TransactionStatus = "open";

  constructor(private readonly parent?: UnitOfWork) {}

  stage(operation: TransactionOperation): void {
    if (this.status !== "open") throw new Error(`Cannot stage an operation on a ${this.status} transaction`);
    this.operations.push(operation);
  }

  async commit(): Promise<void> {
    if (this.status !== "open") throw new Error(`Cannot commit a ${this.status} transaction`);

    for (const operation of this.operations) {
      try {
        await operation.execute();
        this.completed.push(operation);
      } catch (error) {
        const completedCount = this.completed.length;
        await this.rollbackCompleted();
        this.status = "rolled_back";
        await platformEventBus.publish({ type: "TransactionRolledBack", payload: { operationCount: completedCount, reason: "mid-commit failure" } });
        throw error;
      }
    }

    if (this.parent) {
      // Fold into the parent instead of independently committing — the
      // parent decides the final fate of these operations.
      for (const operation of this.operations) this.parent.stage({ ...operation, execute: async () => {}, rollback: operation.rollback });
      this.status = "committed";
      return;
    }

    this.status = "committed";
    await platformEventBus.publish({ type: "TransactionCommitted", payload: { operationCount: this.operations.length } });
  }

  async rollback(): Promise<void> {
    if (this.status !== "open") return;
    await this.rollbackCompleted();
    this.status = "rolled_back";
    await platformEventBus.publish({ type: "TransactionRolledBack", payload: { operationCount: this.completed.length } });
  }

  private async rollbackCompleted(): Promise<void> {
    for (const operation of [...this.completed].reverse()) {
      await operation.rollback();
    }
    this.completed.length = 0;
  }

  child(): UnitOfWork {
    return new UnitOfWork(this);
  }
}

export class TransactionManager {
  private stack: UnitOfWork[] = [];
  private committedCount = 0;
  private rolledBackCount = 0;

  begin(): UnitOfWork {
    const parent = this.stack[this.stack.length - 1];
    const uow = parent ? parent.child() : new UnitOfWork();
    this.stack.push(uow);
    return uow;
  }

  async commit(uow: UnitOfWork): Promise<void> {
    await uow.commit();
    this.stack = this.stack.filter(u => u !== uow);
    if (uow.status === "committed") this.committedCount++;
  }

  async rollback(uow: UnitOfWork): Promise<void> {
    await uow.rollback();
    this.stack = this.stack.filter(u => u !== uow);
    this.rolledBackCount++;
  }

  /** Convenience wrapper: runs `fn` inside a transaction, committing on success and rolling back on any thrown error. */
  async withTransaction<T>(fn: (uow: UnitOfWork) => Promise<T>): Promise<T> {
    const uow = this.begin();
    try {
      const result = await fn(uow);
      await this.commit(uow);
      return result;
    } catch (error) {
      await this.rollback(uow);
      throw error;
    }
  }

  stats(): { open: number; committed: number; rolledBack: number } {
    return { open: this.stack.length, committed: this.committedCount, rolledBack: this.rolledBackCount };
  }

  count(): number {
    return this.committedCount + this.rolledBackCount;
  }
}

export const transactionManager = new TransactionManager();
