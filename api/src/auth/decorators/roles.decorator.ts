import { SetMetadata } from '@nestjs/common';
import type { Role } from '#generated/prisma';
import { ROLES_KEY } from '../constants/roles.constants';

export const Roles = (...roles: Role[]): ClassDecorator & MethodDecorator =>
  SetMetadata(ROLES_KEY, roles);
