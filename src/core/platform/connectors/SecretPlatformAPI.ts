/**
 * Calixo Platform - Secret Platform API
 *
 * The sanctioned way to seal/reveal/rotate connector secrets — wraps the
 * real `SecretVault` (Web Crypto AES-256-GCM). No module should read a raw
 * secret string off a `Connection` object; every reveal goes through here
 * so it's the one auditable choke point.
 */
import { secretVault } from "@/integrations/secrets/SecretVault";
import { platformEventBus } from "../events/PlatformEventBus";
import { auditService } from "@/access/audit/AuditService";

export class SecretPlatformAPI {
  seal(plaintext: string): Promise<string> {
    return secretVault.seal(plaintext);
  }

  reveal(reference: string): Promise<string> {
    return secretVault.reveal(reference);
  }

  revoke(reference: string): boolean {
    return secretVault.revoke(reference);
  }

  isSealed(value: string): boolean {
    return secretVault.isReference(value);
  }

  async rotateKey(actorId: string): Promise<string> {
    const newKeyId = await secretVault.rotateKey();
    await auditService.recordEvent({
      userId: actorId,
      eventType: "entity_updated",
      resource: "secret_vault_key",
      resourceId: newKeyId,
      description: "Secret Vault encryption key rotated",
    });
    await platformEventBus.publish({ type: "SecretRotated", userId: actorId, payload: { newKeyId } });
    return newKeyId;
  }

  keyCount(): number {
    return secretVault.keyCount();
  }

  count(): number {
    return secretVault.count();
  }
}

export const secretPlatformAPI = new SecretPlatformAPI();
