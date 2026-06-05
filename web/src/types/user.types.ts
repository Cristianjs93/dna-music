import type { AuditUserSummary, HeadquarterSummary, Role } from './common.types';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  headquarterId: string | null;
  headquarter: HeadquarterSummary | null;
  createdById: string | null;
  updatedById: string | null;
  createdBy: AuditUserSummary | null;
  updatedBy: AuditUserSummary | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface CreateUserPayload {
  name: string;
  email: string;
  password: string;
  role: Role;
  headquarterId?: string;
}

export interface UpdateUserPayload {
  name?: string;
  email?: string;
  role?: Role;
  headquarterId?: string | null;
}
