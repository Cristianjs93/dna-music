import type { Prisma } from '#generated/prisma';
import { auditUserSummarySelect } from '#util/audit/audit.constants';

export const headquarterPublicSelect = {
  id: true,
  name: true,
  city: true,
  address: true,
  isActive: true,
  createdById: true,
  updatedById: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
  createdBy: { select: auditUserSummarySelect },
  updatedBy: { select: auditUserSummarySelect },
} satisfies Prisma.HeadquarterSelect;

export type HeadquarterPublic = Prisma.HeadquarterGetPayload<{
  select: typeof headquarterPublicSelect;
}>;
