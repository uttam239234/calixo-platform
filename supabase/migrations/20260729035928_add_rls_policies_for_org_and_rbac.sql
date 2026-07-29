/*
# Add RLS policies for organization, workspace, team, invitation, and RBAC tables

1. Overview
- Adds Row Level Security policies to all tables created in the previous migration.
- Organization-scoped tables use org membership checks via organization_members.
- RBAC tables: roles/permissions are readable by all authenticated users.

2. Security
- organizations: CRUD if user is a member of that organization.
- organization_relations: SELECT/UPDATE if org member.
- organization_members: CRUD if user is already a member of that org.
- workspaces: CRUD if user is a member of the parent organization.
- teams/team_members: CRUD if user is a member of the parent org (via workspace).
- invitations: CRUD if user is a member of the parent org.
- roles/permissions/role_permissions: SELECT for all authenticated users.
- user_role_assignments: SELECT if the assignment is for the requesting user or an org they belong to.
*/

-- organizations
DROP POLICY IF EXISTS "select_org_if_member" ON organizations;
CREATE POLICY "select_org_if_member" ON organizations FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM organization_members WHERE organization_members.organization_id = organizations.id AND organization_members.user_id = auth.uid()));

DROP POLICY IF EXISTS "insert_org_if_member" ON organizations;
CREATE POLICY "insert_org_if_member" ON organizations FOR INSERT TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM organization_members WHERE organization_members.organization_id = organizations.id AND organization_members.user_id = auth.uid()));

DROP POLICY IF EXISTS "update_org_if_member" ON organizations;
CREATE POLICY "update_org_if_member" ON organizations FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM organization_members WHERE organization_members.organization_id = organizations.id AND organization_members.user_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM organization_members WHERE organization_members.organization_id = organizations.id AND organization_members.user_id = auth.uid()));

-- organization_relations
DROP POLICY IF EXISTS "select_org_relation_if_member" ON organization_relations;
CREATE POLICY "select_org_relation_if_member" ON organization_relations FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM organization_members WHERE organization_members.organization_id = organization_relations.organization_id AND organization_members.user_id = auth.uid()));

DROP POLICY IF EXISTS "update_org_relation_if_member" ON organization_relations;
CREATE POLICY "update_org_relation_if_member" ON organization_relations FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM organization_members WHERE organization_members.organization_id = organization_relations.organization_id AND organization_members.user_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM organization_members WHERE organization_members.organization_id = organization_relations.organization_id AND organization_members.user_id = auth.uid()));

-- organization_members
DROP POLICY IF EXISTS "select_org_members_if_member" ON organization_members;
CREATE POLICY "select_org_members_if_member" ON organization_members FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM organization_members om WHERE om.organization_id = organization_members.organization_id AND om.user_id = auth.uid()));

DROP POLICY IF EXISTS "insert_org_members_if_member" ON organization_members;
CREATE POLICY "insert_org_members_if_member" ON organization_members FOR INSERT TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM organization_members om WHERE om.organization_id = organization_members.organization_id AND om.user_id = auth.uid()));

DROP POLICY IF EXISTS "update_org_members_if_member" ON organization_members;
CREATE POLICY "update_org_members_if_member" ON organization_members FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM organization_members om WHERE om.organization_id = organization_members.organization_id AND om.user_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM organization_members om WHERE om.organization_id = organization_members.organization_id AND om.user_id = auth.uid()));

DROP POLICY IF EXISTS "delete_org_members_if_member" ON organization_members;
CREATE POLICY "delete_org_members_if_member" ON organization_members FOR DELETE TO authenticated
USING (EXISTS (SELECT 1 FROM organization_members om WHERE om.organization_id = organization_members.organization_id AND om.user_id = auth.uid()));

-- workspaces
DROP POLICY IF EXISTS "select_workspace_if_org_member" ON workspaces;
CREATE POLICY "select_workspace_if_org_member" ON workspaces FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM organization_members WHERE organization_members.organization_id = workspaces.organization_id AND organization_members.user_id = auth.uid()));

DROP POLICY IF EXISTS "insert_workspace_if_org_member" ON workspaces;
CREATE POLICY "insert_workspace_if_org_member" ON workspaces FOR INSERT TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM organization_members WHERE organization_members.organization_id = workspaces.organization_id AND organization_members.user_id = auth.uid()));

DROP POLICY IF EXISTS "update_workspace_if_org_member" ON workspaces;
CREATE POLICY "update_workspace_if_org_member" ON workspaces FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM organization_members WHERE organization_members.organization_id = workspaces.organization_id AND organization_members.user_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM organization_members WHERE organization_members.organization_id = workspaces.organization_id AND organization_members.user_id = auth.uid()));

