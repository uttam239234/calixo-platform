/**
 * Calixo Platform - API Gateway Platform API
 */
import { apiGatewayEngine, type RawGatewayRequest } from "./ApiGatewayEngine";
import type { GatewayResponse } from "./types";
import { apiMonitoring, type ApiHealthSnapshot } from "./ApiMonitoring";

export class ApiGatewayPlatformAPI {
  handle(request: RawGatewayRequest): Promise<GatewayResponse> {
    return apiGatewayEngine.handle(request);
  }

  health(): ApiHealthSnapshot {
    return apiMonitoring.getHealth();
  }
}

export const apiGatewayPlatformAPI = new ApiGatewayPlatformAPI();
