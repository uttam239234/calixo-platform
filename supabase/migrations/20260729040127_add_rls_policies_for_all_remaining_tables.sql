/*
# Add RLS policies for campaign, social, brand, analytics, AI, automation, and platform tables

1. Overview
- Adds Row Level Security policies to all tables created in the previous two migrations.
- Organization-scoped tables: access if user is a member of the parent organization.
- User-scoped tables (notifications, activities, drafts): owner-only access.
- Global tables (plans, feature_flags, prompts, agents, roles, permissions): readable by all authenticated users.
- pending_oauth_authorizations: no policies (server-side only via service role).

2. Security patterns
- Org-scoped: USING (EXISTS (SELECT 1 FROM organization_members WHERE organization_members.organization_id = <table>.organization_id AND organization_members.user_id = auth.uid()))
- Workspace-scoped: USING (EXISTS (SELECT 1 FROM organization_members om JOIN workspaces w ON w.organization_id = om.organization_id WHERE w.id = <table>.workspace_id AND om.user_id = auth.uid()))
- User-scoped: USING (auth.uid() = <table>.user_id)
- Global read: USING (true)
*/

-- Helper: org-scoped SELECT policy template applied per table

-- campaign_groups
DROP POLICY IF EXISTS "select_campaign_groups_if_org_member" ON campaign_groups;
CREATE POLICY "select_campaign_groups_if_org_member" ON campaign_groups FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM organization_members WHERE organization_members.organization_id = campaign_groups.organization_id AND organization_members.user_id = auth.uid()));
DROP POLICY IF EXISTS "insert_campaign_groups_if_org_member" ON campaign_groups;
CREATE POLICY "insert_campaign_groups_if_org_member" ON campaign_groups FOR INSERT TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM organization_members WHERE organization_members.organization_id = campaign_groups.organization_id AND organization_members.user_id = auth.uid()));
DROP POLICY IF EXISTS "update_campaign_groups_if_org_member" ON campaign_groups;
CREATE POLICY "update_campaign_groups_if_org_member" ON campaign_groups FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM organization_members WHERE organization_members.organization_id = campaign_groups.organization_id AND organization_members.user_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM organization_members WHERE organization_members.organization_id = campaign_groups.organization_id AND organization_members.user_id = auth.uid()));
DROP POLICY IF EXISTS "delete_campaign_groups_if_org_member" ON campaign_groups;
CREATE POLICY "delete_campaign_groups_if_org_member" ON campaign_groups FOR DELETE TO authenticated
USING (EXISTS (SELECT 1 FROM organization_members WHERE organization_members.organization_id = campaign_groups.organization_id AND organization_members.user_id = auth.uid()));

-- campaigns
DROP POLICY IF EXISTS "select_campaigns_if_org_member" ON campaigns;
CREATE POLICY "select_campaigns_if_org_member" ON campaigns FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM organization_members WHERE organization_members.organization_id = campaigns.organization_id AND organization_members.user_id = auth.uid()));
DROP POLICY IF EXISTS "insert_campaigns_if_org_member" ON campaigns;
CREATE POLICY "insert_campaigns_if_org_member" ON campaigns FOR INSERT TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM organization_members WHERE organization_members.organization_id = campaigns.organization_id AND organization_members.user_id = auth.uid()));
DROP POLICY IF EXISTS "update_campaigns_if_org_member" ON campaigns;
CREATE POLICY "update_campaigns_if_org_member" ON campaigns FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM organization_members WHERE organization_members.organization_id = campaigns.organization_id AND organization_members.user_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM organization_members WHERE organization_members.organization_id = campaigns.organization_id AND organization_members.user_id = auth.uid()));
DROP POLICY IF EXISTS "delete_campaigns_if_org_member" ON campaigns;
CREATE POLICY "delete_campaigns_if_org_member" ON campaigns FOR DELETE TO authenticated
USING (EXISTS (SELECT 1 FROM organization_members WHERE organization_members.organization_id = campaigns.organization_id AND organization_members.user_id = auth.uid()));

-- campaign_metrics (inherits from campaigns via campaign_id)
DROP POLICY IF EXISTS "select_campaign_metrics_if_org_member" ON campaign_metrics;
CREATE POLICY "select_campaign_metrics_if_org_member" ON campaign_metrics FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM campaigns WHERE campaigns.id = campaign_metrics.campaign_id AND EXISTS (SELECT 1 FROM organization_members WHERE organization_members.organization_id = campaigns.organization_id AND organization_members.user_id = auth.uid())));
DROP POLICY IF EXISTS "insert_campaign_metrics_if_org_member" ON campaign_metrics;
CREATE POLICY "insert_campaign_metrics_if_org_member" ON campaign_metrics FOR INSERT TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM campaigns WHERE campaigns.id = campaign_metrics.campaign_id AND EXISTS (SELECT 1 FROM organization_members WHERE organization_members.organization_id = campaigns.organization_id AND organization_members.user_id = auth.uid())));
DROP POLICY IF EXISTS "update_campaign_metrics_if_org_member" ON campaign_metrics;
CREATE POLICY "update_campaign_metrics_if_org_member" ON campaign_metrics FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM campaigns WHERE campaigns.id = campaign_metrics.campaign_id AND EXISTS (SELECT 1 FROM organization_members WHERE organization_members.organization_id = campaigns.organization_id AND organization_members.user_id = auth.uid())))
WITH CHECK (EXISTS (SELECT 1 FROM campaigns WHERE campaigns.id = campaign_metrics.campaign_id AND EXISTS (SELECT 1 FROM organization_members WHERE organization_members.organization_id = campaigns.organization_id AND organization_members.user_id = auth.uid())));

