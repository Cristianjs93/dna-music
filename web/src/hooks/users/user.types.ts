import type { Role } from '@/types/common.types';

export interface UserFormValues {
  name: string;
  email: string;
  password: string;
  role: Role;
  headquarterId: string | null;
}
