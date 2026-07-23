/**
 * Calixo Platform - Legacy Integrations Utilities
 *
 * The connector registry/service/OAuth/sync layers that used to live here
 * were removed when Settings -> Integrations migrated onto the Universal
 * Connector Framework (`@/core/connectors`). What remains is genuinely
 * independent of connector installs: the generic `SecretVault` crypto
 * class (reused by several unrelated subsystems) and the webhook
 * registration/delivery bookkeeping Settings -> API's Developer Console
 * still depends on for its own outbound-webhook feature. No barrel export
 * here — both are imported from their deep paths, as before.
 */