-- audiences
DROP POLICY IF EXISTS "select_audiences_if_org_member" ON audiences;
CREATE POLICY "select_audiences_if_org_member" ON audiences FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM organization_members WHERE organization_members.organization_id = audiences.organization_id AND organization_members.user_id = auth.uid()));
DROP POLICY IF EXISTS "insert_audiences_if_org_member" ON audiences;
CREATE POLICY "insert_audiences_if_org_member" ON audiences FOR INSERT TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM organization_members WHERE organization_members.organization_id = audiences.organization_id AND organization_members.user_id = auth.uid()));
DROP POLICY IF EXISTS "update_audiences_if_org_member" ON audiences;
CREATE POLICY "update_audiences_if_org_member" ON audiences FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM organization_members WHERE organization_members.organization_id = audiences.organization_id AND organization_members.user_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM organization_members WHERE organization_members.organization_id = audiences.organization_id AND organization_members.user_id = auth.uid()));
DROP POLICY IF EXISTS "delete_audiences_if_org_member" ON audiences;
CREATE POLICY "delete_audiences_if_org_member" ON audiences FOR DELETE TO authenticated
USING (EXISTS (SELECT 1 FROM organization_members WHERE organization_members.organization_id = audiences.organization_id AND organization_members.user_id = auth.uid()));

-- creatives (org-scoped via organization_id)
DROP POLICY IF EXISTS "select_creatives_if_org_member" ON creatives;
CREATE POLICY "select_creatives_if_org_member" ON creatives FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM organization_members WHERE organization_members.organization_id = creatives.organization_id AND organization_members.user_id = auth.uid()));
DROP POLICY IF EXISTS "insert_creatives_if_org_member" ON creatives;
CREATE POLICY "insert_creatives_if_org_member" ON creatives FOR INSERT TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM organization_members WHERE organization_members.organization_id = creatives.organization_id AND organization_members.user_id = auth.uid()));
DROP POLICY IF EXISTS "update_creatives_if_org_member" ON creatives;
CREATE POLICY "update_creatives_if_org_member" ON creatives FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM organization_members WHERE organization_members.organization_id = creatives.organization_id AND organization_members.user_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM organization_members WHERE organization_members.organization_id = creatives.organization_id AND organization_members.user_id = auth.uid()));
DROP POLICY IF EXISTS "delete_creatives_if_org_member" ON creatives;
CREATE POLICY "delete_creatives_if_org_member" ON creatives FOR DELETE TO authenticated
USING (EXISTS (SELECT 1 FROM organization_members WHERE organization_members.organization_id = creatives.organization_id AND organization_members.user_id = auth.uid()));

-- keywords (org-scoped via organization_id)
DROP POLICY IF EXISTS "select_keywords_if_org_member" ON keywords;
CREATE POLICY "select_keywords_if_org_member" ON keywords FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM organization_members WHERE organization_members.organization_id = keywords.organization_id AND organization_members.user_id = auth.uid()));
DROP POLICY IF EXISTS "insert_keywords_if_org_member" ON keywords;
CREATE POLICY "insert_keywords_if_org_member" ON keywords FOR INSERT TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM organization_members WHERE organization_members.organization_id = keywords.organization_id AND organization_members.user_id = auth.uid()));
DROP POLICY IF EXISTS "update_keywords_if_org_member" ON keywords;
CREATE POLICY "update_keywords_if_org_member" ON keywords FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM organization_members WHERE organization_members.organization_id = keywords.organization_id AND organization_members.user_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM organization_members WHERE organization_members.organization_id = keywords.organization_id AND organization_members.user_id = auth.uid()));
DROP POLICY IF EXISTS "delete_keywords_if_org_member" ON keywords;
CREATE POLICY "delete_keywords_if_org_member" ON keywords FOR DELETE TO authenticated
USING (EXISTS (SELECT 1 FROM organization_members WHERE organization_members.organization_id = keywords.organization_id AND organization_members.user_id = auth.uid()));

-- budgets (org-scoped via organization_id)
DROP POLICY IF EXISTS "select_budgets_if_org_member" ON budgets;
CREATE POLICY "select_budgets_if_org_member" ON budgets FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM organization_members WHERE organization_members.organization_id = budgets.organization_id AND organization_members.user_id = auth.uid()));
DROP POLICY IF EXISTS "insert_budgets_if_org_member" ON budgets;
CREATE POLICY "insert_budgets_if_org_member" ON budgets FOR INSERT TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM organization_members WHERE organization_members.organization_id = budgets.organization_id AND organization_members.user_id = auth.uid()));
DROP POLICY IF EXISTS "update_budgets_if_org_member" ON budgets;
CREATE POLICY "update_budgets_if_org_member" ON budgets FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM organization_members WHERE organization_members.organization_id = budgets.organization_id AND organization_members.user_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM organization_members WHERE organization_members.organization_id = budgets.organization_id AND organization_members.user_id = auth.uid()));
DROP POLICY IF EXISTS "delete_budgets_if_org_member" ON budgets;
CREATE POLICY "delete_budgets_if_org_member" ON budgets FOR DELETE TO authenticated
USING (EXISTS (SELECT 1 FROM organization_members WHERE organization_members.organization_id = budgets.organization_id AND organization_members.user_id = auth.uid()));

-- social_accounts
DROP POLICY IF EXISTS "select_social_accounts_if_org_member" ON social_accounts;
CREATE POLICY "select_social_accounts_if_org_member" ON social_accounts FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM organization_members WHERE organization_members.organization_id = social_accounts.organization_id AND organization_members.user_id = auth.uid()));
DROP POLICY IF EXISTS "insert_social_accounts_if_org_member" ON social_accounts;
CREATE POLICY "insert_social_accounts_if_org_member" ON social_accounts FOR INSERT TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM organization_members WHERE organization_members.organization_id = social_accounts.organization_id AND organization_members.user_id = auth.uid()));
DROP POLICY IF EXISTS "update_social_accounts_if_org_member" ON social_accounts;
CREATE POLICY "update_social_accounts_if_org_member" ON social_accounts FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM organization_members WHERE organization_members.organization_id = social_accounts.organization_id AND organization_members.user_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM organization_members WHERE organization_members.organization_id = social_accounts.organization_id AND organization_members.user_id = auth.uid()));
DROP POLICY IF EXISTS "delete_social_accounts_if_org_member" ON social_accounts;
CREATE POLICY "delete_social_accounts_if_org_member" ON social_accounts FOR DELETE TO authenticated
USING (EXISTS (SELECT 1 FROM organization_members WHERE organization_members.organization_id = social_accounts.organization_id AND organization_members.user_id = auth.uid()));

