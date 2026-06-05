import type { StudentStatus } from '@/types/student.types';

export interface StudentFormValues {
  fullName: string;
  email: string;
  phone: string;
  identityCard: string;
  headquarterId: string;
  program: string;
  status: StudentStatus;
  enrollmentDate: Date | null;
}
