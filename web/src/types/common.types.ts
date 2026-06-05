export type Role = 'ADMIN' | 'OPERADOR';

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

export interface ApiErrorBody {
  message?: string | string[];
  statusCode?: number;
}