-- social_posts (workspace-scoped)
DROP POLICY IF EXISTS "select_social_posts_if_org_member" ON social_posts;
CREATE POLICY "select_social_posts_if_org_member" ON social_posts FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM organization_members om JOIN workspaces w ON w.organization_id = om.organization_id WHERE w.id = social_posts.workspace_id AND om.user_id = auth.uid()));
DROP POLICY IF EXISTS "insert_social_posts_if_org_member" ON social_posts;
CREATE POLICY "insert_social_posts_if_org_member" ON social_posts FOR INSERT TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM organization_members om JOIN workspaces w ON w.organization_id = om.organization_id WHERE w.id = social_posts.workspace_id AND om.user_id = auth.uid()));
DROP POLICY IF EXISTS "update_social_posts_if_org_member" ON social_posts;
CREATE POLICY "update_social_posts_if_org_member" ON social_posts FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM organization_members om JOIN workspaces w ON w.organization_id = om.organization_id WHERE w.id = social_posts.workspace_id AND om.user_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM organization_members om JOIN workspaces w ON w.organization_id = om.organization_id WHERE w.id = social_posts.workspace_id AND om.user_id = auth.uid()));
DROP POLICY IF EXISTS "delete_social_posts_if_org_member" ON social_posts;
CREATE POLICY "delete_social_posts_if_org_member" ON social_posts FOR DELETE TO authenticated
USING (EXISTS (SELECT 1 FROM organization_members om JOIN workspaces w ON w.organization_id = om.organization_id WHERE w.id = social_posts.workspace_id AND om.user_id = auth.uid()));

-- social_post_metrics (inherits from social_posts)
DROP POLICY IF EXISTS "select_social_post_metrics_if_org_member" ON social_post_metrics;
CREATE POLICY "select_social_post_metrics_if_org_member" ON social_post_metrics FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM social_posts sp JOIN workspaces w ON w.id = sp.workspace_id JOIN organization_members om ON om.organization_id = w.organization_id WHERE sp.id = social_post_metrics.post_id AND om.user_id = auth.uid()));
DROP POLICY IF EXISTS "insert_social_post_metrics_if_org_member" ON social_post_metrics;
CREATE POLICY "insert_social_post_metrics_if_org_member" ON social_post_metrics FOR INSERT TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM social_posts sp JOIN workspaces w ON w.id = sp.workspace_id JOIN organization_members om ON om.organization_id = w.organization_id WHERE sp.id = social_post_metrics.post_id AND om.user_id = auth.uid()));
DROP POLICY IF EXISTS "update_social_post_metrics_if_org_member" ON social_post_metrics;
CREATE POLICY "update_social_post_metrics_if_org_member" ON social_post_metrics FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM social_posts sp JOIN workspaces w ON w.id = sp.workspace_id JOIN organization_members om ON om.organization_id = w.organization_id WHERE sp.id = social_post_metrics.post_id AND om.user_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM social_posts sp JOIN workspaces w ON w.id = sp.workspace_id JOIN organization_members om ON om.organization_id = w.organization_id WHERE sp.id = social_post_metrics.post_id AND om.user_id = auth.uid()));

-- drafts (user-scoped)
DROP POLICY IF EXISTS "select_own_drafts" ON drafts;
CREATE POLICY "select_own_drafts" ON drafts FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_drafts" ON drafts;
CREATE POLICY "insert_own_drafts" ON drafts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_drafts" ON drafts;
CREATE POLICY "update_own_drafts" ON drafts FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_drafts" ON drafts;
CREATE POLICY "delete_own_drafts" ON drafts FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- scheduled_posts (inherits from social_posts)
DROP POLICY IF EXISTS "select_scheduled_posts_if_org_member" ON scheduled_posts;
CREATE POLICY "select_scheduled_posts_if_org_member" ON scheduled_posts FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM social_posts sp JOIN workspaces w ON w.id = sp.workspace_id JOIN organization_members om ON om.organization_id = w.organization_id WHERE sp.id = scheduled_posts.post_id AND om.user_id = auth.uid()));
DROP POLICY IF EXISTS "insert_scheduled_posts_if_org_member" ON scheduled_posts;
CREATE POLICY "insert_scheduled_posts_if_org_member" ON scheduled_posts FOR INSERT TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM social_posts sp JOIN workspaces w ON w.id = sp.workspace_id JOIN organization_members om ON om.organization_id = w.organization_id WHERE sp.id = scheduled_posts.post_id AND om.user_id = auth.uid()));
DROP POLICY IF EXISTS "update_scheduled_posts_if_org_member" ON scheduled_posts;
CREATE POLICY "update_scheduled_posts_if_org_member" ON scheduled_posts FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM social_posts sp JOIN workspaces w ON w.id = sp.workspace_id JOIN organization_members om ON om.organization_id = w.organization_id WHERE sp.id = scheduled_posts.post_id AND om.user_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM social_posts sp JOIN workspaces w ON w.id = sp.workspace_id JOIN organization_members om ON om.organization_id = w.organization_id WHERE sp.id = scheduled_posts.post_id AND om.user_id = auth.uid()));
DROP POLICY IF EXISTS "delete_scheduled_posts_if_org_member" ON scheduled_posts;
CREATE POLICY "delete_scheduled_posts_if_org_member" ON scheduled_posts FOR DELETE TO authenticated
USING (EXISTS (SELECT 1 FROM social_posts sp JOIN workspaces w ON w.id = sp.workspace_id JOIN organization_members om ON om.organization_id = w.organization_id WHERE sp.id = scheduled_posts.post_id AND om.user_id = auth.uid()));

