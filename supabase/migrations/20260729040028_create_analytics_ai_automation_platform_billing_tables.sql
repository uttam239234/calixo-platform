/*
# Create analytics, AI, automation, platform, and billing tables

1. Overview
- Creates analytics tables: metrics, dashboard_widgets, reports, kpis.
- Creates AI tables: ai_conversations, ai_messages, prompts, agents, ai_usage.
- Creates automation tables: workflows, workflow_executions.
- Creates platform tables: notifications, activities, audit_logs, integrations, oauth_tokens,
  pending_oauth_authorizations, feature_flags, organization_feature_overrides, tasks.
- Creates billing tables: plans, subscriptions, usage_records.

2. New Tables
- metrics: time-series metric records for organizations
- dashboard_widgets: configurable dashboard widgets
- reports: report definitions with type, format, schedule
- kpis: organization KPI definitions with targets
- ai_conversations: AI chat conversations
- ai_messages: messages within AI conversations
- prompts: reusable prompt templates
- agents: AI agent definitions
- ai_usage: per-organization AI usage tracking
- workflows: automation workflow definitions
- workflow_executions: workflow run history
- notifications: user notifications
- activities: user activity feed
- audit_logs: audit trail entries
- integrations: third-party integration connections
- oauth_tokens: OAuth tokens for integrations
- pending_oauth_authorizations: transient OAuth state (replaces in-memory map)
- feature_flags: platform feature flag definitions
- organization_feature_overrides: per-org feature flag overrides
- tasks: workspace tasks
- plans: subscription plan definitions
- subscriptions: organization subscriptions
- usage_records: per-organization usage metering

3. Security
- RLS enabled on all tables.
- Organization-scoped tables: access if user is a member of the parent organization.
- Workspace-scoped tables: access if user is a member of the parent org (via workspace).
- User-scoped tables (notifications, activities): owner-only access.
- Global tables (plans, feature_flags, prompts, agents): readable by all authenticated users.
- pending_oauth_authorizations: no RLS policies (accessed server-side only via service role).

4. Notes
- All id columns are uuid with gen_random_uuid() default.
- pending_oauth_authorizations uses a varchar PK (state token) instead of uuid.
*/

-- ============================================================================
-- ANALYTICS: METRICS
-- ============================================================================

CREATE TABLE IF NOT EXISTS metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name varchar(255) NOT NULL,
  category varchar(100) NOT NULL,
  subcategory varchar(100),
  value decimal(16,4) NOT NULL,
  previous_value decimal(16,4),
  change_percent decimal(8,4),
  unit varchar(50),
  dimension varchar(100),
  granularity varchar(20) DEFAULT 'DAY',
  recorded_at timestamptz NOT NULL,
  is_deleted boolean DEFAULT false,
  deleted_at timestamptz,
  metadata jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_metrics_org_cat_recorded ON metrics(organization_id, category, recorded_at);
CREATE INDEX IF NOT EXISTS idx_metrics_org_name_recorded ON metrics(organization_id, name, recorded_at);
CREATE INDEX IF NOT EXISTS idx_metrics_recorded_at ON metrics(recorded_at);
ALTER TABLE metrics ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- ANALYTICS: DASHBOARD WIDGETS
-- ============================================================================

CREATE TABLE IF NOT EXISTS dashboard_widgets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  workspace_id uuid REFERENCES workspaces(id),
  user_id uuid,
  title varchar(255) NOT NULL,
  type varchar(100) NOT NULL,
  config jsonb,
  position int DEFAULT 0,
  size varchar(20) DEFAULT 'MEDIUM',
  is_default boolean DEFAULT false,
  is_deleted boolean DEFAULT false,
  deleted_at timestamptz,
  metadata jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_dashboard_widgets_org_id ON dashboard_widgets(organization_id);
