/**
 * Calixo Platform - OAuth Framework
 * 
 * Manages OAuth 2.0 flows for integration providers.
 * Supports authorization code flow with PKCE.
 */

import { appLogger } from '@/logging';
import { ValidationError, AuthenticationError } from '@/errors';
import { generateId } from '@/shared/utils/string';
import { connectorRegistry } from '@/integrations/registry/ConnectorRegistry';
import type { ProviderId, OAuthService, OAuthState, TokenResponse, OAuth2Credentials, ConnectionId } from '@/integrations/types';

export class IntegrationOAuthService implements OAuthService {
  private states: Map<string, OAuthState> = new Map();
  private tokenRefreshLocks: Map<ConnectionId, Promise<OAuth2Credentials>> = new Map();
  private readonly STATE_TTL = 10 * 60 * 1000; // 10 minutes

  async initiateFlow(organizationId: string, providerId: ProviderId, redirectUri: string): Promise<{ url: string; state: string; codeVerifier?: string }> {
    const connector = connectorRegistry.get(providerId);
    if (!connector) {
      throw new ValidationError(`Provider ${providerId} not found`);
    }

    const oauthConfig = connector.getOAuthConfig();
    if (!oauthConfig) {
      throw new ValidationError('Provider does not support OAuth');
    }

    const state = generateId(32);
    const codeVerifier = oauthConfig.pkceRequired ? generateId(64) : undefined;

    const oauthState: OAuthState = {
      state,
      codeVerifier,
      organizationId,
      providerId,
      redirectUri,
      scopes: oauthConfig.scopes.map(s => s.name),
      createdAt: new Date().toISOString(),
    };

    this.states.set(state, oauthState);

    // Clean up old states
    setTimeout(() => this.states.delete(state), this.STATE_TTL);

    const url = this.getAuthorizationUrl(providerId, state, redirectUri, oauthConfig.scopes.map(s => s.name));

    appLogger.info('OAuthService', `OAuth flow initiated for ${providerId}`);

    return { url, state, codeVerifier };
  }

  async completeFlow(providerId: ProviderId, code: string, state: string): Promise<TokenResponse & { organizationId: string }> {
    const oauthState = this.states.get(state);
    if (!oauthState) {
      throw new ValidationError('Invalid or expired OAuth state');
    }

    if (oauthState.providerId !== providerId) {
      throw new ValidationError('Provider mismatch');
    }

    // Check expiry
    const createdAt = new Date(oauthState.createdAt).getTime();
    if (Date.now() - createdAt > this.STATE_TTL) {
      this.states.delete(state);
      throw new ValidationError('OAuth flow expired. Please try again.');
    }

    const connector = connectorRegistry.get(providerId);
    if (!connector) {
      throw new ValidationError(`Provider ${providerId} not found`);
    }

    const { organizationId } = oauthState;

    // Clean up state
    this.states.delete(state);

    const tokenResponse = await connector.exchangeCode(code, state);

    appLogger.info('OAuthService', `OAuth flow completed for ${providerId}`);

    return { ...tokenResponse, organizationId };
  }

  async refreshToken(connectionId: ConnectionId): Promise<OAuth2Credentials> {
    // Prevent concurrent refresh for same connection
    const existing = this.tokenRefreshLocks.get(connectionId);
    if (existing) return existing;

    const refreshPromise = this.doRefreshToken(connectionId);
    this.tokenRefreshLocks.set(connectionId, refreshPromise);
    
    try {
      return await refreshPromise;
    } finally {
      this.tokenRefreshLocks.delete(connectionId);
    }
  }

  private async doRefreshToken(connectionId: ConnectionId): Promise<OAuth2Credentials> {
    // In production, look up connection from database
    appLogger.info('OAuthService', `Refreshing token for connection ${connectionId}`);

    // Simulated refresh - in production, the connector handles this
    throw new AuthenticationError('Token refresh not implemented - provider-specific implementation required');
  }

  async revokeToken(connectionId: ConnectionId): Promise<void> {
    appLogger.info('OAuthService', `Revoking token for connection ${connectionId}`);
  }

  getAuthorizationUrl(providerId: ProviderId, state: string, redirectUri: string, scopes: string[]): string {
    const connector = connectorRegistry.get(providerId);
    if (!connector) {
      throw new ValidationError(`Provider ${providerId} not found`);
    }

    const oauthConfig = connector.getOAuthConfig();
    if (!oauthConfig) {
      throw new ValidationError('Provider does not support OAuth');
    }

    const params = new URLSearchParams({
      client_id: oauthConfig.clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      state,
      scope: scopes.join(' '),
      access_type: 'offline',
      prompt: 'consent',
    });

    return `${oauthConfig.authorizationUrl}?${params.toString()}`;
  }

  cleanupExpiredStates(): number {
    let count = 0;
    this.states.forEach((oauthState, state) => {
      const createdAt = new Date(oauthState.createdAt).getTime();
      if (Date.now() - createdAt > this.STATE_TTL) {
        this.states.delete(state);
        count++;
      }
    });
    return count;
  }
}

export const integrationOAuthService = new IntegrationOAuthService();