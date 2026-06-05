import type { Prisma } from '#generated/prisma';

export const userPublicSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
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
} satisfies Prisma.UserSelect;

export type UserPublic = Prisma.UserGetPayload<{
  select: typeof userPublicSelect;
}>;
