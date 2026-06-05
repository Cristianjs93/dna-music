import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '#/prisma/prisma.service';
import type { StatsResponseDto } from './dto/stats-response.dto';

@Injectable()
export class StatsService {
  private readonly logger = new Logger(StatsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Computes all statistics in ONE single SQL query via $queryRaw.
   * @returns The computed statistics.
   */
  async getStats(): Promise<StatsResponseDto> {
    this.logger.log('Computing all statistics via $queryRaw');

    const result = await this.prisma.$queryRaw<[StatsResponseDto]>`
      SELECT 
        -- 1. Students per headquarter
        (
          SELECT json_agg(json_build_object(
            'headquarterId', hq_stats.id,
            'headquarterName', hq_stats.name,
            'count', hq_stats.cnt
          ))
          FROM (
            SELECT h.id, h.name, COALESCE(s_count.cnt, 0)::int as cnt
            FROM headquarters h
            LEFT JOIN (
              SELECT headquarter_id, COUNT(*) as cnt 
              FROM students 
              WHERE deleted_at IS NULL 
              GROUP BY headquarter_id
            ) s_count ON h.id = s_count.headquarter_id
            WHERE h.deleted_at IS NULL
          ) hq_stats
        ) as "studentsPerHeadquarter",

        -- 2. Students per status
        (
          SELECT json_agg(json_build_object(
            'status', status_stats.status,
            'count', status_stats.cnt
          ))
          FROM (
            SELECT status, COUNT(*)::int as cnt
            FROM students
            WHERE deleted_at IS NULL
            GROUP BY status
          ) status_stats
        ) as "studentsPerStatus",

        -- 3. Top active headquarter
        (
          SELECT json_build_object(
            'headquarterId', top_hq.headquarter_id,
            'headquarterName', top_hq.name,
            'activeCount', top_hq.cnt
          )
          FROM (
            SELECT s.headquarter_id, h.name, COUNT(*)::int as cnt
            FROM students s
            JOIN headquarters h ON s.headquarter_id = h.id
            WHERE s.deleted_at IS NULL 
              AND s.status = 'ACTIVO'
              AND h.deleted_at IS NULL
            GROUP BY s.headquarter_id, h.name
            ORDER BY cnt DESC
            LIMIT 1
          ) top_hq
        ) as "topActiveHeadquarter";
    `;

    const stats = result[0];

    this.logger.log(`Stats computed: ${JSON.stringify(stats)}`);

    return {
      studentsPerHeadquarter: stats?.studentsPerHeadquarter ?? [],
      studentsPerStatus: stats?.studentsPerStatus ?? [],
      topActiveHeadquarter: stats?.topActiveHeadquarter ?? null,
    };
  }
}