-- calendar_events (workspace-scoped)
DROP POLICY IF EXISTS "select_calendar_events_if_org_member" ON calendar_events;
CREATE POLICY "select_calendar_events_if_org_member" ON calendar_events FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM organization_members om JOIN workspaces w ON w.organization_id = om.organization_id WHERE w.id = calendar_events.workspace_id AND om.user_id = auth.uid()));
DROP POLICY IF EXISTS "insert_calendar_events_if_org_member" ON calendar_events;
CREATE POLICY "insert_calendar_events_if_org_member" ON calendar_events FOR INSERT TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM organization_members om JOIN workspaces w ON w.organization_id = om.organization_id WHERE w.id = calendar_events.workspace_id AND om.user_id = auth.uid()));
DROP POLICY IF EXISTS "update_calendar_events_if_org_member" ON calendar_events;
CREATE POLICY "update_calendar_events_if_org_member" ON calendar_events FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM organization_members om JOIN workspaces w ON w.organization_id = om.organization_id WHERE w.id = calendar_events.workspace_id AND om.user_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM organization_members om JOIN workspaces w ON w.organization_id = om.organization_id WHERE w.id = calendar_events.workspace_id AND om.user_id = auth.uid()));
DROP POLICY IF EXISTS "delete_calendar_events_if_org_member" ON calendar_events;
CREATE POLICY "delete_calendar_events_if_org_member" ON calendar_events FOR DELETE TO authenticated
USING (EXISTS (SELECT 1 FROM organization_members om JOIN workspaces w ON w.organization_id = om.organization_id WHERE w.id = calendar_events.workspace_id AND om.user_id = auth.uid()));

-- conversations (inherits from social_accounts org)
DROP POLICY IF EXISTS "select_conversations_if_org_member" ON conversations;
CREATE POLICY "select_conversations_if_org_member" ON conversations FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM social_accounts sa JOIN organization_members om ON om.organization_id = sa.organization_id WHERE sa.id = conversations.account_id AND om.user_id = auth.uid()));
DROP POLICY IF EXISTS "insert_conversations_if_org_member" ON conversations;
CREATE POLICY "insert_conversations_if_org_member" ON conversations FOR INSERT TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM social_accounts sa JOIN organization_members om ON om.organization_id = sa.organization_id WHERE sa.id = conversations.account_id AND om.user_id = auth.uid()));
DROP POLICY IF EXISTS "update_conversations_if_org_member" ON conversations;
CREATE POLICY "update_conversations_if_org_member" ON conversations FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM social_accounts sa JOIN organization_members om ON om.organization_id = sa.organization_id WHERE sa.id = conversations.account_id AND om.user_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM social_accounts sa JOIN organization_members om ON om.organization_id = sa.organization_id WHERE sa.id = conversations.account_id AND om.user_id = auth.uid()));
DROP POLICY IF EXISTS "delete_conversations_if_org_member" ON conversations;
CREATE POLICY "delete_conversations_if_org_member" ON conversations FOR DELETE TO authenticated
USING (EXISTS (SELECT 1 FROM social_accounts sa JOIN organization_members om ON om.organization_id = sa.organization_id WHERE sa.id = conversations.account_id AND om.user_id = auth.uid()));

-- comments (inherits from conversations)
DROP POLICY IF EXISTS "select_comments_if_org_member" ON comments;
CREATE POLICY "select_comments_if_org_member" ON comments FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM conversations c JOIN social_accounts sa ON sa.id = c.account_id JOIN organization_members om ON om.organization_id = sa.organization_id WHERE c.id = comments.conversation_id AND om.user_id = auth.uid()));
DROP POLICY IF EXISTS "insert_comments_if_org_member" ON comments;
CREATE POLICY "insert_comments_if_org_member" ON comments FOR INSERT TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM conversations c JOIN social_accounts sa ON sa.id = c.account_id JOIN organization_members om ON om.organization_id = sa.organization_id WHERE c.id = comments.conversation_id AND om.user_id = auth.uid()));
DROP POLICY IF EXISTS "update_comments_if_org_member" ON comments;
CREATE POLICY "update_comments_if_org_member" ON comments FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM conversations c JOIN social_accounts sa ON sa.id = c.account_id JOIN organization_members om ON om.organization_id = sa.organization_id WHERE c.id = comments.conversation_id AND om.user_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM conversations c JOIN social_accounts sa ON sa.id = c.account_id JOIN organization_members om ON om.organization_id = sa.organization_id WHERE c.id = comments.conversation_id AND om.user_id = auth.uid()));
DROP POLICY IF EXISTS "delete_comments_if_org_member" ON comments;
CREATE POLICY "delete_comments_if_org_member" ON comments FOR DELETE TO authenticated
USING (EXISTS (SELECT 1 FROM conversations c JOIN social_accounts sa ON sa.id = c.account_id JOIN organization_members om ON om.organization_id = sa.organization_id WHERE c.id = comments.conversation_id AND om.user_id = auth.uid()));

