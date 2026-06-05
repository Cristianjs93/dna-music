import type { Prisma } from '#generated/prisma';
import { auditUserSummarySelect } from '#util/audit/audit.constants';

export const userPublicSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
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
} satisfies Prisma.UserSelect;

export type UserPublic = Prisma.UserGetPayload<{
  select: typeof userPublicSelect;
}>;
