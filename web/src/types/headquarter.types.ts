import type { AuditUserSummary } from './common.types';

export interface Headquarter {
  id: string;
  name: string;
  city: string;
  address: string;
  isActive: boolean;
  createdById: string | null;
  updatedById: string | null;
  createdBy: AuditUserSummary | null;
  updatedBy: AuditUserSummary | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface CreateHeadquarterPayload {
  name: string;
  city: string;
  address: string;
  isActive?: boolean;
}

export interface UpdateHeadquarterPayload {
  name?: string;
  city?: string;
  address?: string;
}