-- brands
DROP POLICY IF EXISTS "select_brands_if_org_member" ON brands;
CREATE POLICY "select_brands_if_org_member" ON brands FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM organization_members WHERE organization_members.organization_id = brands.organization_id AND organization_members.user_id = auth.uid()));
DROP POLICY IF EXISTS "insert_brands_if_org_member" ON brands;
CREATE POLICY "insert_brands_if_org_member" ON brands FOR INSERT TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM organization_members WHERE organization_members.organization_id = brands.organization_id AND organization_members.user_id = auth.uid()));
DROP POLICY IF EXISTS "update_brands_if_org_member" ON brands;
CREATE POLICY "update_brands_if_org_member" ON brands FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM organization_members WHERE organization_members.organization_id = brands.organization_id AND organization_members.user_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM organization_members WHERE organization_members.organization_id = brands.organization_id AND organization_members.user_id = auth.uid()));
DROP POLICY IF EXISTS "delete_brands_if_org_member" ON brands;
CREATE POLICY "delete_brands_if_org_member" ON brands FOR DELETE TO authenticated
USING (EXISTS (SELECT 1 FROM organization_members WHERE organization_members.organization_id = brands.organization_id AND organization_members.user_id = auth.uid()));

-- mentions (inherits from brands)
DROP POLICY IF EXISTS "select_mentions_if_org_member" ON mentions;
CREATE POLICY "select_mentions_if_org_member" ON mentions FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM brands b JOIN organization_members om ON om.organization_id = b.organization_id WHERE b.id = mentions.brand_id AND om.user_id = auth.uid()));
DROP POLICY IF EXISTS "insert_mentions_if_org_member" ON mentions;
CREATE POLICY "insert_mentions_if_org_member" ON mentions FOR INSERT TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM brands b JOIN organization_members om ON om.organization_id = b.organization_id WHERE b.id = mentions.brand_id AND om.user_id = auth.uid()));
DROP POLICY IF EXISTS "update_mentions_if_org_member" ON mentions;
CREATE POLICY "update_mentions_if_org_member" ON mentions FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM brands b JOIN organization_members om ON om.organization_id = b.organization_id WHERE b.id = mentions.brand_id AND om.user_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM brands b JOIN organization_members om ON om.organization_id = b.organization_id WHERE b.id = mentions.brand_id AND om.user_id = auth.uid()));
DROP POLICY IF EXISTS "delete_mentions_if_org_member" ON mentions;
CREATE POLICY "delete_mentions_if_org_member" ON mentions FOR DELETE TO authenticated
USING (EXISTS (SELECT 1 FROM brands b JOIN organization_members om ON om.organization_id = b.organization_id WHERE b.id = mentions.brand_id AND om.user_id = auth.uid()));

-- brand_competitors
DROP POLICY IF EXISTS "select_brand_competitors_if_org_member" ON brand_competitors;
CREATE POLICY "select_brand_competitors_if_org_member" ON brand_competitors FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM organization_members WHERE organization_members.organization_id = brand_competitors.organization_id AND organization_members.user_id = auth.uid()));
DROP POLICY IF EXISTS "insert_brand_competitors_if_org_member" ON brand_competitors;
CREATE POLICY "insert_brand_competitors_if_org_member" ON brand_competitors FOR INSERT TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM organization_members WHERE organization_members.organization_id = brand_competitors.organization_id AND organization_members.user_id = auth.uid()));
DROP POLICY IF EXISTS "update_brand_competitors_if_org_member" ON brand_competitors;
CREATE POLICY "update_brand_competitors_if_org_member" ON brand_competitors FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM organization_members WHERE organization_members.organization_id = brand_competitors.organization_id AND organization_members.user_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM organization_members WHERE organization_members.organization_id = brand_competitors.organization_id AND organization_members.user_id = auth.uid()));
DROP POLICY IF EXISTS "delete_brand_competitors_if_org_member" ON brand_competitors;
CREATE POLICY "delete_brand_competitors_if_org_member" ON brand_competitors FOR DELETE TO authenticated
USING (EXISTS (SELECT 1 FROM organization_members WHERE organization_members.organization_id = brand_competitors.organization_id AND organization_members.user_id = auth.uid()));

-- metrics
DROP POLICY IF EXISTS "select_metrics_if_org_member" ON metrics;
CREATE POLICY "select_metrics_if_org_member" ON metrics FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM organization_members WHERE organization_members.organization_id = metrics.organization_id AND organization_members.user_id = auth.uid()));
DROP POLICY IF EXISTS "insert_metrics_if_org_member" ON metrics;
CREATE POLICY "insert_metrics_if_org_member" ON metrics FOR INSERT TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM organization_members WHERE organization_members.organization_id = metrics.organization_id AND organization_members.user_id = auth.uid()));
DROP POLICY IF EXISTS "update_metrics_if_org_member" ON metrics;
CREATE POLICY "update_metrics_if_org_member" ON metrics FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM organization_members WHERE organization_members.organization_id = metrics.organization_id AND organization_members.user_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM organization_members WHERE organization_members.organization_id = metrics.organization_id AND organization_members.user_id = auth.uid()));
DROP POLICY IF EXISTS "delete_metrics_if_org_member" ON metrics;
CREATE POLICY "delete_metrics_if_org_member" ON metrics FOR DELETE TO authenticated
USING (EXISTS (SELECT 1 FROM organization_members WHERE organization_members.organization_id = metrics.organization_id AND organization_members.user_id = auth.uid()));

-- dashboard_widgets
DROP POLICY IF EXISTS "select_dashboard_widgets_if_org_member" ON dashboard_widgets;
CREATE POLICY "select_dashboard_widgets_if_org_member" ON dashboard_widgets FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM organization_members WHERE organization_members.organization_id = dashboard_widgets.organization_id AND organization_members.user_id = auth.uid()));
DROP POLICY IF EXISTS "insert_dashboard_widgets_if_org_member" ON dashboard_widgets;
CREATE POLICY "insert_dashboard_widgets_if_org_member" ON dashboard_widgets FOR INSERT TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM organization_members WHERE organization_members.organization_id = dashboard_widgets.organization_id AND organization_members.user_id = auth.uid()));
DROP POLICY IF EXISTS "update_dashboard_widgets_if_org_member" ON dashboard_widgets;
CREATE POLICY "update_dashboard_widgets_if_org_member" ON dashboard_widgets FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM organization_members WHERE organization_members.organization_id = dashboard_widgets.organization_id AND organization_members.user_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM organization_members WHERE organization_members.organization_id = dashboard_widgets.organization_id AND organization_members.user_id = auth.uid()));
DROP POLICY IF EXISTS "delete_dashboard_widgets_if_org_member" ON dashboard_widgets;
CREATE POLICY "delete_dashboard_widgets_if_org_member" ON dashboard_widgets FOR DELETE TO authenticated
USING (EXISTS (SELECT 1 FROM organization_members WHERE organization_members.organization_id = dashboard_widgets.organization_id AND organization_members.user_id = auth.uid()));

