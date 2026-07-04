/**
 * Calixo Platform - Department Definitions
 *
 * System departments and custom department support.
 * Departments are organization-level groupings for teams.
 */

import type { Department } from '@/access/types';
import { generateId, slugify } from '@/shared/utils/string';

// ============================================================================
// System Departments
// ============================================================================

export const SYSTEM_DEPARTMENTS: Array<{
  name: string;
  description: string;
}> = [
  { name: 'Marketing', description: 'Marketing department - campaigns, social media, content, and brand management' },
  { name: 'Admissions', description: 'Admissions department - lead management and enrollment' },
  { name: 'Sales', description: 'Sales department - revenue, deals, and client acquisition' },
  { name: 'Finance', description: 'Finance department - budgeting, accounting, and financial reporting' },
  { name: 'HR', description: 'Human Resources department - personnel, hiring, and employee management' },
  { name: 'Operations', description: 'Operations department - day-to-day business operations' },
  { name: 'IT', description: 'Information Technology department - systems, infrastructure, and support' },
  { name: 'Support', description: 'Customer Support department - client assistance and issue resolution' },
];

// ============================================================================
// Department Factory
// ============================================================================

export function createSystemDepartments(organizationId: string): Department[] {
  const now = new Date().toISOString();
  return SYSTEM_DEPARTMENTS.map((dept, index) => ({
    id: generateId(16),
    organizationId,
    name: dept.name,
    slug: slugify(dept.name),
    description: dept.description,
    isSystem: true,
    isCustom: false,
    isDeleted: false,
    metadata: { order: index },
    createdAt: now,
    updatedAt: now,
  }));
}

export function createCustomDepartment(
  organizationId: string,
  name: string,
  description?: string
): Department {
  const now = new Date().toISOString();
  return {
    id: generateId(16),
    organizationId,
    name,
    slug: slugify(name),
    description,
    isSystem: false,
    isCustom: true,
    isDeleted: false,
    createdAt: now,
    updatedAt: now,
  };
}