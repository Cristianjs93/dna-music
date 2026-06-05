import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { Role } from '#generated/prisma';
import type { AuthenticatedUser } from '#/auth/interfaces/authenticated-user.interface';
import { ROLES_KEY } from '../constants/roles.constants';
import { RolesGuard } from './roles.guard';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: { getAllAndOverride: jest.Mock };

  const adminUser: AuthenticatedUser = {
    id: 'admin-1',
    name: 'Admin',
    email: 'admin@dnamusic.co',
    role: Role.ADMIN,
    headquarterId: null,
    createdById: null,
    updatedById: null,
    createdBy: null,
    updatedBy: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    headquarter: null,
  };

  const buildContext = (user?: AuthenticatedUser): ExecutionContext =>
    ({
      getHandler: () => ({}),
      getClass: () => ({}),
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
    }) as ExecutionContext;

  beforeEach(async () => {
    reflector = { getAllAndOverride: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [RolesGuard, { provide: Reflector, useValue: reflector }],
    }).compile();

    guard = module.get(RolesGuard);
  });

  it('allows access when no roles are required', () => {
    reflector.getAllAndOverride.mockReturnValue(undefined);

    expect(guard.canActivate(buildContext(adminUser))).toBe(true);
    expect(reflector.getAllAndOverride).toHaveBeenCalledWith(ROLES_KEY, expect.any(Array));
  });

  it('allows access when user has a required role', () => {
    reflector.getAllAndOverride.mockReturnValue([Role.ADMIN]);

    expect(guard.canActivate(buildContext(adminUser))).toBe(true);
  });

  it('denies access when user lacks the required role', () => {
    reflector.getAllAndOverride.mockReturnValue([Role.ADMIN]);
    const operator: AuthenticatedUser = {
      ...adminUser,
      role: Role.OPERADOR,
      headquarterId: 'hq-1',
    };

    expect(() => guard.canActivate(buildContext(operator))).toThrow(ForbiddenException);
    expect(() => guard.canActivate(buildContext(operator))).toThrow('Insufficient permissions');
  });

  it('denies access when user is missing on the request', () => {
    reflector.getAllAndOverride.mockReturnValue([Role.ADMIN]);

    expect(() => guard.canActivate(buildContext(undefined))).toThrow(ForbiddenException);
  });
});
