/** Calixo Platform — Media Cost Estimator */
import { MediaCapabilityService } from "./MediaCapabilityService";

export const MediaCostEstimator = {
  estimate(providerId: string, _request: unknown): { cost: number; currency: string } {
    const caps = MediaCapabilityService.get(providerId);
    if (!caps) return { cost: 0, currency: "USD" };
    return { cost: caps.pricing.costPerImage, currency: caps.pricing.currency };
  },
};