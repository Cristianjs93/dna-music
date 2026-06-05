import { Test, TestingModule } from '@nestjs/testing';
import { StudentStatus } from '#generated/prisma';
import { PrismaService } from '#/prisma/prisma.service';
import { StatsService } from './stats.service';

describe('StatsService', () => {
  let service: StatsService;
  let prisma: { $queryRaw: jest.Mock };

  beforeEach(async () => {
    prisma = { $queryRaw: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [StatsService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get(StatsService);
  });

  it('returns aggregated stats from a single queryRaw call', async () => {
    const rawStats = {
      studentsPerHeadquarter: [
        { headquarterId: 'hq-1', headquarterName: 'Sede Bogotá', count: 2 },
        { headquarterId: 'hq-2', headquarterName: 'Sede Medellín', count: 3 },
      ],
      studentsPerStatus: [
        { status: StudentStatus.ACTIVO, count: 4 },
        { status: StudentStatus.INACTIVO, count: 1 },
      ],
      topActiveHeadquarter: {
        headquarterId: 'hq-2',
        headquarterName: 'Sede Medellín',
        activeCount: 2,
      },
    };

    prisma.$queryRaw.mockResolvedValue([rawStats]);

    const result = await service.getStats();

    expect(prisma.$queryRaw).toHaveBeenCalledTimes(1);
    expect(result).toEqual(rawStats);
  });

  it('falls back to empty collections when query returns null fields', async () => {
    prisma.$queryRaw.mockResolvedValue([
      {
        studentsPerHeadquarter: null,
        studentsPerStatus: null,
        topActiveHeadquarter: null,
      },
    ]);

    const result = await service.getStats();

    expect(result).toEqual({
      studentsPerHeadquarter: [],
      studentsPerStatus: [],
      topActiveHeadquarter: null,
    });
  });
});
