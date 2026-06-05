import type { Prisma } from '#generated/prisma';

/** Minimal user projection for audit fields in API responses. */
export const auditUserSummarySelect = {
  id: true,
  name: true,
  email: true,
} satisfies Prisma.UserSelect;

export type AuditUserSummary = Prisma.UserGetPayload<{
  select: typeof auditUserSummarySelect;
}>;

export function auditOnCreate(actorId: string): { createdById: string; updatedById: string } {
  return { createdById: actorId, updatedById: actorId };
}

export function auditOnUpdate(actorId: string): { updatedById: string } {
  return { updatedById: actorId };
}
