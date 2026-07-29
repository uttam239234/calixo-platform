/*
# Create enums and identity/auth tables

1. Overview
- Creates all PostgreSQL enums used across the Calixo platform.
- Creates the identity/auth tables: users, user_preferences, sessions, refresh_tokens, api_keys.

2. Enums created
- user_role, plan_tier, subscription_status, campaign_status, ad_platform, social_platform, post_status, mention_source, sentiment_type, notification_type, notification_severity, integration_provider, integration_status, report_type, report_format, workflow_status, execution_status, automation_trigger_type, aimodel, task_status, priority, currency, week_day

3. New Tables
- users: core user profile with email, password hash, locale, timezone, soft-delete
- user_preferences: per-user UI/notification preferences (1:1 with users)
- sessions: active login sessions with expiry and revocation
- refresh_tokens: JWT refresh tokens with family tracking and revocation
- api_keys: organization/user API keys with scopes and soft-delete

4. Security
- RLS enabled on all tables.
- Users: owner-scoped CRUD (auth.uid = id).
- user_preferences: owner-scoped via user_id.
- sessions/refresh_tokens: owner-scoped via user_id.
- api_keys: owner-scoped via user_id.

5. Notes
- All id columns are uuid with gen_random_uuid() default.
- All tables have created_at/updated_at timestamps.
- Soft-delete columns (is_deleted, deleted_at) on users and api_keys.
*/

-- ============================================================================
-- ENUMS
-- ============================================================================

