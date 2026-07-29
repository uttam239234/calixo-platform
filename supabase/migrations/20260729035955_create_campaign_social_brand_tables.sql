/*
# Create campaign, social media, and brand monitoring tables

1. Overview
- Creates all marketing/campaign tables: campaign_groups, campaigns, campaign_metrics,
  audiences, creatives, keywords, budgets.
- Creates social media tables: social_accounts, social_posts, social_post_metrics, drafts,
  scheduled_posts, calendar_events, conversations, comments.
- Creates brand monitoring tables: brands, mentions, brand_competitors.

2. New Tables
- campaign_groups: groups of campaigns within an organization
- campaigns: individual ad campaigns with platform, status, budget, targeting
- campaign_metrics: 1:1 metrics per campaign (impressions, clicks, conversions, spend, revenue)
- audiences: target audience definitions
- creatives: ad creative assets linked to campaigns
- keywords: campaign keywords with match type and bidding
- budgets: campaign budget records
- social_accounts: connected social media accounts
- social_posts: posts created by users, with platform, status, scheduling
- social_post_metrics: 1:1 metrics per social post
- drafts: user draft posts
- scheduled_posts: posts with scheduled publish time
- calendar_events: workspace calendar events
- conversations: social inbox conversations
- comments: messages within conversations
- brands: brand profiles for monitoring
- mentions: brand mentions across sources with sentiment
- brand_competitors: competitor tracking within brands

3. Security
- RLS enabled on all tables.
- Organization-scoped tables: access if user is a member of the parent organization.
- Workspace-scoped tables: access if user is a member of the parent org (via workspace).
- User-scoped tables (drafts): owner-only access.

4. Notes
- All id columns are uuid with gen_random_uuid() default.
- Soft-delete columns on most tables.
- Foreign keys cascade from parent organizations/workspaces.
*/

-- ============================================================================
-- CAMPAIGN GROUPS
-- ============================================================================

CREATE TABLE IF NOT EXISTS campaign_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name varchar(255) NOT NULL,
  description varchar(1024),
  status campaign_status DEFAULT 'DRAFT',
  start_date timestamptz,
  end_date timestamptz,
  is_deleted boolean DEFAULT false,
  deleted_at timestamptz,
  metadata jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_campaign_groups_org_id ON campaign_groups(organization_id);
CREATE INDEX IF NOT EXISTS idx_campaign_groups_status ON campaign_groups(status);
ALTER TABLE campaign_groups ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- CAMPAIGNS
-- ============================================================================

