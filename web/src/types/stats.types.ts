import type { StudentStatus } from './student.types';

export interface StatsResponse {
  studentsPerHeadquarter: {
    headquarterId: string;
    headquarterName: string;
    count: number;
  }[];
  studentsPerStatus: {
    status: StudentStatus;
    count: number;
  }[];
  topActiveHeadquarter: {
    headquarterId: string;
    headquarterName: string;
    activeCount: number;
  } | null;
}
