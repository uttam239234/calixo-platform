/**
 * Calixo Platform - Team Service
 *
 * Manages team lifecycle: create, update, archive, manage members.
 * Supports nested teams, department assignment, and team ownership.
 */

import { appLogger } from '@/logging';
import { NotFoundError, ValidationError } from '@/errors';
import type {
  Team,
  CreateTeamRequest,
  UpdateTeamRequest,
  TeamMembership,
  PaginatedTeams,
  PaginatedMembers,
} from '@/access/types';
import type { TeamRepository, TeamMembershipRepository } from '@/access/repositories/interfaces';
import { InMemoryTeamRepository, InMemoryTeamMembershipRepository } from '@/access/repositories/implementations';

export class TeamService {
  private teamRepo: TeamRepository;
  private membershipRepo: TeamMembershipRepository;

  constructor(
    teamRepo?: TeamRepository,
    membershipRepo?: TeamMembershipRepository
  ) {
    this.teamRepo = teamRepo || new InMemoryTeamRepository();
    this.membershipRepo = membershipRepo || new InMemoryTeamMembershipRepository();
  }

  async getTeam(id: string): Promise<Team> {
    const team = await this.teamRepo.getById(id);
    if (!team) throw new NotFoundError('Team');
    return team;
  }

  async getTeamsByOrganization(organizationId: string): Promise<Team[]> {
    return this.teamRepo.getByOrganization(organizationId);
  }

  async getTeamsByWorkspace(workspaceId: string): Promise<Team[]> {
    return this.teamRepo.getByWorkspace(workspaceId);
  }

  async getTeamsByDepartment(departmentId: string): Promise<Team[]> {
    return this.teamRepo.getByDepartment(departmentId);
  }

  async getPaginatedTeams(params: {
    organizationId?: string;
    workspaceId?: string;
    page?: number;
    limit?: number;
    search?: string;
    isArchived?: boolean;
  }): Promise<PaginatedTeams> {
    return this.teamRepo.getPaginated(params);
  }

  async createTeam(data: CreateTeamRequest): Promise<Team> {
    if (!data.name || data.name.trim().length === 0) {
      throw new ValidationError('Team name is required');
    }
    if (!data.organizationId) {
      throw new ValidationError('Organization ID is required');
    }
    if (!data.workspaceId) {
      throw new ValidationError('Workspace ID is required');
    }
    if (!data.ownerId) {
      throw new ValidationError('Team owner is required');
    }

    const team = await this.teamRepo.create(data);

    // Add owner as team member with owner role
    await this.membershipRepo.addMember(team.id, data.ownerId, 'owner', true);

    appLogger.info('TeamService', `Team created: ${team.name} (${team.id})`);
    return team;
  }

  async updateTeam(id: string, data: UpdateTeamRequest): Promise<Team> {
    const team = await this.teamRepo.getById(id);
    if (!team) throw new NotFoundError('Team');
    return this.teamRepo.update(id, data);
  }

  async archiveTeam(id: string): Promise<Team> {
    const team = await this.teamRepo.getById(id);
    if (!team) throw new NotFoundError('Team');
    appLogger.info('TeamService', `Team archived: ${team.name} (${id})`);
    return this.teamRepo.archive(id);
  }

  async unarchiveTeam(id: string): Promise<Team> {
    const team = await this.teamRepo.getById(id);
    if (!team) throw new NotFoundError('Team');
    return this.teamRepo.unarchive(id);
  }

  async deleteTeam(id: string): Promise<boolean> {
    const team = await this.teamRepo.getById(id);
    if (!team) throw new NotFoundError('Team');
    appLogger.info('TeamService', `Team deleted: ${team.name} (${id})`);
    return this.teamRepo.delete(id);
  }

  // ============================================================================
  // Team Members
  // ============================================================================

  async getTeamMembers(teamId: string): Promise<TeamMembership[]> {
    const team = await this.teamRepo.getById(teamId);
    if (!team) throw new NotFoundError('Team');
    return this.membershipRepo.getByTeam(teamId);
  }

  async getPaginatedMembers(params: {
    teamId: string;
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<PaginatedMembers> {
    const team = await this.teamRepo.getById(params.teamId);
    if (!team) throw new NotFoundError('Team');
    return this.membershipRepo.getPaginated(params);
  }

  async addTeamMember(teamId: string, userId: string, role: string = 'member', isManager: boolean = false): Promise<TeamMembership> {
    const team = await this.teamRepo.getById(teamId);
    if (!team) throw new NotFoundError('Team');

    const existing = await this.membershipRepo.getByUserAndTeam(userId, teamId);
    if (existing) {
      throw new ValidationError('User is already a member of this team');
    }

    appLogger.info('TeamService', `Member added to team ${teamId}: user ${userId}`);
    return this.membershipRepo.addMember(teamId, userId, role, isManager);
  }

  async updateTeamMemberRole(membershipId: string, role: string): Promise<TeamMembership> {
    return this.membershipRepo.updateRole(membershipId, role);
  }

  async setTeamMemberAsManager(membershipId: string, isManager: boolean): Promise<TeamMembership> {
    return this.membershipRepo.setManager(membershipId, isManager);
  }

  async removeTeamMember(membershipId: string): Promise<boolean> {
    appLogger.info('TeamService', `Member removed from team: membership ${membershipId}`);
    return this.membershipRepo.removeMember(membershipId);
  }

  async getUserTeams(userId: string): Promise<TeamMembership[]> {
    return this.membershipRepo.getByUser(userId);
  }

  async isTeamMember(userId: string, teamId: string): Promise<boolean> {
    return this.membershipRepo.isMember(userId, teamId);
  }

  async getTeamMemberCount(teamId: string): Promise<number> {
    return this.membershipRepo.countByTeam(teamId);
  }
}

export const teamService = new TeamService();