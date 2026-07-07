/** Calixo Platform - Platform Configuration / Environment Service. Wraps the existing (previously orphaned) `@/config` ENV/APP constants — the first real `core/platform` consumer of that module. */
import { API, APP, ENV } from "@/config";

export class PlatformConfigService {
  get environment() {
    return ENV.NODE_ENV;
  }

  isProduction(): boolean {
    return ENV.IS_PROD;
  }

  isDevelopment(): boolean {
    return ENV.IS_DEV;
  }

  getAppUrl(): string {
    return ENV.NEXT_PUBLIC_APP_URL;
  }

  getApiBaseUrl(): string {
    return API.BASE_URL ?? ENV.NEXT_PUBLIC_API_URL;
  }

  getAppInfo() {
    return { name: APP.NAME, version: APP.VERSION, company: APP.COMPANY };
  }
}

export const platformConfigService = new PlatformConfigService();
