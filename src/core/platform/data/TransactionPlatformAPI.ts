/**
 * Calixo Platform - Transaction Platform API
 */
import { transactionManager, type UnitOfWork } from "./TransactionManager";

export class TransactionPlatformAPI {
  begin(): UnitOfWork {
    return transactionManager.begin();
  }

  commit(uow: UnitOfWork): Promise<void> {
    return transactionManager.commit(uow);
  }

  rollback(uow: UnitOfWork): Promise<void> {
    return transactionManager.rollback(uow);
  }

  withTransaction<T>(fn: (uow: UnitOfWork) => Promise<T>): Promise<T> {
    return transactionManager.withTransaction(fn);
  }

  stats() {
    return transactionManager.stats();
  }
}

export const transactionPlatformAPI = new TransactionPlatformAPI();
