/**
 * Calixo Platform - Specification Factory
 *
 * Turns a plain predicate into a composable `Specification<T>` (and/or/not),
 * matching the interface declared in `types.ts`.
 */
import type { Specification } from "./types";

class PredicateSpecification<T> implements Specification<T> {
  constructor(private readonly predicate: (entity: T) => boolean) {}

  isSatisfiedBy(entity: T): boolean {
    return this.predicate(entity);
  }

  and(other: Specification<T>): Specification<T> {
    return new PredicateSpecification(entity => this.isSatisfiedBy(entity) && other.isSatisfiedBy(entity));
  }

  or(other: Specification<T>): Specification<T> {
    return new PredicateSpecification(entity => this.isSatisfiedBy(entity) || other.isSatisfiedBy(entity));
  }

  not(): Specification<T> {
    return new PredicateSpecification(entity => !this.isSatisfiedBy(entity));
  }
}

export function createSpecification<T>(predicate: (entity: T) => boolean): Specification<T> {
  return new PredicateSpecification(predicate);
}
