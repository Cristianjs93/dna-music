import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Role, StudentStatus } from '#generated/prisma';
import type { AuthenticatedUser } from '#/auth/interfaces/authenticated-user.interface';
import { PrismaService } from '#/prisma/prisma.service';
import type { CreateStudentDto } from './dto/create-student.dto';
import { StudentsService } from './students.service';

describe('StudentsService', () => {
  let service: StudentsService;
  let prisma: {
    student: {
      findMany: jest.Mock;
      findFirst: jest.Mock;
      create: jest.Mock;
    };
    headquarter: { findFirst: jest.Mock };
  };

  const bogotaId = 'hq-bogota';
  const medellinId = 'hq-medellin';

  const admin: AuthenticatedUser = {
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

  const operatorBogota: AuthenticatedUser = {
    id: 'op-bog',
    name: 'Operador Bogotá',
    email: 'operador.bog@dnamusic.co',
    role: Role.OPERADOR,
    headquarterId: bogotaId,
    createdById: null,
    updatedById: null,
    createdBy: null,
    updatedBy: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    headquarter: { id: bogotaId, name: 'Sede Bogotá', city: 'Bogotá' },
  };

  const baseCreateDto: CreateStudentDto = {
    fullName: 'María Test',
    email: 'maria.test@example.com',
    phone: '3001111111',
    identityCard: '1099999999',
    program: 'Piano',
    headquarterId: bogotaId,
  };

  const createdStudent = {
    id: 'student-1',
    ...baseCreateDto,
    status: StudentStatus.ACTIVO,
    enrollmentDate: new Date(),
    createdById: operatorBogota.id,
    updatedById: operatorBogota.id,
    createdBy: {
      id: operatorBogota.id,
      name: operatorBogota.name,
      email: operatorBogota.email,
    },
    updatedBy: {
      id: operatorBogota.id,
      name: operatorBogota.name,
      email: operatorBogota.email,
    },
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    headquarter: { id: bogotaId, name: 'Sede Bogotá', city: 'Bogotá' },
  };

  beforeEach(async () => {
    prisma = {
      student: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
      },
      headquarter: { findFirst: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [StudentsService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get(StudentsService);
    prisma.headquarter.findFirst.mockResolvedValue({ id: bogotaId, isActive: true });
  });

  describe('create', () => {
    it('rejects OPERADOR when headquarterId does not match their branch', async () => {
      const dto: CreateStudentDto = { ...baseCreateDto, headquarterId: medellinId };

      await expect(service.create(dto, operatorBogota)).rejects.toThrow(ForbiddenException);
      await expect(service.create(dto, operatorBogota)).rejects.toThrow(
        'headquarterId must match your assigned branch',
      );
      expect(prisma.student.create).not.toHaveBeenCalled();
    });

    it('creates a student for OPERADOR when headquarterId matches their branch', async () => {
      prisma.student.create.mockResolvedValue(createdStudent);

      const result = await service.create(baseCreateDto, operatorBogota);

      expect(result).toEqual(createdStudent);
      expect(prisma.student.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            headquarterId: bogotaId,
            createdById: operatorBogota.id,
            updatedById: operatorBogota.id,
          }),
        }),
      );
    });

    it('requires headquarterId for ADMIN', async () => {
      const dto = (({ headquarterId: _hq, ...rest }) => rest)(
        baseCreateDto,
      ) as unknown as CreateStudentDto;

      await expect(service.create(dto, admin)).rejects.toThrow(NotFoundException);
      await expect(service.create(dto, admin)).rejects.toThrow('Headquarter not found');
    });
  });

  describe('findAll', () => {
    it('scopes OPERADOR list queries to their headquarter', async () => {
      prisma.student.findMany.mockResolvedValue([createdStudent]);

      await service.findAll(operatorBogota);

      expect(prisma.student.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { deletedAt: null, headquarterId: bogotaId },
        }),
      );
    });

    it('does not filter by headquarter for ADMIN', async () => {
      prisma.student.findMany.mockResolvedValue([createdStudent]);

      await service.findAll(admin);

      expect(prisma.student.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { deletedAt: null },
        }),
      );
    });
  });

  describe('findOne', () => {
    it('denies OPERADOR access to students from another branch', async () => {
      prisma.student.findFirst.mockResolvedValue({
        ...createdStudent,
        headquarterId: medellinId,
      });

      await expect(service.findOne('student-1', operatorBogota)).rejects.toThrow(
        ForbiddenException,
      );
      await expect(service.findOne('student-1', operatorBogota)).rejects.toThrow(
        'You can only access students from your assigned branch',
      );
    });

    it('allows ADMIN to read any student', async () => {
      prisma.student.findFirst.mockResolvedValue({
        ...createdStudent,
        headquarterId: medellinId,
      });

      const result = await service.findOne('student-1', admin);

      expect(result.headquarterId).toBe(medellinId);
    });
  });
});
