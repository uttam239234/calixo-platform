/**
 * Calixo Platform - Operations Platform API
 */
import { operationsEngine } from "./OperationsEngine";
import type { OperationsSnapshot } from "./types";

export class OperationsPlatformAPI {
  getSnapshot(): Promise<OperationsSnapshot> {
    return operationsEngine.getSnapshot();
  }
}

export const operationsPlatformAPI = new OperationsPlatformAPI();
