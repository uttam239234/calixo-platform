-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "pending_oauth_authorizations" (
    "state" VARCHAR(64) NOT NULL,
    "provider" VARCHAR(50) NOT NULL,
    "organizationId" VARCHAR(64) NOT NULL,
    "connectorInstanceId" VARCHAR(64),
    "redirectUri" VARCHAR(512) NOT NULL,
    "codeVerifier" VARCHAR(256),
    "extra" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pending_oauth_authorizations_pkey" PRIMARY KEY ("state")
);

-- CreateIndex
CREATE INDEX "pending_oauth_authorizations_createdAt_idx" ON "pending_oauth_authorizations"("createdAt");