DROP POLICY IF EXISTS "delete_workspace_if_org_member" ON workspaces;
CREATE POLICY "delete_workspace_if_org_member" ON workspaces FOR DELETE TO authenticated
USING (EXISTS (SELECT 1 FROM organization_members WHERE organization_members.organization_id = workspaces.organization_id AND organization_members.user_id = auth.uid()));

-- teams
DROP POLICY IF EXISTS "select_team_if_org_member" ON teams;
CREATE POLICY "select_team_if_org_member" ON teams FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM organization_members om JOIN workspaces w ON w.organization_id = om.organization_id WHERE w.id = teams.workspace_id AND om.user_id = auth.uid()));

DROP POLICY IF EXISTS "insert_team_if_org_member" ON teams;
CREATE POLICY "insert_team_if_org_member" ON teams FOR INSERT TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM organization_members om JOIN workspaces w ON w.organization_id = om.organization_id WHERE w.id = teams.workspace_id AND om.user_id = auth.uid()));

DROP POLICY IF EXISTS "update_team_if_org_member" ON teams;
CREATE POLICY "update_team_if_org_member" ON teams FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM organization_members om JOIN workspaces w ON w.organization_id = om.organization_id WHERE w.id = teams.workspace_id AND om.user_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM organization_members om JOIN workspaces w ON w.organization_id = om.organization_id WHERE w.id = teams.workspace_id AND om.user_id = auth.uid()));

DROP POLICY IF EXISTS "delete_team_if_org_member" ON teams;
CREATE POLICY "delete_team_if_org_member" ON teams FOR DELETE TO authenticated
USING (EXISTS (SELECT 1 FROM organization_members om JOIN workspaces w ON w.organization_id = om.organization_id WHERE w.id = teams.workspace_id AND om.user_id = auth.uid()));

-- team_members
DROP POLICY IF EXISTS "select_team_members_if_org_member" ON team_members;
CREATE POLICY "select_team_members_if_org_member" ON team_members FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM organization_members om JOIN workspaces w ON w.organization_id = om.organization_id JOIN teams t ON t.workspace_id = w.id WHERE t.id = team_members.team_id AND om.user_id = auth.uid()));

DROP POLICY IF EXISTS "insert_team_members_if_org_member" ON team_members;
CREATE POLICY "insert_team_members_if_org_member" ON team_members FOR INSERT TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM organization_members om JOIN workspaces w ON w.organization_id = om.organization_id JOIN teams t ON t.workspace_id = w.id WHERE t.id = team_members.team_id AND om.user_id = auth.uid()));

DROP POLICY IF EXISTS "delete_team_members_if_org_member" ON team_members;
CREATE POLICY "delete_team_members_if_org_member" ON team_members FOR DELETE TO authenticated
USING (EXISTS (SELECT 1 FROM organization_members om JOIN workspaces w ON w.organization_id = om.organization_id JOIN teams t ON t.workspace_id = w.id WHERE t.id = team_members.team_id AND om.user_id = auth.uid()));

-- invitations
DROP POLICY IF EXISTS "select_invitations_if_org_member" ON invitations;
CREATE POLICY "select_invitations_if_org_member" ON invitations FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM organization_members WHERE organization_members.organization_id = invitations.organization_id AND organization_members.user_id = auth.uid()));

DROP POLICY IF EXISTS "insert_invitations_if_org_member" ON invitations;
CREATE POLICY "insert_invitations_if_org_member" ON invitations FOR INSERT TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM organization_members WHERE organization_members.organization_id = invitations.organization_id AND organization_members.user_id = auth.uid()));

DROP POLICY IF EXISTS "update_invitations_if_org_member" ON invitations;
CREATE POLICY "update_invitations_if_org_member" ON invitations FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM organization_members WHERE organization_members.organization_id = invitations.organization_id AND organization_members.user_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM organization_members WHERE organization_members.organization_id = invitations.organization_id AND organization_members.user_id = auth.uid()));

-- roles
DROP POLICY IF EXISTS "select_roles" ON roles;
CREATE POLICY "select_roles" ON roles FOR SELECT TO authenticated USING (true);

-- permissions
DROP POLICY IF EXISTS "select_permissions" ON permissions;
CREATE POLICY "select_permissions" ON permissions FOR SELECT TO authenticated USING (true);

-- role_permissions
DROP POLICY IF EXISTS "select_role_permissions" ON role_permissions;
CREATE POLICY "select_role_permissions" ON role_permissions FOR SELECT TO authenticated USING (true);

-- user_role_assignments
DROP POLICY IF EXISTS "select_own_role_assignments" ON user_role_assignments;
CREATE POLICY "select_own_role_assignments" ON user_role_assignments FOR SELECT TO authenticated
USING (auth.uid() = user_id OR EXISTS (
  SELECT 1 FROM organization_members WHERE organization_members.organization_id = user_role_assignments.organization_id AND organization_members.user_id = auth.uid()
));
