import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Role } from '#generated/prisma';
import { ROLES_KEY } from '../constants/roles.constants';
import { AUTH_DOMAIN_ERRORS } from '../constants/auth-errors.constants';
import type { AuthenticatedUser } from '../interfaces/authenticated-user.interface';
import { domainException } from '#util/errors/domain-error.utils';
import { isDefined } from '#util/parse.utils';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!isDefined(requiredRoles) || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{ user: AuthenticatedUser }>();
    const user = request.user;

    if (!isDefined(user) || !requiredRoles.includes(user.role)) {
      throw domainException(AUTH_DOMAIN_ERRORS.insufficientPermissions);
    }

    return true;
  }
}
