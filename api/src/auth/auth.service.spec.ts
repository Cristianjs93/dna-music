import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { Role } from '#generated/prisma';
import { PrismaService } from '#/prisma/prisma.service';
import { AuthService } from './auth.service';
import { AUTH_ERRORS } from './constants/auth-errors.constants';

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let prisma: { user: { findFirst: jest.Mock } };
  let jwtService: { sign: jest.Mock };

  const storedUser = {
    id: 'user-1',
    name: 'Admin',
    email: 'admin@dnamusic.co',
    password: 'hashed-password',
    role: Role.ADMIN,
    headquarterId: null,
    createdById: null,
    updatedById: null,
    createdBy: null,
    updatedBy: null,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    deletedAt: null,
    headquarter: null,
  };

  beforeEach(async () => {
    prisma = {
      user: { findFirst: jest.fn() },
    };
    jwtService = { sign: jest.fn().mockReturnValue('signed-jwt') };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = module.get(AuthService);
    jest.clearAllMocks();
  });

  it('returns JWT and public user on valid credentials', async () => {
    prisma.user.findFirst.mockResolvedValue(storedUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    const result = await service.login({
      email: 'admin@dnamusic.co',
      password: 'Admin123!',
    });

    expect(result.accessToken).toBe('signed-jwt');
    expect(result.user).toEqual({
      id: storedUser.id,
      name: storedUser.name,
      email: storedUser.email,
      role: storedUser.role,
      headquarterId: storedUser.headquarterId,
      createdById: storedUser.createdById,
      updatedById: storedUser.updatedById,
      createdBy: storedUser.createdBy,
      updatedBy: storedUser.updatedBy,
      createdAt: storedUser.createdAt,
      updatedAt: storedUser.updatedAt,
      deletedAt: storedUser.deletedAt,
      headquarter: storedUser.headquarter,
    });
    expect(jwtService.sign).toHaveBeenCalledWith({
      sub: storedUser.id,
      email: storedUser.email,
      role: storedUser.role,
      headquarterId: storedUser.headquarterId,
    });
  });

  it('throws generic error when email is not found', async () => {
    prisma.user.findFirst.mockResolvedValue(null);
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    await expect(service.login({ email: 'unknown@dnamusic.co', password: 'any' })).rejects.toThrow(
      new UnauthorizedException(AUTH_ERRORS.invalidCredentials),
    );
  });

  it('throws generic error when password is wrong', async () => {
    prisma.user.findFirst.mockResolvedValue(storedUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    await expect(
      service.login({ email: storedUser.email, password: 'wrong-password' }),
    ).rejects.toThrow(new UnauthorizedException(AUTH_ERRORS.invalidCredentials));
  });
});