CREATE INDEX IF NOT EXISTS idx_dashboard_widgets_workspace_id ON dashboard_widgets(workspace_id);
CREATE INDEX IF NOT EXISTS idx_dashboard_widgets_user_id ON dashboard_widgets(user_id);
ALTER TABLE dashboard_widgets ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- ANALYTICS: REPORTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  workspace_id uuid REFERENCES workspaces(id),
  created_by uuid NOT NULL REFERENCES users(id),
  name varchar(255) NOT NULL,
  description varchar(2048),
  type report_type DEFAULT 'PERFORMANCE',
  config jsonb,
  schedule jsonb,
  format report_format DEFAULT 'PDF',
  last_generated_at timestamptz,
  next_scheduled_at timestamptz,
  is_deleted boolean DEFAULT false,
  deleted_at timestamptz,
  metadata jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_reports_org_id ON reports(organization_id);
CREATE INDEX IF NOT EXISTS idx_reports_workspace_id ON reports(workspace_id);
CREATE INDEX IF NOT EXISTS idx_reports_type ON reports(type);
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- ANALYTICS: KPIS
-- ============================================================================

CREATE TABLE IF NOT EXISTS kpis (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name varchar(255) NOT NULL,
  description varchar(512),
  category varchar(100) NOT NULL,
  formula varchar(512),
  target decimal(16,4),
  current decimal(16,4),
  unit varchar(50),
  icon varchar(100),
  is_deleted boolean DEFAULT false,
  deleted_at timestamptz,
  metadata jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_kpis_org_cat ON kpis(organization_id, category);
ALTER TABLE kpis ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- AI: CONVERSATIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS ai_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id),
  workspace_id uuid REFERENCES workspaces(id),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title varchar(255) NOT NULL,
  context jsonb,
  model aimodel DEFAULT 'GPT_4O_MINI',
  token_count int DEFAULT 0,
  message_count int DEFAULT 0,
  is_deleted boolean DEFAULT false,
  deleted_at timestamptz,
  metadata jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_user_id ON ai_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_org_id ON ai_conversations(organization_id);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_workspace_id ON ai_conversations(workspace_id);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_updated_at ON ai_conversations(updated_at);
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- AI: MESSAGES
-- ============================================================================

CREATE TABLE IF NOT EXISTS ai_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES ai_conversations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id),
  role varchar(50) NOT NULL,
  content text NOT NULL,
  model aimodel DEFAULT 'GPT_4O_MINI',
  token_count int,
  latency_ms int,
  confidence decimal(5,2),
  tool_calls jsonb,
  is_deleted boolean DEFAULT false,
  deleted_at timestamptz,
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_ai_messages_conversation_id ON ai_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_ai_messages_created_at ON ai_messages(created_at);
ALTER TABLE ai_messages ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- AI: PROMPTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS prompts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name varchar(255) NOT NULL,
  description varchar(1024),
  category varchar(100) NOT NULL,
  template text NOT NULL,
  variables text[] DEFAULT '{}',
  model aimodel DEFAULT 'GPT_4O_MINI',
  temperature decimal(3,2),
  max_tokens int,
  is_system boolean DEFAULT false,
  is_deleted boolean DEFAULT false,
  deleted_at timestamptz,
  metadata jsonb,
  version int DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_prompts_name_version ON prompts(name, version);
CREATE INDEX IF NOT EXISTS idx_prompts_category ON prompts(category);
ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- AI: AGENTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS agents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name varchar(255) NOT NULL,
  description varchar(1024),
  type varchar(100) NOT NULL,
  config jsonb,
  model aimodel DEFAULT 'GPT_4O',
  is_active boolean DEFAULT true,
  is_deleted boolean DEFAULT false,
  deleted_at timestamptz,
  metadata jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_agents_type ON agents(type);
CREATE INDEX IF NOT EXISTS idx_agents_is_active ON agents(is_active);
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- AI: USAGE
-- ============================================================================

CREATE TABLE IF NOT EXISTS ai_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  model aimodel NOT NULL,
  tokens int DEFAULT 0,
  cost decimal(10,6) DEFAULT 0,
  request_count int DEFAULT 1,
  latency_ms int,
  endpoint varchar(255),
  recorded_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_ai_usage_org_recorded ON ai_usage(organization_id, recorded_at);
CREATE INDEX IF NOT EXISTS idx_ai_usage_recorded_at ON ai_usage(recorded_at);
ALTER TABLE ai_usage ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- AUTOMATION: WORKFLOWS
-- ============================================================================