-- reports
DROP POLICY IF EXISTS "select_reports_if_org_member" ON reports;
CREATE POLICY "select_reports_if_org_member" ON reports FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM organization_members WHERE organization_members.organization_id = reports.organization_id AND organization_members.user_id = auth.uid()));
DROP POLICY IF EXISTS "insert_reports_if_org_member" ON reports;
CREATE POLICY "insert_reports_if_org_member" ON reports FOR INSERT TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM organization_members WHERE organization_members.organization_id = reports.organization_id AND organization_members.user_id = auth.uid()));
DROP POLICY IF EXISTS "update_reports_if_org_member" ON reports;
CREATE POLICY "update_reports_if_org_member" ON reports FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM organization_members WHERE organization_members.organization_id = reports.organization_id AND organization_members.user_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM organization_members WHERE organization_members.organization_id = reports.organization_id AND organization_members.user_id = auth.uid()));
DROP POLICY IF EXISTS "delete_reports_if_org_member" ON reports;
CREATE POLICY "delete_reports_if_org_member" ON reports FOR DELETE TO authenticated
USING (EXISTS (SELECT 1 FROM organization_members WHERE organization_members.organization_id = reports.organization_id AND organization_members.user_id = auth.uid()));

-- kpis
DROP POLICY IF EXISTS "select_kpis_if_org_member" ON kpis;
CREATE POLICY "select_kpis_if_org_member" ON kpis FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM organization_members WHERE organization_members.organization_id = kpis.organization_id AND organization_members.user_id = auth.uid()));
DROP POLICY IF EXISTS "insert_kpis_if_org_member" ON kpis;
CREATE POLICY "insert_kpis_if_org_member" ON kpis FOR INSERT TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM organization_members WHERE organization_members.organization_id = kpis.organization_id AND organization_members.user_id = auth.uid()));
DROP POLICY IF EXISTS "update_kpis_if_org_member" ON kpis;
CREATE POLICY "update_kpis_if_org_member" ON kpis FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM organization_members WHERE organization_members.organization_id = kpis.organization_id AND organization_members.user_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM organization_members WHERE organization_members.organization_id = kpis.organization_id AND organization_members.user_id = auth.uid()));
DROP POLICY IF EXISTS "delete_kpis_if_org_member" ON kpis;
CREATE POLICY "delete_kpis_if_org_member" ON kpis FOR DELETE TO authenticated
USING (EXISTS (SELECT 1 FROM organization_members WHERE organization_members.organization_id = kpis.organization_id AND organization_members.user_id = auth.uid()));

-- ai_conversations (user-scoped)
DROP POLICY IF EXISTS "select_own_ai_conversations" ON ai_conversations;
CREATE POLICY "select_own_ai_conversations" ON ai_conversations FOR SELECT TO authenticated
USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_ai_conversations" ON ai_conversations;
CREATE POLICY "insert_own_ai_conversations" ON ai_conversations FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_ai_conversations" ON ai_conversations;
CREATE POLICY "update_own_ai_conversations" ON ai_conversations FOR UPDATE TO authenticated
USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_ai_conversations" ON ai_conversations;
CREATE POLICY "delete_own_ai_conversations" ON ai_conversations FOR DELETE TO authenticated
USING (auth.uid() = user_id);

-- ai_messages (user-scoped via conversation)
DROP POLICY IF EXISTS "select_own_ai_messages" ON ai_messages;
CREATE POLICY "select_own_ai_messages" ON ai_messages FOR SELECT TO authenticated
USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_ai_messages" ON ai_messages;
CREATE POLICY "insert_own_ai_messages" ON ai_messages FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_ai_messages" ON ai_messages;
CREATE POLICY "delete_own_ai_messages" ON ai_messages FOR DELETE TO authenticated
USING (auth.uid() = user_id);

-- prompts (global read)
DROP POLICY IF EXISTS "select_prompts" ON prompts;
CREATE POLICY "select_prompts" ON prompts FOR SELECT TO authenticated USING (true);

-- agents (global read)
DROP POLICY IF EXISTS "select_agents" ON agents;
CREATE POLICY "select_agents" ON agents FOR SELECT TO authenticated USING (true);

-- ai_usage (org-scoped)
DROP POLICY IF EXISTS "select_ai_usage_if_org_member" ON ai_usage;
CREATE POLICY "select_ai_usage_if_org_member" ON ai_usage FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM organization_members WHERE organization_members.organization_id = ai_usage.organization_id AND organization_members.user_id = auth.uid()));
DROP POLICY IF EXISTS "insert_ai_usage_if_org_member" ON ai_usage;
CREATE POLICY "insert_ai_usage_if_org_member" ON ai_usage FOR INSERT TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM organization_members WHERE organization_members.organization_id = ai_usage.organization_id AND organization_members.user_id = auth.uid()));

