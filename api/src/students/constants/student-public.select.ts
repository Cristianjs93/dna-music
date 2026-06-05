import type { Prisma } from '#generated/prisma';
import { auditUserSummarySelect } from '#util/audit/audit.constants';

export const studentPublicSelect = {
  id: true,
  fullName: true,
  email: true,
  phone: true,
  identityCard: true,
  program: true,
  status: true,
  enrollmentDate: true,
  headquarterId: true,
  createdById: true,
  updatedById: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
  headquarter: {
    select: {
      id: true,
      name: true,
      city: true,
    },
  },
  createdBy: { select: auditUserSummarySelect },
  updatedBy: { select: auditUserSummarySelect },
} satisfies Prisma.StudentSelect;

export type StudentPublic = Prisma.StudentGetPayload<{
  select: typeof studentPublicSelect;
}>;