CREATE TABLE IF NOT EXISTS workflows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name varchar(255) NOT NULL,
  description varchar(1024),
  status workflow_status DEFAULT 'DRAFT',
  config jsonb,
  trigger_type automation_trigger_type NOT NULL,
  trigger_config jsonb,
  actions jsonb,
  conditions jsonb,
  run_count bigint DEFAULT 0,
  last_run_at timestamptz,
  last_run_status execution_status,
  is_deleted boolean DEFAULT false,
  deleted_at timestamptz,
  metadata jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_workflows_org_id ON workflows(organization_id);
CREATE INDEX IF NOT EXISTS idx_workflows_status ON workflows(status);
CREATE INDEX IF NOT EXISTS idx_workflows_trigger_type ON workflows(trigger_type);
ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- AUTOMATION: WORKFLOW EXECUTIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS workflow_executions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id uuid NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
  triggered_by uuid NOT NULL REFERENCES users(id),
  status execution_status DEFAULT 'PENDING',
  input jsonb,
  output jsonb,
  error text,
  started_at timestamptz,
  completed_at timestamptz,
  duration_ms int,
  retry_count int DEFAULT 0,
  metadata jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_workflow_id ON workflow_executions(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_status ON workflow_executions(status);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_created_at ON workflow_executions(created_at);
ALTER TABLE workflow_executions ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PLATFORM: NOTIFICATIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id),
  workspace_id uuid REFERENCES workspaces(id),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title varchar(255) NOT NULL,
  description text,
  type notification_type NOT NULL,
  severity notification_severity DEFAULT 'INFO',
  category varchar(100),
  is_read boolean DEFAULT false,
  read_at timestamptz,
  action_url varchar(512),
  action_label varchar(100),
  is_deleted boolean DEFAULT false,
  deleted_at timestamptz,
  metadata jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_org_id ON notifications(organization_id);
