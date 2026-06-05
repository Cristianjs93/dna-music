import type { AuditUserSummary, HeadquarterSummary } from './common.types';

export type StudentStatus = 'ACTIVO' | 'INACTIVO' | 'RETIRADO';

export interface Student {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  identityCard: string;
  headquarterId: string;
  headquarter: HeadquarterSummary;
  program: string;
  status: StudentStatus;
  enrollmentDate: string;
  createdById: string | null;
  updatedById: string | null;
  createdBy: AuditUserSummary | null;
  updatedBy: AuditUserSummary | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface CreateStudentPayload {
  fullName: string;
  email: string;
  phone: string;
  identityCard: string;
  headquarterId: string;
  program: string;
  status?: StudentStatus;
  enrollmentDate?: string;
}

export interface UpdateStudentPayload {
  fullName?: string;
  email?: string;
  phone?: string;
  identityCard?: string;
  headquarterId?: string;
  program?: string;
  enrollmentDate?: string;
}