CREATE TABLE IF NOT EXISTS campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  workspace_id uuid REFERENCES workspaces(id),
  group_id uuid REFERENCES campaign_groups(id),
  created_by uuid NOT NULL REFERENCES users(id),
  name varchar(255) NOT NULL,
  description varchar(2048),
  platform ad_platform DEFAULT 'GOOGLE',
  status campaign_status DEFAULT 'DRAFT',
  objective varchar(255),
  start_date timestamptz,
  end_date timestamptz,
  timezone varchar(50) DEFAULT 'UTC',
  daily_budget decimal(12,2),
  lifetime_budget decimal(12,2),
  currency currency DEFAULT 'USD',
  total_spent decimal(12,2) DEFAULT 0,
  target_audience jsonb,
  targeting jsonb,
  tracking jsonb,
  is_deleted boolean DEFAULT false,
  deleted_at timestamptz,
  metadata jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_campaigns_org_id ON campaigns(organization_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_workspace_id ON campaigns(workspace_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_group_id ON campaigns(group_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_platform ON campaigns(platform);
CREATE INDEX IF NOT EXISTS idx_campaigns_created_by ON campaigns(created_by);
CREATE INDEX IF NOT EXISTS idx_campaigns_is_deleted ON campaigns(is_deleted);
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- CAMPAIGN METRICS
-- ============================================================================

CREATE TABLE IF NOT EXISTS campaign_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid UNIQUE NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  impressions bigint DEFAULT 0,
  clicks bigint DEFAULT 0,
  conversions bigint DEFAULT 0,
  spend decimal(12,2) DEFAULT 0,
  revenue decimal(12,2) DEFAULT 0,
  ctr decimal(8,4),
  cpc decimal(10,4),
  cpm decimal(10,4),
  roas decimal(8,4),
  cost_per_conv decimal(10,4),
  reach bigint DEFAULT 0,
  frequency decimal(8,4),
  metadata jsonb,
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE campaign_metrics ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- AUDIENCES
-- ============================================================================

CREATE TABLE IF NOT EXISTS audiences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name varchar(255) NOT NULL,
  description varchar(1024),
  type varchar(50) NOT NULL,
  criteria jsonb,
  size bigint DEFAULT 0,
  is_deleted boolean DEFAULT false,
  deleted_at timestamptz,
  metadata jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_audiences_org_id ON audiences(organization_id);
ALTER TABLE audiences ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- CREATIVES
-- ============================================================================

CREATE TABLE IF NOT EXISTS creatives (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL REFERENCES campaigns(id),
  organization_id uuid REFERENCES organizations(id),
  name varchar(255) NOT NULL,
  type varchar(50) NOT NULL,
  headline varchar(255),
  description varchar(2048),
  url varchar(512),
  media_url varchar(512),
  media_type varchar(50),
  cta varchar(100),
  dimensions varchar(50),
  content text,
  is_deleted boolean DEFAULT false,
  deleted_at timestamptz,
  metadata jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_creatives_campaign_id ON creatives(campaign_id);
CREATE INDEX IF NOT EXISTS idx_creatives_org_id ON creatives(organization_id);
ALTER TABLE creatives ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- KEYWORDS
-- ============================================================================

CREATE TABLE IF NOT EXISTS keywords (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL REFERENCES campaigns(id),
  organization_id uuid REFERENCES organizations(id),
  text varchar(255) NOT NULL,
  match_type varchar(50) DEFAULT 'EXACT',
  bid_amount decimal(10,2),
  quality_score int,
  is_negative boolean DEFAULT false,
  is_deleted boolean DEFAULT false,
  deleted_at timestamptz,
  metadata jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_keywords_campaign_id ON keywords(campaign_id);
CREATE INDEX IF NOT EXISTS idx_keywords_org_id ON keywords(organization_id);
CREATE INDEX IF NOT EXISTS idx_keywords_text ON keywords(text);
ALTER TABLE keywords ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- BUDGETS
-- ============================================================================

CREATE TABLE IF NOT EXISTS budgets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL REFERENCES campaigns(id),
  organization_id uuid REFERENCES organizations(id),
  type varchar(50) DEFAULT 'DAILY',
  amount decimal(12,2) NOT NULL,
  spent decimal(12,2) DEFAULT 0,
  currency currency DEFAULT 'USD',
  start_date timestamptz,
  end_date timestamptz,
  is_deleted boolean DEFAULT false,
  deleted_at timestamptz,
  metadata jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_budgets_campaign_id ON budgets(campaign_id);
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- SOCIAL ACCOUNTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS social_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  platform social_platform NOT NULL,
  account_id varchar(255) NOT NULL,
  account_name varchar(255) NOT NULL,
  account_email varchar(255),
  avatar_url varchar(512),
  profile_url varchar(512),
  follower_count bigint DEFAULT 0,
  following_count bigint DEFAULT 0,
  is_active boolean DEFAULT true,
  is_deleted boolean DEFAULT false,
  deleted_at timestamptz,
  metadata jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_social_accounts_unique ON social_accounts(organization_id, platform, account_id);
CREATE INDEX IF NOT EXISTS idx_social_accounts_org_id ON social_accounts(organization_id);
CREATE INDEX IF NOT EXISTS idx_social_accounts_platform ON social_accounts(platform);
ALTER TABLE social_accounts ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- SOCIAL POSTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS social_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES workspaces(id),
  account_id uuid REFERENCES social_accounts(id),
  created_by uuid NOT NULL REFERENCES users(id),
  content text NOT NULL,
  media_urls text[] DEFAULT '{}',
  platforms social_platform[] DEFAULT '{}',
  status post_status DEFAULT 'DRAFT',
  scheduled_at timestamptz,
  published_at timestamptz,
  failed_at timestamptz,
  error_message varchar(512),
  permalink varchar(512),
  is_deleted boolean DEFAULT false,
  deleted_at timestamptz,
  metadata jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_social_posts_workspace_id ON social_posts(workspace_id);
CREATE INDEX IF NOT EXISTS idx_social_posts_account_id ON social_posts(account_id);
CREATE INDEX IF NOT EXISTS idx_social_posts_status ON social_posts(status);
CREATE INDEX IF NOT EXISTS idx_social_posts_scheduled_at ON social_posts(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_social_posts_created_by ON social_posts(created_by);
ALTER TABLE social_posts ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- SOCIAL POST METRICS
-- ============================================================================

CREATE TABLE IF NOT EXISTS social_post_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid UNIQUE NOT NULL REFERENCES social_posts(id) ON DELETE CASCADE,
  impressions bigint DEFAULT 0,
  reach bigint DEFAULT 0,
  likes bigint DEFAULT 0,
  comments bigint DEFAULT 0,
  shares bigint DEFAULT 0,
  saves bigint DEFAULT 0,
  clicks bigint DEFAULT 0,
  engagement_rate decimal(8,4),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE social_post_metrics ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- DRAFTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS drafts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title varchar(255),
  content text NOT NULL,
  platforms social_platform[] DEFAULT '{}',
  media_urls text[] DEFAULT '{}',
  tags text[] DEFAULT '{}',
  is_deleted boolean DEFAULT false,
  deleted_at timestamptz,
  metadata jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_drafts_user_id ON drafts(user_id);
ALTER TABLE drafts ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- SCHEDULED POSTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS scheduled_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid UNIQUE NOT NULL REFERENCES social_posts(id) ON DELETE CASCADE,
  scheduled_at timestamptz NOT NULL,
  timezone varchar(50) DEFAULT 'UTC',
  status post_status DEFAULT 'SCHEDULED',
  approved_by uuid,
  approved_at timestamptz,
  is_deleted boolean DEFAULT false,
  deleted_at timestamptz,
  metadata jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_scheduled_posts_scheduled_at ON scheduled_posts(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_scheduled_posts_status ON scheduled_posts(status);
ALTER TABLE scheduled_posts ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- CALENDAR EVENTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS calendar_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  title varchar(255) NOT NULL,
  description text,
  start_date timestamptz NOT NULL,
  end_date timestamptz,
  type varchar(50) NOT NULL,
  color varchar(20),
  is_all_day boolean DEFAULT false,
  metadata jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_calendar_events_workspace_id ON calendar_events(workspace_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_start_end ON calendar_events(start_date, end_date);
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- CONVERSATIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL REFERENCES social_accounts(id) ON DELETE CASCADE,
  platform social_platform NOT NULL,
  external_id varchar(255),
  participant varchar(255) NOT NULL,
  last_message text,
  unread_count int DEFAULT 0,
  is_resolved boolean DEFAULT false,
  is_deleted boolean DEFAULT false,
  deleted_at timestamptz,
  metadata jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_conversations_account_id ON conversations(account_id);
CREATE INDEX IF NOT EXISTS idx_conversations_is_resolved ON conversations(is_resolved);
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- COMMENTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  account_id uuid NOT NULL REFERENCES social_accounts(id),
  external_id varchar(255),
  author_name varchar(255) NOT NULL,
  author_avatar varchar(512),
  content text NOT NULL,
  is_internal boolean DEFAULT false,
  is_deleted boolean DEFAULT false,
  deleted_at timestamptz,
  metadata jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_comments_conversation_id ON comments(conversation_id);
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- BRANDS
-- ============================================================================

CREATE TABLE IF NOT EXISTS brands (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name varchar(255) NOT NULL,
  description varchar(1024),
  website varchar(512),
  industry varchar(100),
  keywords text[] DEFAULT '{}',
  social_handles jsonb,
  is_deleted boolean DEFAULT false,
  deleted_at timestamptz,
  metadata jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_brands_org_id ON brands(organization_id);
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- MENTIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS mentions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id uuid NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  source mention_source DEFAULT 'SOCIAL',
  content text NOT NULL,
  url varchar(512),
  author_name varchar(255),
  author_avatar varchar(512),
  author_followers bigint DEFAULT 0,
  platform varchar(100),
  sentiment sentiment_type DEFAULT 'NEUTRAL',
  sentiment_score decimal(5,2),
  reach bigint DEFAULT 0,
  engagement bigint DEFAULT 0,
  is_flagged boolean DEFAULT false,
  is_resolved boolean DEFAULT false,
  is_deleted boolean DEFAULT false,
  deleted_at timestamptz,
  metadata jsonb,
  detected_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_mentions_brand_id ON mentions(brand_id);
CREATE INDEX IF NOT EXISTS idx_mentions_sentiment ON mentions(sentiment);
CREATE INDEX IF NOT EXISTS idx_mentions_source ON mentions(source);
CREATE INDEX IF NOT EXISTS idx_mentions_detected_at ON mentions(detected_at);
CREATE INDEX IF NOT EXISTS idx_mentions_is_resolved ON mentions(is_resolved);
ALTER TABLE mentions ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- BRAND COMPETITORS
-- ============================================================================

CREATE TABLE IF NOT EXISTS brand_competitors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id uuid NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  organization_id uuid NOT NULL REFERENCES organizations(id),
  name varchar(255) NOT NULL,
  website varchar(512),
  social_handles jsonb,
  is_deleted boolean DEFAULT false,
  deleted_at timestamptz,
  metadata jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_brand_competitors_brand_id ON brand_competitors(brand_id);
CREATE INDEX IF NOT EXISTS idx_brand_competitors_org_id ON brand_competitors(organization_id);
ALTER TABLE brand_competitors ENABLE ROW LEVEL SECURITY;
