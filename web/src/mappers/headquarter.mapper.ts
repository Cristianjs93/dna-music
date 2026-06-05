import type {
  CreateHeadquarterPayload,
  UpdateHeadquarterPayload,
} from '@/types/headquarter.types';
import type { HeadquarterFormValues } from '@/hooks/headquarters/headquarter.types';

export function toCreateHeadquarterPayload(
  values: HeadquarterFormValues,
): CreateHeadquarterPayload {
  return {
    name: values.name,
    city: values.city,
    address: values.address,
    isActive: values.isActive,
  };
}

export function toUpdateHeadquarterPayload(
  values: HeadquarterFormValues,
): UpdateHeadquarterPayload {
  return {
    name: values.name,
    city: values.city,
    address: values.address,
  };
}
