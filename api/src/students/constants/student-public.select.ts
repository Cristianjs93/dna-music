import type { Prisma } from '#generated/prisma';

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
} satisfies Prisma.StudentSelect;

export type StudentPublic = Prisma.StudentGetPayload<{
  select: typeof studentPublicSelect;
}>;
