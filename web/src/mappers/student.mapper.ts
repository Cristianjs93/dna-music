import type {
  CreateStudentPayload,
  UpdateStudentPayload,
} from '@/types/student.types';
import type { StudentFormValues } from '@/hooks/students/student.types';

function formatEnrollmentDate(date: Date | null): string | undefined {
  return date ? date.toISOString().split('T')[0] : undefined;
}

export function toCreateStudentPayload(
  values: StudentFormValues,
): CreateStudentPayload {
  return {
    fullName: values.fullName,
    email: values.email,
    phone: values.phone,
    identityCard: values.identityCard,
    headquarterId: values.headquarterId,
    program: values.program,
    status: values.status,
    enrollmentDate: formatEnrollmentDate(values.enrollmentDate),
  };
}

export function toUpdateStudentPayload(
  values: StudentFormValues,
  isAdmin: boolean,
): UpdateStudentPayload {
  return {
    fullName: values.fullName,
    email: values.email,
    phone: values.phone,
    identityCard: values.identityCard,
    program: values.program,
    enrollmentDate: formatEnrollmentDate(values.enrollmentDate),
    headquarterId: isAdmin ? values.headquarterId : undefined,
  };
}
