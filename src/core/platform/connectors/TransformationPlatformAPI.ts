/**
 * Calixo Platform - Transformation Platform API
 */
import { transformationEngine, type TransformationResult } from "./TransformationEngine";
import type { TransformationRule } from "./types";

export class TransformationPlatformAPI {
  apply<T extends Record<string, unknown>>(rules: TransformationRule[], records: T[]): TransformationResult<T> {
    return transformationEngine.apply(rules, records);
  }

  count(): number {
    return transformationEngine.count();
  }
}

export const transformationPlatformAPI = new TransformationPlatformAPI();