DO $$ BEGIN
CREATE TYPE user_role AS ENUM ('SUPER_ADMIN', 'ADMIN', 'EDITOR', 'VIEWER', 'CUSTOM');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
CREATE TYPE plan_tier AS ENUM ('FREE', 'STARTER', 'PROFESSIONAL', 'ENTERPRISE', 'AGENCY');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
CREATE TYPE subscription_status AS ENUM ('ACTIVE', 'PAST_DUE', 'CANCELED', 'EXPIRED', 'TRIALING', 'INCOMPLETE');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
CREATE TYPE campaign_status AS ENUM ('DRAFT', 'ACTIVE', 'PAUSED', 'ENDED', 'ARCHIVED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
CREATE TYPE ad_platform AS ENUM ('GOOGLE', 'META', 'LINKEDIN', 'TIKTOK', 'TWITTER', 'PINTEREST', 'SNAPCHAT');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
CREATE TYPE social_platform AS ENUM ('INSTAGRAM', 'FACEBOOK', 'TWITTER', 'LINKEDIN', 'TIKTOK', 'YOUTUBE', 'PINTEREST');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
CREATE TYPE post_status AS ENUM ('DRAFT', 'SCHEDULED', 'PUBLISHING', 'PUBLISHED', 'FAILED', 'CANCELLED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
CREATE TYPE mention_source AS ENUM ('SOCIAL', 'NEWS', 'REVIEW', 'FORUM', 'BLOG', 'PODCAST', 'VIDEO');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
CREATE TYPE sentiment_type AS ENUM ('POSITIVE', 'NEUTRAL', 'NEGATIVE', 'MIXED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
CREATE TYPE notification_type AS ENUM ('CAMPAIGN_STARTED', 'CAMPAIGN_ENDED', 'BUDGET_ALERT', 'AI_INSIGHT', 'TEAM_UPDATE', 'SYSTEM', 'BILLING', 'MILESTONE');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
CREATE TYPE notification_severity AS ENUM ('CRITICAL', 'WARNING', 'INFO', 'SUCCESS');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
CREATE TYPE integration_provider AS ENUM ('GOOGLE_ADS', 'META_ADS', 'LINKEDIN_ADS', 'GOOGLE_ANALYTICS', 'SALESFORCE', 'HUBSPOT', 'SLACK', 'SHOPIFY', 'ZAPIER', 'CUSTOM');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
CREATE TYPE integration_status AS ENUM ('CONNECTED', 'DISCONNECTED', 'ERROR', 'EXPIRED', 'PENDING');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
CREATE TYPE report_type AS ENUM ('PERFORMANCE', 'ANALYTICS', 'CAMPAIGN', 'SOCIAL', 'CUSTOM', 'SCHEDULED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
CREATE TYPE report_format AS ENUM ('PDF', 'CSV', 'EXCEL', 'HTML');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
CREATE TYPE workflow_status AS ENUM ('ACTIVE', 'PAUSED', 'DRAFT', 'ARCHIVED', 'ERROR');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
CREATE TYPE execution_status AS ENUM ('PENDING', 'RUNNING', 'SUCCESS', 'FAILED', 'CANCELLED', 'SKIPPED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
CREATE TYPE automation_trigger_type AS ENUM ('SCHEDULE', 'EVENT', 'WEBHOOK', 'CONDITION');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
CREATE TYPE aimodel AS ENUM ('GPT_4O', 'GPT_4O_MINI', 'CLAUDE_3_SONNET', 'CLAUDE_3_HAIKU', 'EMBEDDING_3_LARGE', 'DALL_E_3', 'WHISPER');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
CREATE TYPE task_status AS ENUM ('TODO', 'IN_PROGRESS', 'DONE', 'CANCELLED', 'BLOCKED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
CREATE TYPE priority AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
CREATE TYPE currency AS ENUM ('USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'INR', 'BRL');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
CREATE TYPE week_day AS ENUM ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- ============================================================================
-- USERS
-- ============================================================================

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email varchar(255) UNIQUE NOT NULL,
  email_verified boolean DEFAULT false,
  name varchar(255) NOT NULL,
  avatar varchar(512),
  password_hash varchar(512),
  phone varchar(50),
  locale varchar(10) DEFAULT 'en-US',
  timezone varchar(50) DEFAULT 'UTC',
  last_login_at timestamptz,
  is_active boolean DEFAULT true,
  is_deleted boolean DEFAULT false,
  deleted_at timestamptz,
  metadata jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_active_deleted ON users(is_active, is_deleted);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_users" ON users;
CREATE POLICY "select_own_users" ON users FOR SELECT TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "insert_own_users" ON users;
CREATE POLICY "insert_own_users" ON users FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "update_own_users" ON users;
CREATE POLICY "update_own_users" ON users FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- ============================================================================
-- USER PREFERENCES
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  theme varchar(20) DEFAULT 'light',
  sidebar_collapsed boolean DEFAULT false,
  email_notifications boolean DEFAULT true,
  push_notifications boolean DEFAULT true,
  in_app_notifications boolean DEFAULT true,
  digest_frequency varchar(20) DEFAULT 'never',
  dashboard_layout jsonb,
  notification_preferences jsonb,
  metadata jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_prefs" ON user_preferences;
CREATE POLICY "select_own_prefs" ON user_preferences FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_prefs" ON user_preferences;
CREATE POLICY "insert_own_prefs" ON user_preferences FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_prefs" ON user_preferences;
CREATE POLICY "update_own_prefs" ON user_preferences FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_prefs" ON user_preferences;
CREATE POLICY "delete_own_prefs" ON user_preferences FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ============================================================================
-- SESSIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token varchar(512) UNIQUE NOT NULL,
  ip_address varchar(45),
  user_agent varchar(512),
  device_info jsonb,
  expires_at timestamptz NOT NULL,
  is_revoked boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);

ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_sessions" ON sessions;
CREATE POLICY "select_own_sessions" ON sessions FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_sessions" ON sessions;
CREATE POLICY "insert_own_sessions" ON sessions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_sessions" ON sessions;
CREATE POLICY "delete_own_sessions" ON sessions FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ============================================================================
-- REFRESH TOKENS
-- ============================================================================

CREATE TABLE IF NOT EXISTS refresh_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token varchar(512) UNIQUE NOT NULL,
  family_id varchar(128),
  expires_at timestamptz NOT NULL,
  is_revoked boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token ON refresh_tokens(token);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_family_id ON refresh_tokens(family_id);

ALTER TABLE refresh_tokens ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_refresh_tokens" ON refresh_tokens;
CREATE POLICY "select_own_refresh_tokens" ON refresh_tokens FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_refresh_tokens" ON refresh_tokens;
CREATE POLICY "insert_own_refresh_tokens" ON refresh_tokens FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_refresh_tokens" ON refresh_tokens;
CREATE POLICY "delete_own_refresh_tokens" ON refresh_tokens FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ============================================================================
-- API KEYS
-- ============================================================================

CREATE TABLE IF NOT EXISTS api_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name varchar(255) NOT NULL,
  key varchar(512) UNIQUE NOT NULL,
  key_prefix varchar(20) NOT NULL,
  scopes text[] DEFAULT '{}',
  permissions text[] DEFAULT '{}',
  last_used_at timestamptz,
  expires_at timestamptz,
  is_active boolean DEFAULT true,
  is_deleted boolean DEFAULT false,
  deleted_at timestamptz,
  metadata jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_org_id ON api_keys(organization_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_prefix ON api_keys(key_prefix);

ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_api_keys" ON api_keys;
CREATE POLICY "select_own_api_keys" ON api_keys FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_api_keys" ON api_keys;
CREATE POLICY "insert_own_api_keys" ON api_keys FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_api_keys" ON api_keys;
CREATE POLICY "update_own_api_keys" ON api_keys FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_api_keys" ON api_keys;
CREATE POLICY "delete_own_api_keys" ON api_keys FOR DELETE TO authenticated USING (auth.uid() = user_id);
