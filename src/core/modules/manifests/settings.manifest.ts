import { Settings } from "lucide-react";
import { defineModule, type ModuleManifest } from "../ModuleManifest";

export const settingsManifest: ModuleManifest = defineModule({
  id: "settings",
  name: "Settings",
  version: "2.0.0",
  description: "The Administration Center — organization profile, users & teams, roles, workspaces, integrations, billing, audit logs, and API management.",
  category: "core",
  icon: Settings,
  route: "/dashboard/settings",
  subscriptionTier: "free",
  enabled: true,
  navigation: [
    {
      id: "main-modules",
      title: "MAIN MODULES",
      order: 0,
      items: [
        {
          id: "settings",
          title: "Settings",
          href: "/dashboard/settings",
          icon: Settings,
          order: 8,
        },
      ],
    },
  ],
  permissions: [
    { name: "settings.read", description: "View organization settings", action: "view", resource: "settings" },
    { name: "settings.update", description: "Update organization profile, branding, preferences, notifications, and security", action: "update", resource: "settings" },
    { name: "settings.admin", description: "Access Advanced Settings (SSO, API keys, webhooks, compliance)", action: "admin", resource: "settings" },
    { name: "users.read", description: "View people, teams, invitations, and activity", action: "view", resource: "users" },
    { name: "users.update", description: "Edit people and manage teams", action: "update", resource: "users" },
    { name: "users.manage", description: "Invite, suspend, remove people, and manage access levels", action: "manage", resource: "users" },
    { name: "roles.read", description: "View roles, the access matrix, templates, and policies", action: "view", resource: "roles" },
    { name: "roles.update", description: "Edit roles and create roles from templates", action: "update", resource: "roles" },
    { name: "roles.manage", description: "Create, archive, and assign roles, and manage access policies", action: "manage", resource: "roles" },
  ],
  notifications: [
    { id: "organization-updated", name: "Organization Updated", description: "The organization's profile or branding changed", channels: ["inApp"], defaultEnabled: true },
    { id: "person-invited", name: "Person Invited", description: "Someone was invited to join the organization", channels: ["inApp"], defaultEnabled: true },
  ],
  ai: { enabled: false, models: [], prompts: [] },
  settings: [
    { id: "organization-profile", title: "Organization Profile", description: "Company details, address, business info, ownership, and subscription" },
    { id: "branding", title: "Branding", description: "Logo, favicon, colors, and theme" },
    { id: "preferences", title: "Preferences", description: "Language, regional, and display preferences" },
    { id: "notifications", title: "Notifications", description: "What your organization gets notified about" },
    { id: "security", title: "Security", description: "Two-factor authentication, session timeout, and password policy" },
    { id: "advanced-settings", title: "Advanced Settings", description: "SSO, API keys, webhooks, data retention, and IP restrictions — administrators only" },
    { id: "people", title: "People", description: "Everyone in your organization — profiles, status, and access" },
    { id: "teams", title: "Teams", description: "Group people by team with a lead and shared access" },
    { id: "invitations", title: "Invitations", description: "Invite people, choose their team and access level" },
    { id: "access-summary", title: "Access Summary", description: "Plain-language view of what each person can do" },
    { id: "activity", title: "Activity", description: "A readable timeline of what happened and when" },
    { id: "roles", title: "Roles", description: "Owner, Administrator, Manager, Member, Viewer — and any custom roles your organization has created" },
    { id: "access-matrix", title: "Access Matrix", description: "A simple grid of which roles can access which features" },
    { id: "role-templates", title: "Templates", description: "Prebuilt business roles you can create in one click" },
    { id: "policies", title: "Policies", description: "Plain-language rules about who can do what" },
  ],
  metadata: { order: 9 },
});
