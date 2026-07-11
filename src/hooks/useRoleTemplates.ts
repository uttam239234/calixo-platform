"use client";

/**
 * Calixo Roles & Permissions - template gallery state.
 * The only place allowed to call `permissionTemplateRegistry` — components
 * never import it directly. Templates are a shared, global catalog (like
 * roles) — not organization data.
 */

import { useCallback, useEffect, useState } from "react";
import { permissionTemplateRegistry } from "@/core/platform/access";
import type { PermissionTemplateDefinition } from "@/core/platform/access";
import { sessionCreatedRoleIds } from "@/features/settings/roles/sessionCreatedRoles";

export function useRoleTemplates() {
  const [templates, setTemplates] = useState<PermissionTemplateDefinition[]>([]);

  const refresh = useCallback(() => {
    setTemplates(permissionTemplateRegistry.list());
  }, []);

  useEffect(() => {
    (async () => {
      refresh();
    })();
  }, [refresh]);

  const applyTemplate = useCallback(
    async (templateId: string, roleName?: string) => {
      const role = await permissionTemplateRegistry.applyTemplate(templateId, roleName);
      sessionCreatedRoleIds.add(role.id);
      return role;
    },
    []
  );

  /** Turns an existing role's current permission set back into a reusable template. */
  const saveAsTemplate = useCallback(
    (input: { id: string; name: string; description: string; permissions: string[] }) => {
      permissionTemplateRegistry.register(input);
      refresh();
    },
    [refresh]
  );

  const lookup = useCallback((id: string) => templates.find(t => t.id === id), [templates]);

  return { templates, applyTemplate, saveAsTemplate, lookup, refresh };
}

export type UseRoleTemplatesResult = ReturnType<typeof useRoleTemplates>;
