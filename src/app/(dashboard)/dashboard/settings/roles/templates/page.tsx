"use client";

import { useState } from "react";
import Link from "next/link";
import { Sparkles, ArrowRight, Save } from "lucide-react";
import { ModuleHeader } from "@/components/enterprise/module";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { useSettingsContext } from "@/features/settings/SettingsProvider";
import { useRoleTemplates } from "@/hooks/useRoleTemplates";
import { useRoles } from "@/hooks/useRoles";

export default function TemplatesPage() {
  const { tenantContext, canManageRoles } = useSettingsContext();
  const templates = useRoleTemplates();
  const roles = useRoles(tenantContext.organizationId);

  const [customNames, setCustomNames] = useState<Record<string, string>>({});
  const [justCreated, setJustCreated] = useState<string | null>(null);

  const [savingRoleId, setSavingRoleId] = useState("");
  const [saveTemplateName, setSaveTemplateName] = useState("");
  const [saveTemplateDescription, setSaveTemplateDescription] = useState("");

  const handleApply = async (templateId: string, defaultName: string) => {
    const name = customNames[templateId]?.trim() || defaultName;
    const role = await templates.applyTemplate(templateId, name);
    setJustCreated(role.name);
  };

  const handleSaveAsTemplate = () => {
    const role = roles.roles.find(r => r.id === savingRoleId);
    if (!role || !saveTemplateName.trim()) return;
    templates.saveAsTemplate({
      id: `custom-${Date.now()}`,
      name: saveTemplateName.trim(),
      description: saveTemplateDescription.trim() || role.description || "",
      permissions: roles.permissionsByRole[role.id] ?? [],
    });
    setSavingRoleId("");
    setSaveTemplateName("");
    setSaveTemplateDescription("");
  };

  return (
    <div>
      <ModuleHeader title="Templates" description="Prebuilt business roles — one click to create a real role from any of these." />

      {justCreated && (
        <div className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-success/20 bg-success/10 px-4 py-3 text-sm text-success">
          <span>&ldquo;{justCreated}&rdquo; was created.</span>
          <Link href="/dashboard/settings/roles" className="flex items-center gap-1 font-medium hover:underline">
            Customize it <ArrowRight size={14} />
          </Link>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {templates.templates.map(template => (
          <div key={template.id} className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Sparkles size={18} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-foreground">{template.name}</p>
                <p className="text-xs text-muted-foreground">{template.permissions.length} permissions</p>
              </div>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">{template.description}</p>

            {canManageRoles && (
              <div className="mt-4 space-y-2 border-t border-border pt-4">
                <Input inputSize="sm" placeholder={template.name} value={customNames[template.id] ?? ""} onChange={e => setCustomNames(prev => ({ ...prev, [template.id]: e.target.value }))} />
                <Button size="sm" className="w-full" onClick={() => handleApply(template.id, template.name)}>
                  Create Role
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>

      {canManageRoles && (
        <div className="mt-8 rounded-2xl border border-border bg-card p-5">
          <div className="mb-3 flex items-center gap-2 text-sm font-medium text-foreground">
            <Save size={15} className="text-muted-foreground" />
            Save a role as a template
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <select className="input" value={savingRoleId} onChange={e => setSavingRoleId(e.target.value)}>
              <option value="">Choose a role…</option>
              {roles.roles.map(role => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
            <Input placeholder="Template name" value={saveTemplateName} onChange={e => setSaveTemplateName(e.target.value)} />
            <Input placeholder="Description" value={saveTemplateDescription} onChange={e => setSaveTemplateDescription(e.target.value)} />
          </div>
          <Button className="mt-3" size="sm" variant="outline" disabled={!savingRoleId || !saveTemplateName.trim()} onClick={handleSaveAsTemplate}>
            Save as Template
          </Button>
        </div>
      )}
    </div>
  );
}
