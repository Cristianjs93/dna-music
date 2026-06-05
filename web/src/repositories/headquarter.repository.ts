import type { IHeadquarterRepository } from './interfaces/headquarter.repository';
import * as headquartersService from '@/services/headquarters.service';

export const headquarterRepository: IHeadquarterRepository = {
  list: headquartersService.listHeadquarters,
  create: headquartersService.createHeadquarter,
  update: headquartersService.updateHeadquarter,
  setStatus: headquartersService.setHeadquarterStatus,
  delete: headquartersService.deleteHeadquarter,
};