-- workflows (org-scoped)
DROP POLICY IF EXISTS "select_workflows_if_org_member" ON workflows;
CREATE POLICY "select_workflows_if_org_member" ON workflows FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM organization_members WHERE organization_members.organization_id = workflows.organization_id AND organization_members.user_id = auth.uid()));
DROP POLICY IF EXISTS "insert_workflows_if_org_member" ON workflows;
CREATE POLICY "insert_workflows_if_org_member" ON workflows FOR INSERT TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM organization_members WHERE organization_members.organization_id = workflows.organization_id AND organization_members.user_id = auth.uid()));
DROP POLICY IF EXISTS "update_workflows_if_org_member" ON workflows;
CREATE POLICY "update_workflows_if_org_member" ON workflows FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM organization_members WHERE organization_members.organization_id = workflows.organization_id AND organization_members.user_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM organization_members WHERE organization_members.organization_id = workflows.organization_id AND organization_members.user_id = auth.uid()));
DROP POLICY IF EXISTS "delete_workflows_if_org_member" ON workflows;
CREATE POLICY "delete_workflows_if_org_member" ON workflows FOR DELETE TO authenticated
USING (EXISTS (SELECT 1 FROM organization_members WHERE organization_members.organization_id = workflows.organization_id AND organization_members.user_id = auth.uid()));

-- workflow_executions (inherits from workflows)
DROP POLICY IF EXISTS "select_workflow_executions_if_org_member" ON workflow_executions;
CREATE POLICY "select_workflow_executions_if_org_member" ON workflow_executions FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM workflows w JOIN organization_members om ON om.organization_id = w.organization_id WHERE w.id = workflow_executions.workflow_id AND om.user_id = auth.uid()));
DROP POLICY IF EXISTS "insert_workflow_executions_if_org_member" ON workflow_executions;
CREATE POLICY "insert_workflow_executions_if_org_member" ON workflow_executions FOR INSERT TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM workflows w JOIN organization_members om ON om.organization_id = w.organization_id WHERE w.id = workflow_executions.workflow_id AND om.user_id = auth.uid()));
DROP POLICY IF EXISTS "update_workflow_executions_if_org_member" ON workflow_executions;
CREATE POLICY "update_workflow_executions_if_org_member" ON workflow_executions FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM workflows w JOIN organization_members om ON om.organization_id = w.organization_id WHERE w.id = workflow_executions.workflow_id AND om.user_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM workflows w JOIN organization_members om ON om.organization_id = w.organization_id WHERE w.id = workflow_executions.workflow_id AND om.user_id = auth.uid()));

-- notifications (user-scoped)
DROP POLICY IF EXISTS "select_own_notifications" ON notifications;
CREATE POLICY "select_own_notifications" ON notifications FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_notifications" ON notifications;
CREATE POLICY "insert_own_notifications" ON notifications FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_notifications" ON notifications;
CREATE POLICY "update_own_notifications" ON notifications FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_notifications" ON notifications;
CREATE POLICY "delete_own_notifications" ON notifications FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- activities (user-scoped)
DROP POLICY IF EXISTS "select_own_activities" ON activities;
CREATE POLICY "select_own_activities" ON activities FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_activities" ON activities;
CREATE POLICY "insert_own_activities" ON activities FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_activities" ON activities;
CREATE POLICY "delete_own_activities" ON activities FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- audit_logs (org-scoped)
DROP POLICY IF EXISTS "select_audit_logs_if_org_member" ON audit_logs;
CREATE POLICY "select_audit_logs_if_org_member" ON audit_logs FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM organization_members WHERE organization_members.organization_id = audit_logs.organization_id AND organization_members.user_id = auth.uid()));
DROP POLICY IF EXISTS "insert_audit_logs_if_org_member" ON audit_logs;
CREATE POLICY "insert_audit_logs_if_org_member" ON audit_logs FOR INSERT TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM organization_members WHERE organization_members.organization_id = audit_logs.organization_id AND organization_members.user_id = auth.uid()));

-- integrations (org-scoped)
DROP POLICY IF EXISTS "select_integrations_if_org_member" ON integrations;
CREATE POLICY "select_integrations_if_org_member" ON integrations FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM organization_members WHERE organization_members.organization_id = integrations.organization_id AND organization_members.user_id = auth.uid()));
DROP POLICY IF EXISTS "insert_integrations_if_org_member" ON integrations;
CREATE POLICY "insert_integrations_if_org_member" ON integrations FOR INSERT TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM organization_members WHERE organization_members.organization_id = integrations.organization_id AND organization_members.user_id = auth.uid()));
DROP POLICY IF EXISTS "update_integrations_if_org_member" ON integrations;
CREATE POLICY "update_integrations_if_org_member" ON integrations FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM organization_members WHERE organization_members.organization_id = integrations.organization_id AND organization_members.user_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM organization_members WHERE organization_members.organization_id = integrations.organization_id AND organization_members.user_id = auth.uid()));
DROP POLICY IF EXISTS "delete_integrations_if_org_member" ON integrations;
CREATE POLICY "delete_integrations_if_org_member" ON integrations FOR DELETE TO authenticated
USING (EXISTS (SELECT 1 FROM organization_members WHERE organization_members.organization_id = integrations.organization_id AND organization_members.user_id = auth.uid()));

-- oauth_tokens (org-scoped)
DROP POLICY IF EXISTS "select_oauth_tokens_if_org_member" ON oauth_tokens;
CREATE POLICY "select_oauth_tokens_if_org_member" ON oauth_tokens FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM organization_members WHERE organization_members.organization_id = oauth_tokens.organization_id AND organization_members.user_id = auth.uid()));
DROP POLICY IF EXISTS "insert_oauth_tokens_if_org_member" ON oauth_tokens;
CREATE POLICY "insert_oauth_tokens_if_org_member" ON oauth_tokens FOR INSERT TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM organization_members WHERE organization_members.organization_id = oauth_tokens.organization_id AND organization_members.user_id = auth.uid()));
DROP POLICY IF EXISTS "update_oauth_tokens_if_org_member" ON oauth_tokens;
CREATE POLICY "update_oauth_tokens_if_org_member" ON oauth_tokens FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM organization_members WHERE organization_members.organization_id = oauth_tokens.organization_id AND organization_members.user_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM organization_members WHERE organization_members.organization_id = oauth_tokens.organization_id AND organization_members.user_id = auth.uid()));
DROP POLICY IF EXISTS "delete_oauth_tokens_if_org_member" ON oauth_tokens;
CREATE POLICY "delete_oauth_tokens_if_org_member" ON oauth_tokens FOR DELETE TO authenticated
USING (EXISTS (SELECT 1 FROM organization_members WHERE organization_members.organization_id = oauth_tokens.organization_id AND organization_members.user_id = auth.uid()));

