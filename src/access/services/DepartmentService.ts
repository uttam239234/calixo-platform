/**
 * Calixo Platform - Department Service
 *
 * Manages department lifecycle: create, update, delete.
 * Supports system departments and custom departments.
 */

import { appLogger } from '@/logging';
import { NotFoundError, ValidationError } from '@/errors';
import type { Department, CreateDepartmentRequest, UpdateDepartmentRequest } from '@/access/types';
import type { DepartmentRepository } from '@/access/repositories/interfaces';
import { InMemoryDepartmentRepository } from '@/access/repositories/implementations';
import { createSystemDepartments } from '@/access/config/departments';

export class DepartmentService {
  private deptRepo: DepartmentRepository;

  constructor(deptRepo?: DepartmentRepository) {
    this.deptRepo = deptRepo || new InMemoryDepartmentRepository();
  }

  async getDepartment(id: string): Promise<Department> {
    const dept = await this.deptRepo.getById(id);
    if (!dept) throw new NotFoundError('Department');
    return dept;
  }

  async getDepartmentsByOrganization(organizationId: string): Promise<Department[]> {
    return this.deptRepo.getByOrganization(organizationId);
  }

  async getSystemDepartments(organizationId: string): Promise<Department[]> {
    return this.deptRepo.getSystemDepartments(organizationId);
  }

  async getCustomDepartments(organizationId: string): Promise<Department[]> {
    return this.deptRepo.getCustomDepartments(organizationId);
  }

  async initializeSystemDepartments(organizationId: string): Promise<Department[]> {
    const existing = await this.deptRepo.getSystemDepartments(organizationId);
    if (existing.length > 0) {
      return existing;
    }

    const departments = createSystemDepartments(organizationId);
    const created: Department[] = [];
    for (const dept of departments) {
      const existingDept = await this.deptRepo.getBySlug(organizationId, dept.slug);
      if (!existingDept) {
        // Use the repository to create
        const createdDept = await this.deptRepo.create({
          organizationId: dept.organizationId,
          name: dept.name,
          description: dept.description,
        });
        created.push(createdDept);
      }
    }

    appLogger.info('DepartmentService', `System departments initialized for org ${organizationId}`);
    return created;
  }

  async createDepartment(data: CreateDepartmentRequest): Promise<Department> {
    if (!data.name || data.name.trim().length === 0) {
      throw new ValidationError('Department name is required');
    }
    if (!data.organizationId) {
      throw new ValidationError('Organization ID is required');
    }

    const existing = await this.deptRepo.getBySlug(data.organizationId, data.name.toLowerCase().replace(/\s+/g, '-'));
    if (existing) {
      throw new ValidationError('A department with this name already exists');
    }

    appLogger.info('DepartmentService', `Department created: ${data.name}`);
    return this.deptRepo.create(data);
  }

  async updateDepartment(id: string, data: UpdateDepartmentRequest): Promise<Department> {
    const dept = await this.deptRepo.getById(id);
    if (!dept) throw new NotFoundError('Department');
    if (dept.isSystem) {
      throw new ValidationError('Cannot modify system departments');
    }
    return this.deptRepo.update(id, data);
  }

  async deleteDepartment(id: string): Promise<boolean> {
    const dept = await this.deptRepo.getById(id);
    if (!dept) throw new NotFoundError('Department');
    if (dept.isSystem) {
      throw new ValidationError('Cannot delete system departments');
    }
    appLogger.info('DepartmentService', `Department deleted: ${dept.name} (${id})`);
    return this.deptRepo.delete(id);
  }

  async getDepartmentCount(organizationId: string): Promise<number> {
    return this.deptRepo.count(organizationId);
  }
}

export const departmentService = new DepartmentService();