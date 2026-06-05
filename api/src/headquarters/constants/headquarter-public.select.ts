import type { Prisma } from '#generated/prisma';

export const headquarterPublicSelect = {
  id: true,
  name: true,
  city: true,
  address: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
} satisfies Prisma.HeadquarterSelect;

export type HeadquarterPublic = Prisma.HeadquarterGetPayload<{
  select: typeof headquarterPublicSelect;
}>;