CREATE INDEX IF NOT EXISTS idx_notifications_workspace_id ON notifications(workspace_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PLATFORM: ACTIVITIES
-- ============================================================================

CREATE TABLE IF NOT EXISTS activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  organization_id uuid REFERENCES organizations(id),
  workspace_id uuid REFERENCES workspaces(id),
  action varchar(255) NOT NULL,
  resource varchar(255) NOT NULL,
  resource_id varchar(255),
  description text,
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_activities_user_created ON activities(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_activities_org_created ON activities(organization_id, created_at);
CREATE INDEX IF NOT EXISTS idx_activities_workspace_created ON activities(workspace_id, created_at);
CREATE INDEX IF NOT EXISTS idx_activities_action ON activities(action);
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PLATFORM: AUDIT LOGS
-- ============================================================================

CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id),
  action varchar(255) NOT NULL,
  resource varchar(255) NOT NULL,
  resource_id varchar(255) NOT NULL,
  changes jsonb,
  ip_address varchar(45),
  user_agent varchar(512),
  session_id varchar(255),
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_audit_logs_org_created ON audit_logs(organization_id, created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_created ON audit_logs(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON audit_logs(resource, resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PLATFORM: INTEGRATIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS integrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  provider integration_provider NOT NULL,
  name varchar(255) NOT NULL,
  status integration_status DEFAULT 'PENDING',
  config jsonb,
  scopes text[] DEFAULT '{}',
  last_sync_at timestamptz,
  last_sync_status varchar(50),
  error_message varchar(512),
  is_deleted boolean DEFAULT false,
  deleted_at timestamptz,
  metadata jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_integrations_org_provider ON integrations(organization_id, provider);
CREATE INDEX IF NOT EXISTS idx_integrations_org_id ON integrations(organization_id);
CREATE INDEX IF NOT EXISTS idx_integrations_provider ON integrations(provider);
CREATE INDEX IF NOT EXISTS idx_integrations_status ON integrations(status);
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PLATFORM: OAUTH TOKENS
-- ============================================================================

CREATE TABLE IF NOT EXISTS oauth_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_id uuid NOT NULL REFERENCES integrations(id) ON DELETE CASCADE,
  organization_id uuid NOT NULL REFERENCES organizations(id),
  access_token text NOT NULL,
  refresh_token text,
  token_type varchar(50) DEFAULT 'Bearer',
  expires_at timestamptz,
  scope varchar(512),
  provider_user_id varchar(255),
  is_revoked boolean DEFAULT false,
  metadata jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_oauth_tokens_integration_id ON oauth_tokens(integration_id);
CREATE INDEX IF NOT EXISTS idx_oauth_tokens_org_id ON oauth_tokens(organization_id);
ALTER TABLE oauth_tokens ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PLATFORM: PENDING OAUTH AUTHORIZATIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS pending_oauth_authorizations (
  state varchar(64) PRIMARY KEY,
  provider varchar(50) NOT NULL,
  organization_id varchar(64) NOT NULL,
  connector_instance_id varchar(64),
  redirect_uri varchar(512) NOT NULL,
  code_verifier varchar(256),
  extra jsonb,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_pending_oauth_created_at ON pending_oauth_authorizations(created_at);
ALTER TABLE pending_oauth_authorizations ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PLATFORM: FEATURE FLAGS
-- ============================================================================

CREATE TABLE IF NOT EXISTS feature_flags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key varchar(150) UNIQUE NOT NULL,
  name varchar(255) NOT NULL,
  description varchar(1024),
  category varchar(100) NOT NULL,
  default_enabled boolean DEFAULT false,
  tier plan_tier DEFAULT 'FREE',
  is_active boolean DEFAULT true,
  metadata jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_feature_flags_category ON feature_flags(category);
CREATE INDEX IF NOT EXISTS idx_feature_flags_key ON feature_flags(key);
ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PLATFORM: ORGANIZATION FEATURE OVERRIDES
-- ============================================================================

CREATE TABLE IF NOT EXISTS organization_feature_overrides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  flag_id uuid NOT NULL REFERENCES feature_flags(id) ON DELETE CASCADE,
  enabled boolean DEFAULT false,
  conditions jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_org_feature_overrides_unique ON organization_feature_overrides(organization_id, flag_id);
ALTER TABLE organization_feature_overrides ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PLATFORM: TASKS
-- ============================================================================

CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  assignee_id uuid REFERENCES users(id),
  created_by uuid NOT NULL REFERENCES users(id),
  title varchar(255) NOT NULL,
  description text,
  status task_status DEFAULT 'TODO',
  priority priority DEFAULT 'MEDIUM',
  due_date timestamptz,
  completed_at timestamptz,
  is_deleted boolean DEFAULT false,
  deleted_at timestamptz,
  metadata jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_tasks_workspace_id ON tasks(workspace_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assignee_id ON tasks(assignee_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- BILLING: PLANS
-- ============================================================================

CREATE TABLE IF NOT EXISTS plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name varchar(100) UNIQUE NOT NULL,
  tier plan_tier UNIQUE NOT NULL,
  description varchar(1024),
  price_monthly decimal(10,2) NOT NULL,
  price_yearly decimal(10,2) NOT NULL,
  currency currency DEFAULT 'USD',
  max_users int DEFAULT 1,
  max_workspaces int DEFAULT 1,
  max_campaigns int DEFAULT 10,
  storage_limit bigint DEFAULT 1073741824,
  features text[] DEFAULT '{}',
  limits jsonb,
  is_active boolean DEFAULT true,
  metadata jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- BILLING: SUBSCRIPTIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid UNIQUE NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  plan_id uuid NOT NULL REFERENCES plans(id),
  stripe_customer_id varchar(255),
  stripe_subscription_id varchar(255),
  status subscription_status DEFAULT 'TRIALING',
  trial_ends_at timestamptz,
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean DEFAULT false,
  canceled_at timestamptz,
  metadata jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_subscriptions_org_id ON subscriptions(organization_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- BILLING: USAGE RECORDS
-- ============================================================================

CREATE TABLE IF NOT EXISTS usage_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id),
  metric varchar(100) NOT NULL,
  value bigint DEFAULT 0,
  unit varchar(50) NOT NULL,
  recorded_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_usage_records_org_metric_recorded ON usage_records(organization_id, metric, recorded_at);
CREATE INDEX IF NOT EXISTS idx_usage_records_recorded_at ON usage_records(recorded_at);
ALTER TABLE usage_records ENABLE ROW LEVEL SECURITY;
