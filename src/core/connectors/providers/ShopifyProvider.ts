/**
 * Calixo Platform - Universal Connector Framework: Shopify Provider Adapter
 *
 * Shopify OAuth is genuinely per-shop — there is no platform-wide
 * authorization/token endpoint, unlike every other provider here (the same
 * disclosed limitation already recorded when Shopify's Platform OAuth
 * Application was built: "real per-shop OAuth testing needs a shop domain,
 * which isn't part of this platform-level app record"). `shopDomain` MUST
 * be supplied per connection via `ConnectorContext.extra.shopDomain`
 * (sourced from `ConnectorInstance.metadata.shopDomain`) — there is no
 * static default, unlike Microsoft's tenantId or Salesforce's loginUrl.
 */
import { createOAuthConnector, type IntrospectionResult } from "./OAuthConnectorBase";
import { connectorRegistry } from "../ConnectorRegistry";
import type { ConnectorDefinition } from "../types";
import type { ProviderEndpointExtras } from "../OAuthManager";

async function introspectShopify(accessToken: string, extra?: ProviderEndpointExtras): Promise<IntrospectionResult> {
  if (!extra?.shopDomain) return { ok: false, message: "No shop domain configured for this connection." };
  const shop = extra.shopDomain.replace(/^https?:\/\//, "").replace(/\/$/, "");
  try {
    const response = await fetch(`https://${shop}/admin/api/2024-01/shop.json`, { headers: { "X-Shopify-Access-Token": accessToken } });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) return { ok: false, message: (data.errors as string) ?? `HTTP ${response.status}` };
    const shopInfo = data.shop as { name?: string; myshopify_domain?: string } | undefined;
    return { ok: true, connectedAccount: shopInfo?.name ?? shopInfo?.myshopify_domain, providerUserId: shopInfo?.myshopify_domain, message: "Verified via Shopify's shop.json endpoint." };
  } catch (err) {
    return { ok: false, message: err instanceof Error ? err.message : "Network error reaching Shopify." };
  }
}

export const shopifyConnectorDefinition: ConnectorDefinition = {
  id: "shopify",
  provider: "shopify",
  displayName: "Shopify",
  category: "ecommerce",
  icon: "shopify",
  version: "1.0.0",
  status: "available",
  supportedFeatures: ["commerce-catalog", "reporting"],
  supportedCapabilities: ["read", "write", "webhook", "scheduling", "ai-insights"],
  requiredOAuthProducts: ["Shopify Store"],
  requiredScopes: [],
  supportedEvents: ["ConnectorConnected", "ConnectorDisconnected", "ConnectorTokenRefreshed", "ConnectorSyncCompleted", "ConnectorSyncFailed", "ConnectorHealthChanged", "WebhookReceived"],
  supportsWebhook: true,
  supportsRealtime: false,
  supportsScheduling: true,
  supportsAI: true,
};

export const shopifyConnector = createOAuthConnector({
  provider: "shopify",
  connectorId: "shopify",
  introspect: introspectShopify,
  capabilities: shopifyConnectorDefinition.supportedCapabilities,
  permissions: shopifyConnectorDefinition.requiredScopes,
  aiContext: {
    summary: "Shopify orders, products, and storefront data, once product-data sync is implemented.",
    availableMetrics: ["revenue", "orders", "aov"],
    availableDimensions: ["product", "date"],
    sampleQuestions: ["Why did revenue drop this week?"],
  },
});

connectorRegistry.register(shopifyConnectorDefinition, shopifyConnector);
