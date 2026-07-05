/**
 * Calixo Platform - Directory Search Types
 */

import type { User, UserStatus } from "./user";

export interface DirectorySearchParams {
  keyword?: string;
  email?: string;
  department?: string;
  title?: string;
  teamId?: string;
  workspaceId?: string;
  status?: UserStatus;
  tag?: string;
}

export interface DirectorySearchResultItem {
  user: User;
  score: number;
  matchedOn: string[];
}

export interface DirectorySearchResult {
  query: DirectorySearchParams;
  total: number;
  items: DirectorySearchResultItem[];
}