-- feature_flags (global read)
DROP POLICY IF EXISTS "select_feature_flags" ON feature_flags;
CREATE POLICY "select_feature_flags" ON feature_flags FOR SELECT TO authenticated USING (true);

-- organization_feature_overrides (org-scoped)
DROP POLICY IF EXISTS "select_org_feature_overrides_if_org_member" ON organization_feature_overrides;
CREATE POLICY "select_org_feature_overrides_if_org_member" ON organization_feature_overrides FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM organization_members WHERE organization_members.organization_id = organization_feature_overrides.organization_id AND organization_members.user_id = auth.uid()));
DROP POLICY IF EXISTS "insert_org_feature_overrides_if_org_member" ON organization_feature_overrides;
CREATE POLICY "insert_org_feature_overrides_if_org_member" ON organization_feature_overrides FOR INSERT TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM organization_members WHERE organization_members.organization_id = organization_feature_overrides.organization_id AND organization_members.user_id = auth.uid()));
DROP POLICY IF EXISTS "update_org_feature_overrides_if_org_member" ON organization_feature_overrides;
CREATE POLICY "update_org_feature_overrides_if_org_member" ON organization_feature_overrides FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM organization_members WHERE organization_members.organization_id = organization_feature_overrides.organization_id AND organization_members.user_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM organization_members WHERE organization_members.organization_id = organization_feature_overrides.organization_id AND organization_members.user_id = auth.uid()));
DROP POLICY IF EXISTS "delete_org_feature_overrides_if_org_member" ON organization_feature_overrides;
CREATE POLICY "delete_org_feature_overrides_if_org_member" ON organization_feature_overrides FOR DELETE TO authenticated
USING (EXISTS (SELECT 1 FROM organization_members WHERE organization_members.organization_id = organization_feature_overrides.organization_id AND organization_members.user_id = auth.uid()));

-- tasks (workspace-scoped)
DROP POLICY IF EXISTS "select_tasks_if_org_member" ON tasks;
CREATE POLICY "select_tasks_if_org_member" ON tasks FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM organization_members om JOIN workspaces w ON w.organization_id = om.organization_id WHERE w.id = tasks.workspace_id AND om.user_id = auth.uid()));
DROP POLICY IF EXISTS "insert_tasks_if_org_member" ON tasks;
CREATE POLICY "insert_tasks_if_org_member" ON tasks FOR INSERT TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM organization_members om JOIN workspaces w ON w.organization_id = om.organization_id WHERE w.id = tasks.workspace_id AND om.user_id = auth.uid()));
DROP POLICY IF EXISTS "update_tasks_if_org_member" ON tasks;
CREATE POLICY "update_tasks_if_org_member" ON tasks FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM organization_members om JOIN workspaces w ON w.organization_id = om.organization_id WHERE w.id = tasks.workspace_id AND om.user_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM organization_members om JOIN workspaces w ON w.organization_id = om.organization_id WHERE w.id = tasks.workspace_id AND om.user_id = auth.uid()));
DROP POLICY IF EXISTS "delete_tasks_if_org_member" ON tasks;
CREATE POLICY "delete_tasks_if_org_member" ON tasks FOR DELETE TO authenticated
USING (EXISTS (SELECT 1 FROM organization_members om JOIN workspaces w ON w.organization_id = om.organization_id WHERE w.id = tasks.workspace_id AND om.user_id = auth.uid()));

-- plans (global read)
DROP POLICY IF EXISTS "select_plans" ON plans;
CREATE POLICY "select_plans" ON plans FOR SELECT TO authenticated USING (true);

-- subscriptions (org-scoped)
DROP POLICY IF EXISTS "select_subscriptions_if_org_member" ON subscriptions;
CREATE POLICY "select_subscriptions_if_org_member" ON subscriptions FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM organization_members WHERE organization_members.organization_id = subscriptions.organization_id AND organization_members.user_id = auth.uid()));
DROP POLICY IF EXISTS "insert_subscriptions_if_org_member" ON subscriptions;
CREATE POLICY "insert_subscriptions_if_org_member" ON subscriptions FOR INSERT TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM organization_members WHERE organization_members.organization_id = subscriptions.organization_id AND organization_members.user_id = auth.uid()));
DROP POLICY IF EXISTS "update_subscriptions_if_org_member" ON subscriptions;
CREATE POLICY "update_subscriptions_if_org_member" ON subscriptions FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM organization_members WHERE organization_members.organization_id = subscriptions.organization_id AND organization_members.user_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM organization_members WHERE organization_members.organization_id = subscriptions.organization_id AND organization_members.user_id = auth.uid()));

-- usage_records (org-scoped)
DROP POLICY IF EXISTS "select_usage_records_if_org_member" ON usage_records;
CREATE POLICY "select_usage_records_if_org_member" ON usage_records FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM organization_members WHERE organization_members.organization_id = usage_records.organization_id AND organization_members.user_id = auth.uid()));
DROP POLICY IF EXISTS "insert_usage_records_if_org_member" ON usage_records;
CREATE POLICY "insert_usage_records_if_org_member" ON usage_records FOR INSERT TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM organization_members WHERE organization_members.organization_id = usage_records.organization_id AND organization_members.user_id = auth.uid()));
