export type Role = 'ADMIN' | 'OPERADOR';

export type StudentStatus = 'ACTIVO' | 'INACTIVO' | 'RETIRADO';

export interface HeadquarterSummary {
  id: string;
  name: string;
  city: string;
}

export interface AuditUserSummary {
  id: string;
  name: string;
  email: string;
}

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

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface StatsResponse {
  studentsPerHeadquarter: {
    headquarterId: string;
    headquarterName: string;
    count: number;
  }[];
  studentsPerStatus: {
    status: StudentStatus;
    count: number;
  }[];
  topActiveHeadquarter: {
    headquarterId: string;
    headquarterName: string;
    activeCount: number;
  } | null;
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

export interface ApiErrorBody {
  message?: string | string[];
  statusCode?: number;
}
