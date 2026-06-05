import type {
  CreateHeadquarterPayload,
  Headquarter,
  UpdateHeadquarterPayload,
} from '@/types/headquarter.types';

export interface IHeadquarterRepository {
  list(): Promise<Headquarter[]>;
  create(payload: CreateHeadquarterPayload): Promise<Headquarter>;
  update(id: string, payload: UpdateHeadquarterPayload): Promise<Headquarter>;
  setStatus(id: string, isActive: boolean): Promise<Headquarter>;
  delete(id: string): Promise<Headquarter>;
}
